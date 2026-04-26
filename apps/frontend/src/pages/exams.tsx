import { useMemo, useState } from 'react';
import {
  DONEMLER,
  EXAM_DURUM_LISTESI,
  EXAM_TUR_LISTESI,
  type Exam,
} from '@sinav/shared';
import { useExamDetail, useExams, useUpdateExam } from '@/services/exams';
import { useDepartments } from '@/services/departments';
import { Badge } from '@/components/ui/badge';
import { ExamDetailPanel } from '@/components/panels/exam-detail-panel';
import { AddExamForm } from '@/components/forms/add-exam-form';
import { AutoAssignDialog } from '@/components/forms/auto-assign-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  CalendarDays,
  Clock,
  DoorOpen,
  Users,
  BookOpen,
  AlertTriangle,
} from 'lucide-react';

type FilterState = {
  donem: string;
  durum: string;
  tur: string;
  search: string;
  bolumId: string;
  cakismaVar: boolean;
  gozetmenEksik: boolean;
};

const DEFAULT_FILTERS: FilterState = {
  donem: '',
  durum: '',
  tur: '',
  search: '',
  bolumId: '',
  cakismaVar: false,
  gozetmenEksik: false,
};

export default function ExamsPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAutoAssignDialog, setShowAutoAssignDialog] = useState(false);
  const { data: departments } = useDepartments();
  const { data, isLoading, isError, error } = useExams(filters);
  const updateExam = useUpdateExam();
  const {
    data: selectedExamDetail,
    status: detailStatus,
    isFetching: isDetailFetching,
  } = useExamDetail(selectedExamId ?? undefined);

  // Group exams by department and filter
  const { groupedExams, problemExams } = useMemo(() => {
    const allExams = data?.veriler ?? [];

    // Filter exams based on filters
    let filtered = allExams.filter((exam) => {
      if (filters.donem && exam.donem !== filters.donem) return false;
      if (filters.durum && exam.durum !== filters.durum) return false;
      if (filters.tur && exam.tur !== filters.tur) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          exam.ders?.ad?.toLowerCase().includes(searchLower) ||
          exam.ders?.kod?.toLowerCase().includes(searchLower) ||
          exam.derslik?.ad?.toLowerCase().includes(searchLower) ||
          exam.derslikler?.some((dr) => dr.derslik?.ad?.toLowerCase().includes(searchLower)) ||
          exam.ogretimUyesi?.ad?.toLowerCase().includes(searchLower) ||
          exam.gozetmenler?.some((g) => g.gozetmen?.ad?.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }
      return true;
    });

    // Separate problem exams
    const problems: Exam[] = [];
    const normal: Exam[] = [];

    filtered.forEach((exam) => {
      const hasConflict = selectedExamDetail?.id === exam.id
        ? (selectedExamDetail.cakismalar?.length ?? 0) > 0
        : false; // We'll check conflicts from detail panel
      const hasNoProctors = !exam.gozetmenler || exam.gozetmenler.length === 0;

      if ((filters.cakismaVar && hasConflict) || (filters.gozetmenEksik && hasNoProctors)) {
        problems.push(exam);
      } else if (!filters.cakismaVar && !filters.gozetmenEksik) {
        normal.push(exam);
      }
    });

    // Group normal exams by department first, then by class (sinif)
    const groupedByDept = new Map<string, Map<number, Exam[]>>();
    normal.forEach((exam) => {
      const deptName = exam.ders?.bolum?.ad ?? 'Diğer';
      const sinif = exam.sinif ?? 0;

      if (!groupedByDept.has(deptName)) {
        groupedByDept.set(deptName, new Map());
      }
      const deptGroup = groupedByDept.get(deptName)!;

      if (!deptGroup.has(sinif)) {
        deptGroup.set(sinif, []);
      }
      deptGroup.get(sinif)!.push(exam);
    });

    // Sort by department alphabetically, then by class (1, 2, 3, 4, 5, 6), then by course code
    const sortedGroups: Array<[string, Exam[]]> = [];
    const sortedDepts = Array.from(groupedByDept.entries())
      .sort(([a], [b]) => a.localeCompare(b, 'tr')); // Sort departments alphabetically

    sortedDepts.forEach(([dept, classMap]) => {
      const sortedClasses = Array.from(classMap.entries())
        .sort(([a], [b]) => a - b); // Sort classes numerically (1, 2, 3, ...)

      sortedClasses.forEach(([sinif, exams]) => {
        const sortedExams = exams.sort((a, b) => {
          // Sort by course code
          const codeA = a.ders?.kod ?? '';
          const codeB = b.ders?.kod ?? '';
          return codeA.localeCompare(codeB, 'tr');
        });
        sortedGroups.push([`${dept} - ${sinif}. Sınıf`, sortedExams]);
      });
    });

    return {
      groupedExams: sortedGroups,
      problemExams: problems,
    };
  }, [data, filters, selectedExamDetail]);

  const filteredExams = useMemo<Exam[]>(() => {
    if (filters.cakismaVar || filters.gozetmenEksik) {
      return problemExams;
    }
    return groupedExams.flatMap(([, exams]) => exams);
  }, [groupedExams, problemExams, filters]);
  const selectedExam = useMemo(
    () => filteredExams.find((exam) => exam.id === selectedExamId),
    [filteredExams, selectedExamId],
  );
  const detailLoading = detailStatus === 'pending' || isDetailFetching;

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Sınavlar</h1>
        <p className="text-muted-foreground">
          Manuel sınav atama ve çakışma kontrolleri için mevcut kayıtlar.
        </p>
      </header>

      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Dönem</span>
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={filters.donem}
              onChange={(event) =>
                setFilters((state) => ({ ...state, donem: event.target.value }))
              }
            >
              <option value="">Tümü</option>
              {DONEMLER.map((value) => (
                <option key={value} value={value}>
                  {value === 'guz' ? 'Güz' : 'Bahar'}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Durum</span>
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={filters.durum}
              onChange={(event) =>
                setFilters((state) => ({ ...state, durum: event.target.value }))
              }
            >
              <option value="">Tümü</option>
              {EXAM_DURUM_LISTESI.map((value) => (
                <option key={value} value={value}>
                  {statusLabel(value)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Tür</span>
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={filters.tur}
              onChange={(event) =>
                setFilters((state) => ({ ...state, tur: event.target.value }))
              }
            >
              <option value="">Tümü</option>
              {EXAM_TUR_LISTESI.map((value) => (
                <option key={value} value={value}>
                  {typeLabel(value)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Bölüm</span>
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={filters.bolumId}
              onChange={(event) =>
                setFilters((state) => ({ ...state, bolumId: event.target.value }))
              }
            >
              <option value="">Tümü</option>
              {departments?.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.ad}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Serbest Arama</span>
            <input
              className="rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Ders, gözetmen, derslik..."
              value={filters.search}
              onChange={(event) =>
                setFilters((state) => ({
                  ...state,
                  search: event.target.value,
                }))
              }
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={filters.cakismaVar}
              onChange={(event) =>
                setFilters((state) => ({
                  ...state,
                  cakismaVar: event.target.checked,
                  gozetmenEksik: event.target.checked ? false : state.gozetmenEksik,
                }))
              }
              className="rounded border-gray-300"
            />
            <span>Çakışma Var</span>
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={filters.gozetmenEksik}
              onChange={(event) =>
                setFilters((state) => ({
                  ...state,
                  gozetmenEksik: event.target.checked,
                  cakismaVar: event.target.checked ? false : state.cakismaVar,
                }))
              }
              className="rounded border-gray-300"
            />
            <span>Gözetmen Eksik</span>
          </label>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Sınav Listesi{' '}
              <span className="text-muted-foreground font-normal text-base">
                ({filteredExams.length})
              </span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Karta tıklayarak detaylara ulaşabilirsiniz.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setShowAutoAssignDialog(true)}>
              Otomatik Gözetmen Ata
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              Yeni Sınav Ekle
            </Button>
          </div>
        </div>

        <div className="p-6">
          {isLoading && (
            <p className="text-center text-muted-foreground py-12">
              Sınavlar yükleniyor…
            </p>
          )}
          {isError && (
            <p className="text-center text-destructive py-12">
              {(error as Error)?.message ?? 'Sınav listesi alınırken hata oluştu.'}
            </p>
          )}
          {!isLoading && !isError && (
            filters.cakismaVar || filters.gozetmenEksik ? (
              problemExams.length > 0 ? (
                <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                  {problemExams.map((exam) => (
                    <ExamCard
                      key={exam.id}
                      exam={exam}
                      selected={exam.id === selectedExamId}
                      onSelect={() => setSelectedExamId(exam.id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">
                  Sorunlu sınav bulunamadı.
                </p>
              )
            ) : (
              groupedExams.length > 0 ? (
                <div className="space-y-8">
                  {groupedExams.map(([deptName, exams]) => (
                    <div key={deptName}>
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          {deptName}
                        </h3>
                        <span className="text-xs bg-muted rounded-full px-2 py-0.5 text-muted-foreground">
                          {exams.length} sınav
                        </span>
                      </div>
                      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                        {exams.map((exam) => (
                          <ExamCard
                            key={exam.id}
                            exam={exam}
                            selected={exam.id === selectedExamId}
                            onSelect={() => setSelectedExamId(exam.id)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">
                  Kriterlere uygun sınav bulunamadı.
                </p>
              )
            )
          )}
        </div>
      </div>

      <ExamDetailPanel
        exam={selectedExamDetail ?? selectedExam}
        conflicts={selectedExamDetail?.cakismalar ?? null}
        loading={detailLoading}
        updating={updateExam.isPending}
        updateError={
          updateExam.error instanceof Error
            ? updateExam.error.message
            : null
        }
        onUpdate={(payload) => {
          if (!selectedExamId) return;
          updateExam.mutate({ id: selectedExamId, payload });
        }}
        onDeleted={() => {
          setSelectedExamId(null);
        }}
        open={Boolean(selectedExamId)}
        onClose={() => setSelectedExamId(null)}
      />

      <AddExamForm open={showAddDialog} onOpenChange={setShowAddDialog} />
      <AutoAssignDialog open={showAutoAssignDialog} onOpenChange={setShowAutoAssignDialog} />
    </section>
  );
}

function ExamCard({
  exam,
  selected,
  onSelect,
}: {
  exam: Exam;
  selected: boolean;
  onSelect: () => void;
}) {
  const start = formatTime(exam.baslangic);
  const end = formatTime(exam.bitis);

  const rooms = exam.derslikler && exam.derslikler.length > 0
    ? exam.derslikler.map((dr) => dr.derslik?.ad).filter(Boolean).join(', ')
    : exam.derslik?.ad ?? null;

  const proctors = exam.gozetmenler && exam.gozetmenler.length > 0
    ? exam.gozetmenler.map((g) => g.gozetmen?.ad).filter(Boolean) as string[]
    : [];

  const accentColor =
    exam.durum === 'yayinlandi'
      ? 'border-l-green-500'
      : exam.durum === 'taslak'
      ? 'border-l-amber-500'
      : 'border-l-border';

  return (
    <div
      className={cn(
        'rounded-lg border border-l-4 bg-card p-4 cursor-pointer',
        'transition-all duration-150 hover:shadow-md hover:border-primary/30',
        accentColor,
        selected && 'ring-2 ring-primary/30 border-primary/50 bg-primary/[0.03] shadow-sm',
      )}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); }
      }}
      role="button"
      tabIndex={0}
    >
      {/* Course header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="font-semibold text-sm leading-snug truncate">
            {exam.ders?.ad ?? '—'}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {exam.ders?.kod ?? ''}
            {exam.sinif ? ` · ${exam.sinif}. Sınıf` : ''}
          </div>
        </div>
        <Badge variant={statusVariant(exam.durum)} className="shrink-0 text-xs">
          {statusLabel(exam.durum)}
        </Badge>
      </div>

      {/* Info rows */}
      <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 text-xs mb-3">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <CalendarDays className="h-3 w-3 shrink-0" />
          {formatTarih(exam.tarih)}
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0" />
          {start && end ? `${start} – ${end}` : 'Belirsiz'}
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground col-span-2 truncate" title={rooms ?? undefined}>
          <DoorOpen className="h-3 w-3 shrink-0" />
          {rooms ?? <span className="italic">Derslik atanmadı</span>}
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <BookOpen className="h-3 w-3 shrink-0" />
          {typeLabel(exam.tur)}
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          {donemLabel(exam.donem)}
        </span>
      </div>

      {/* Invigilators */}
      <div className="border-t pt-2.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
          <Users className="h-3 w-3" />
          <span>Gözetmenler</span>
        </div>
        {proctors.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {proctors.map((name, i) => (
              <span
                key={i}
                className="bg-muted rounded-full px-2 py-0.5 text-xs font-medium"
              >
                {name}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
            <AlertTriangle className="h-3 w-3" />
            Gözetmen atanmadı
          </div>
        )}
      </div>
    </div>
  );
}

function donemLabel(value: string) {
  switch (value) {
    case 'guz':
      return 'Güz';
    case 'bahar':
      return 'Bahar';
    default:
      return value;
  }
}

function statusLabel(value: string) {
  switch (value) {
    case 'planlanmadi':
      return 'Planlanmadı';
    case 'taslak':
      return 'Taslak';
    case 'yayinlandi':
      return 'Yayınlandı';
    default:
      return value;
  }
}

function statusVariant(value: string) {
  switch (value) {
    case 'planlanmadi':
      return 'outline' as const;
    case 'taslak':
      return 'warning' as const;
    case 'yayinlandi':
      return 'success' as const;
    default:
      return 'outline' as const;
  }
}

function typeLabel(value: string) {
  switch (value) {
    case 'sinav':
      return 'Sınav';
    case 'odev':
      return 'Ödev';
    case 'proje':
      return 'Proje';
    default:
      return value;
  }
}

function formatTime(value?: string | null) {
  if (!value) return '';
  // Ensure 24-hour format (HH:mm)
  // Remove any AM/PM indicators if present
  let timeStr = value.replace(/[AaPp][Mm]/g, '').trim();
  // Extract HH:mm format (first 5 characters)
  timeStr = timeStr.slice(0, 5);
  // Validate format (should be HH:mm)
  if (/^\d{2}:\d{2}$/.test(timeStr)) {
    return timeStr;
  }
  // Fallback: try to parse as time
  try {
    const [hours, minutes] = timeStr.split(':');
    if (hours && minutes) {
      const h = parseInt(hours, 10);
      const m = parseInt(minutes, 10);
      if (!isNaN(h) && !isNaN(m) && h >= 0 && h < 24 && m >= 0 && m < 60) {
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      }
    }
  } catch {
    // Ignore parsing errors
  }
  return timeStr;
}

function formatTarih(value?: string | null) {
  if (!value) return 'Belirsiz';
  try {
    const date = new Date(value + 'T00:00:00'); // Add time to avoid timezone issues
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  } catch (error) {
    return value;
  }
}

