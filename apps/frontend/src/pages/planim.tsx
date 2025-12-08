import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type {
  DatesSetArg,
  EventClickArg,
  EventContentArg,
} from '@fullcalendar/core';
import { env } from '@/config/env';
import { Button } from '@/components/ui/button';
import { useInstructors, useInstructorSchedule } from '@/services/instructors';
import { useExamDetail } from '@/services/exams';
import { ExamDetailPanel } from '@/components/panels/exam-detail-panel';

type CalendarView = 'timeGridWeek' | 'timeGridTwoWeek';

type CalendarRange = {
  baslangic?: string;
  bitis?: string;
};

type CalendarEvent = {
  id: string;
  title: string;
  start?: string;
  end?: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps: {
    tur: 'sinav' | 'musait-degil';
    examId?: string;
    altBaslik?: string;
    aciklama?: string;
    gozetmenler?: string;
    sorumluOgretimUyesi?: string;
  };
};

const EXAM_COLOR = 'hsl(var(--primary))';
const UNAVAILABLE_COLOR = '#9ca3af';
const CONFLICT_COLOR = '#ef4444';

export default function PlanimPage() {
  const { data: instructors, isLoading: instructorsLoading } = useInstructors();
  const calendarRef = useRef<FullCalendar>(null);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(
    null,
  );
  const [calendarView, setCalendarView] = useState<CalendarView>('timeGridWeek');
  const [calendarRange, setCalendarRange] = useState<CalendarRange>(() => {
    const now = new Date();
    const start = startOfWeek(now);
    const end = addDays(start, 7);
    return {
      baslangic: toISO(start),
      bitis: toISO(end),
    };
  });
  
  // Görünüm değiştiğinde FullCalendar'ın görünümünü güncelle
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(calendarView);
    }
  }, [calendarView]);
  
  // Görünüm değiştiğinde aralığı güncellemek için ayrı bir effect
  useEffect(() => {
    const now = new Date();
    const start = startOfWeek(now);
    const end = addDays(start, calendarView === 'timeGridTwoWeek' ? 14 : 7);
    const newRange = {
      baslangic: toISO(start),
      bitis: toISO(end),
    };
    
    setCalendarRange((prevRange) => {
      // Sadece gerçekten değiştiyse güncelle
      if (
        prevRange.baslangic !== newRange.baslangic ||
        prevRange.bitis !== newRange.bitis
      ) {
        return newRange;
      }
      return prevRange;
    });
  }, [calendarView]);

  useEffect(() => {
    if (!selectedInstructorId && instructors && instructors.length > 0) {
      setSelectedInstructorId(instructors[0].id);
    }
  }, [instructors, selectedInstructorId]);

  const {
    data: schedule,
    isLoading: scheduleLoading,
    isFetching: scheduleFetching,
  } = useInstructorSchedule(selectedInstructorId, calendarRange);

  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const {
    data: selectedExamDetail,
    isFetching: detailFetching,
    status: detailStatus,
  } = useExamDetail(selectedExamId ?? undefined);

  const events = useMemo<CalendarEvent[]>(() => {
    if (!schedule || !selectedInstructorId) return [];
    const sinavEvents =
      schedule.sinavlar?.map((exam) => {
        // Sorumlu öğretim üyesini al (seçili gözetmen değilse)
        const sorumluOgretimUyesi = exam.ogretimUyesi?.ad && exam.ogretimUyesiId !== selectedInstructorId
          ? exam.ogretimUyesi.ad
          : undefined;
        
        // Diğer gözetmenleri al (seçili gözetmen hariç)
        const digerGozetmenler = exam.gozetmenler
          ?.filter((g) => g.ogretimUyesiId !== selectedInstructorId && g.gozetmen?.ad)
          .map((g) => g.gozetmen?.ad)
          .filter(Boolean) ?? [];
        
        // Gözetmen bilgisini kısalt (maksimum 2 isim göster, geri kalanı için "...")
        const gozetmenBilgisi = digerGozetmenler.length > 0 
          ? digerGozetmenler.length <= 2
            ? digerGozetmenler.join(', ')
            : `${digerGozetmenler.slice(0, 2).join(', ')} +${digerGozetmenler.length - 2}`
          : undefined;
        
        // Derslik bilgisini al - önce yeni derslikler array'ini kontrol et, yoksa eski derslik'i kullan
        const derslikler = exam.derslikler && exam.derslikler.length > 0
          ? exam.derslikler.map((dr) => dr.derslik?.ad).filter(Boolean).join(', ')
          : exam.derslik?.ad;
        const derslikAdi = derslikler || 'Derslik Bekleniyor';
        
        // Bina bilgisini al
        const binaBilgisi = exam.derslikler && exam.derslikler.length > 0
          ? exam.derslikler.map((dr) => dr.derslik?.bina).filter(Boolean).join(', ')
          : exam.derslik?.bina;
        
        return {
          id: `exam-${exam.id}`,
          title: `${exam.ders?.kod ?? 'Sınav'} • ${derslikAdi}`,
          start: combineDateTime(exam.tarih, exam.baslangic),
          end: combineDateTime(exam.tarih, exam.bitis),
          backgroundColor: EXAM_COLOR,
          borderColor: EXAM_COLOR,
          extendedProps: {
            tur: 'sinav' as const,
            examId: exam.id,
            altBaslik: exam.ders?.ad,
            aciklama: binaBilgisi,
            gozetmenler: gozetmenBilgisi,
            sorumluOgretimUyesi: sorumluOgretimUyesi,
          },
        };
      }) ?? [];

    const unavailabilityEvents =
      schedule.musaitDegiller?.map((kayit) => ({
        id: `unavailable-${kayit.id}`,
        title: kayit.neden ?? 'Müsait Değil',
        start: kayit.baslangic,
        end: kayit.bitis,
        backgroundColor: kayit.overrideEdildi ? CONFLICT_COLOR : UNAVAILABLE_COLOR,
        borderColor: kayit.overrideEdildi ? CONFLICT_COLOR : UNAVAILABLE_COLOR,
        extendedProps: {
          tur: 'musait-degil' as const,
          altBaslik: kayit.overrideEdildi ? 'Override edildi' : undefined,
          aciklama: kayit.kaynak ? `Kaynak: ${formatSource(kayit.kaynak)}` : undefined,
        },
      })) ?? [];

    return [...sinavEvents, ...unavailabilityEvents];
  }, [schedule, selectedInstructorId]);

  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    // Sadece gerçekten değiştiyse güncelle - sonsuz döngüyü önlemek için
    setCalendarRange((prevRange) => {
      const newRange = {
        baslangic: arg.startStr,
        bitis: arg.endStr,
      };
      
      // Mevcut aralıkla karşılaştır, sadece farklıysa güncelle
      if (
        prevRange.baslangic !== newRange.baslangic ||
        prevRange.bitis !== newRange.bitis
      ) {
        return newRange;
      }
      return prevRange;
    });
  }, []);

  const handleEventClick = useCallback(
    (arg: EventClickArg) => {
      const tur = arg.event.extendedProps.tur;
      if (tur === 'sinav') {
        setSelectedExamId(arg.event.extendedProps.examId as string);
      }
    },
    [setSelectedExamId],
  );

  const renderEventContent = useCallback((arg: EventContentArg) => {
    const { event } = arg;
    const altBaslik = event.extendedProps.altBaslik as string | undefined;
    const aciklama = event.extendedProps.aciklama as string | undefined;
    const gozetmenler = event.extendedProps.gozetmenler as string | undefined;
    const sorumluOgretimUyesi = event.extendedProps.sorumluOgretimUyesi as string | undefined;
    return (
      <div className="flex flex-col text-xs leading-tight p-0.5 overflow-hidden">
        <span className="font-semibold truncate">{event.title}</span>
        {altBaslik ? <span className="truncate text-[10px]">{altBaslik}</span> : null}
        {aciklama ? <span className="truncate text-[9px] opacity-80">{aciklama}</span> : null}
        {sorumluOgretimUyesi ? (
          <span className="truncate text-[8px] opacity-90 font-medium" title={sorumluOgretimUyesi}>
            📚 Sorumlu: {sorumluOgretimUyesi}
          </span>
        ) : null}
        {gozetmenler ? (
          <span className="truncate text-[8px] opacity-90 font-medium" title={gozetmenler}>
            👥 Gözetmenler: {gozetmenler}
          </span>
        ) : null}
      </div>
    );
  }, []);

  const exportIcs = useCallback(() => {
    if (!selectedInstructorId) return;
    const params = new URLSearchParams();
    if (calendarRange.baslangic) params.append('baslangic', calendarRange.baslangic);
    if (calendarRange.bitis) params.append('bitis', calendarRange.bitis);
    window.open(
      `${env.apiUrl}/instructors/${selectedInstructorId}/schedule.ics?${params.toString()}`,
      '_blank',
    );
  }, [calendarRange.baslangic, calendarRange.bitis, selectedInstructorId]);

  const detailLoading = detailStatus === 'pending' || detailFetching;

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Planım (Gözetmen Takvimi)
          </h1>
          <p className="text-muted-foreground">
            Sınav ve müsait değil kayıtlarının haftalık/aylık görünümü.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Gözetmen</span>
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={selectedInstructorId ?? ''}
              onChange={(event) => setSelectedInstructorId(event.target.value)}
              disabled={instructorsLoading || !instructors?.length}
            >
              {!instructors?.length && <option>Yükleniyor…</option>}
              {instructors?.map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.ad}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1 rounded-md border px-1 py-1">
            <ToggleButton
              active={calendarView === 'timeGridWeek'}
              onClick={() => {
                setCalendarView('timeGridWeek');
                calendarRef.current?.getApi().changeView('timeGridWeek');
              }}
            >
              Haftalık
            </ToggleButton>
            <ToggleButton
              active={calendarView === 'timeGridTwoWeek'}
              onClick={() => {
                setCalendarView('timeGridTwoWeek');
                calendarRef.current?.getApi().changeView('timeGridTwoWeek');
              }}
            >
              İki Haftalık
            </ToggleButton>
          </div>
          <Button onClick={exportIcs} disabled={!selectedInstructorId}>
            Takvimi .ICS indir
          </Button>
        </div>
      </header>

      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <Legend />
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        {selectedInstructorId ? (
          <FullCalendar
            ref={calendarRef}
            height="auto"
            plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
            initialView={calendarView}
            headerToolbar={false}
            events={events}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            datesSet={handleDatesSet}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }}
            slotMinTime="08:30:00"
            slotMaxTime="20:00:00"
            firstDay={1}
            weekends={false}
            hiddenDays={[0]}
            locale="tr"
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }}
            navLinks
            nowIndicator
            selectable={false}
            aspectRatio={1.8}
            eventDisplay="block"
            eventMinHeight={60}
            eventMinWidth={120}
            views={{
              timeGridWeek: {
                duration: { weeks: 1 },
                slotMinTime: '08:30:00',
                slotMaxTime: '20:00:00',
              },
              timeGridTwoWeek: {
                type: 'timeGridWeek',
                duration: { weeks: 2 },
                slotMinTime: '08:30:00',
                slotMaxTime: '20:00:00',
              },
            }}
          />
        ) : (
          <div className="px-6 py-10 text-center text-muted-foreground">
            Önce bir gözetmen seçiniz.
          </div>
        )}
        {(scheduleLoading || scheduleFetching || instructorsLoading) && (
          <div className="border-t px-6 py-2 text-xs text-muted-foreground">
            Veriler güncelleniyor…
          </div>
        )}
      </div>

      <ExamDetailPanel
        exam={selectedExamDetail}
        conflicts={selectedExamDetail?.cakismalar ?? null}
        loading={detailLoading}
        updating={false}
        open={Boolean(selectedExamId)}
        onClose={() => setSelectedExamId(null)}
      />
    </section>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
      }`}
    >
      {children}
    </button>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
      <LegendItem renk={EXAM_COLOR} etiket="Gözetmen Olduğu Sınav" />
      <LegendItem renk={UNAVAILABLE_COLOR} etiket="Müsait Değil Kaydı" />
      <LegendItem renk={CONFLICT_COLOR} etiket="Override Edilen / Çakışan" />
    </div>
  );
}

function LegendItem({ renk, etiket }: { renk: string; etiket: string }) {
  return (
    <span className="flex items-center gap-2">
      <span
        className="inline-flex h-3 w-3 rounded-full"
        style={{ backgroundColor: renk }}
      />
      <span>{etiket}</span>
    </span>
  );
}

function combineDateTime(tarih?: string | null, saat?: string | null) {
  if (!tarih || !saat) {
    return undefined;
  }
  const sanitized = saat.length === 5 ? `${saat}:00` : saat;
  return `${tarih}T${sanitized}`;
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  // Pazartesi başlangıç (1 = Pazartesi, 0 = Pazar)
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function toISO(date: Date) {
  return date.toISOString();
}

function formatSource(source: string) {
  switch (source) {
    case 'manuel':
      return 'Manuel';
    case 'csv':
      return 'CSV';
    case 'kural':
      return 'Kural';
    default:
      return source;
  }
}
