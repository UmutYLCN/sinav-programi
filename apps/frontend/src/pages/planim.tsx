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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { env } from '@/config/env';
import { Button } from '@/components/ui/button';
import { useInstructors, useInstructorSchedule } from '@/services/instructors';
import { useExamDetail } from '@/services/exams';
import { ExamDetailPanel } from '@/components/panels/exam-detail-panel';
import { cn } from '@/lib/utils';

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

// Yerel tarih string'i üretir — UTC dönüşümü olmadan (YYYY-MM-DD)
function localDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Bugünün yerel tarih string'i
function todayStr(): string {
  return localDateStr(new Date());
}

// Bugünün haftasının Pazartesi'sini yerel olarak hesaplar
function startOfCurrentWeekStr(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Pazar, 1=Pazartesi, ...
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return localDateStr(monday);
}

export default function PlanimPage() {
  const { data: instructors, isLoading: instructorsLoading } = useInstructors();
  const calendarRef = useRef<FullCalendar>(null);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(null);
  const [calendarView, setCalendarView] = useState<CalendarView>('timeGridWeek');
  const [displayRange, setDisplayRange] = useState<string>('');

  // Takvim aralığı — yerel YYYY-MM-DD formatı kullanılır, UTC dönüşümü yoktur
  const [calendarRange, setCalendarRange] = useState<CalendarRange>(() => {
    const mondayStr = startOfCurrentWeekStr();
    const endDate = new Date(mondayStr);
    endDate.setDate(endDate.getDate() + 7);
    return {
      baslangic: mondayStr,
      bitis: localDateStr(endDate),
    };
  });

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
        const sorumluOgretimUyesi =
          exam.ogretimUyesi?.ad && exam.ogretimUyesiId !== selectedInstructorId
            ? exam.ogretimUyesi.ad
            : undefined;

        const digerGozetmenler =
          exam.gozetmenler
            ?.filter((g) => g.ogretimUyesiId !== selectedInstructorId && g.gozetmen?.ad)
            .map((g) => g.gozetmen?.ad)
            .filter(Boolean) ?? [];

        const gozetmenBilgisi =
          digerGozetmenler.length > 0
            ? digerGozetmenler.length <= 2
              ? digerGozetmenler.join(', ')
              : `${digerGozetmenler.slice(0, 2).join(', ')} +${digerGozetmenler.length - 2}`
            : undefined;

        const derslikler =
          exam.derslikler && exam.derslikler.length > 0
            ? exam.derslikler.map((dr) => dr.derslik?.ad).filter(Boolean).join(', ')
            : exam.derslik?.ad;
        const derslikAdi = derslikler || 'Derslik Bekleniyor';

        const binaBilgisi =
          exam.derslikler && exam.derslikler.length > 0
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
            sorumluOgretimUyesi,
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
    // arg.start / arg.end → Date nesneleri, yerel formata çevir
    const startStr = localDateStr(arg.start);
    // FullCalendar end exclusive — görüntü için son günü geri al
    const displayEnd = new Date(arg.end);
    displayEnd.setDate(displayEnd.getDate() - 1);
    const endStr = localDateStr(arg.end);

    // Görüntülenen aralık etiketi
    setDisplayRange(formatDateRange(arg.start, displayEnd));

    setCalendarRange((prev) => {
      if (prev.baslangic !== startStr || prev.bitis !== endStr) {
        return { baslangic: startStr, bitis: endStr };
      }
      return prev;
    });
  }, []);

  const handleEventClick = useCallback((arg: EventClickArg) => {
    if (arg.event.extendedProps.tur === 'sinav') {
      setSelectedExamId(arg.event.extendedProps.examId as string);
    }
  }, []);

  const renderEventContent = useCallback((arg: EventContentArg) => {
    const { event } = arg;
    const altBaslik = event.extendedProps.altBaslik as string | undefined;
    const aciklama = event.extendedProps.aciklama as string | undefined;
    const gozetmenler = event.extendedProps.gozetmenler as string | undefined;
    const sorumluOgretimUyesi = event.extendedProps.sorumluOgretimUyesi as string | undefined;
    return (
      <div className="flex flex-col gap-0.5 p-1 overflow-hidden text-xs leading-tight">
        <span className="font-semibold truncate">{event.title}</span>
        {altBaslik && <span className="truncate opacity-90">{altBaslik}</span>}
        {aciklama && <span className="truncate text-[10px] opacity-75">{aciklama}</span>}
        {sorumluOgretimUyesi && (
          <span className="truncate text-[10px] opacity-85" title={sorumluOgretimUyesi}>
            Sorumlu: {sorumluOgretimUyesi}
          </span>
        )}
        {gozetmenler && (
          <span className="truncate text-[10px] opacity-85" title={gozetmenler}>
            Gözetmenler: {gozetmenler}
          </span>
        )}
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

  const handlePrev = useCallback(() => calendarRef.current?.getApi().prev(), []);
  const handleNext = useCallback(() => calendarRef.current?.getApi().next(), []);
  const handleToday = useCallback(() => calendarRef.current?.getApi().today(), []);

  const switchView = useCallback((view: CalendarView) => {
    setCalendarView(view);
    calendarRef.current?.getApi().changeView(view);
  }, []);

  const detailLoading = detailStatus === 'pending' || detailFetching;

  return (
    <section className="space-y-6">
      {/* Sayfa başlığı */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Planım
          </h1>
          <p className="text-muted-foreground">
            Sınav ve müsait değil kayıtlarının haftalık takvim görünümü.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Gözetmen seçimi */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Gözetmen</span>
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm shadow-sm"
              value={selectedInstructorId ?? ''}
              onChange={(e) => setSelectedInstructorId(e.target.value)}
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
          <Button variant="secondary" onClick={exportIcs} disabled={!selectedInstructorId}>
            Takvimi .ICS indir
          </Button>
        </div>
      </header>

      {/* Takvim kartı */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        {/* Takvim araç çubuğu */}
        <div className="border-b px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Tarih aralığı + navigasyon */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="rounded-md border p-1.5 text-muted-foreground hover:bg-muted transition-colors"
              title="Önceki hafta"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="rounded-md border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Bugün
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="rounded-md border p-1.5 text-muted-foreground hover:bg-muted transition-colors"
              title="Sonraki hafta"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {displayRange && (
              <span className="ml-2 text-sm font-semibold tracking-tight">
                {displayRange}
              </span>
            )}
          </div>

          {/* Görünüm geçiş + legend */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Legend */}
            <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
              <LegendItem renk={EXAM_COLOR} etiket="Sınav" />
              <LegendItem renk={UNAVAILABLE_COLOR} etiket="Müsait Değil" />
              <LegendItem renk={CONFLICT_COLOR} etiket="Çakışan" />
            </div>
            {/* Görünüm toggle */}
            <div className="flex items-center gap-1 rounded-md border bg-muted/40 p-0.5">
              <ToggleButton
                active={calendarView === 'timeGridWeek'}
                onClick={() => switchView('timeGridWeek')}
              >
                Haftalık
              </ToggleButton>
              <ToggleButton
                active={calendarView === 'timeGridTwoWeek'}
                onClick={() => switchView('timeGridTwoWeek')}
              >
                2 Haftalık
              </ToggleButton>
            </div>
          </div>
        </div>

        {/* Loading bar */}
        {(scheduleLoading || scheduleFetching || instructorsLoading) && (
          <div className="h-0.5 bg-primary/20 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-1/2 bg-primary/60 animate-pulse" />
          </div>
        )}

        {/* FullCalendar */}
        <div className="p-0">
          {selectedInstructorId ? (
            <FullCalendar
              ref={calendarRef}
              height="auto"
              plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
              initialView={calendarView}
              initialDate={todayStr()}
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
              slotMinTime="08:00:00"
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
              nowIndicator
              selectable={false}
              aspectRatio={1.8}
              eventDisplay="block"
              eventMinHeight={52}
              slotDuration="00:30:00"
              slotLabelInterval="01:00:00"
              expandRows
              dayHeaderFormat={{ weekday: 'long', day: 'numeric', month: 'short' }}
              views={{
                timeGridWeek: {
                  duration: { weeks: 1 },
                  slotMinTime: '08:00:00',
                  slotMaxTime: '20:00:00',
                },
                timeGridTwoWeek: {
                  type: 'timeGridWeek',
                  duration: { weeks: 2 },
                  slotMinTime: '08:00:00',
                  slotMaxTime: '20:00:00',
                },
              }}
            />
          ) : (
            <div className="px-6 py-16 text-center text-muted-foreground">
              Bir gözetmen seçerek takvimi görüntüleyin.
            </div>
          )}
        </div>
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
      className={cn(
        'rounded px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}

function LegendItem({ renk, etiket }: { renk: string; etiket: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-flex h-2.5 w-2.5 rounded-sm flex-shrink-0"
        style={{ backgroundColor: renk }}
      />
      <span>{etiket}</span>
    </span>
  );
}

function combineDateTime(tarih?: string | null, saat?: string | null) {
  if (!tarih || !saat) return undefined;
  const sanitized = saat.length === 5 ? `${saat}:00` : saat;
  return `${tarih}T${sanitized}`;
}

function formatDateRange(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
  const startStr = start.toLocaleDateString('tr-TR', opts);
  const endStr = end.toLocaleDateString('tr-TR', { ...opts, year: 'numeric' });
  // Aynı ay ise sadece gün göster
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    const s = start.toLocaleDateString('tr-TR', { day: 'numeric' });
    return `${s} – ${endStr}`;
  }
  return `${startStr} – ${endStr}`;
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
