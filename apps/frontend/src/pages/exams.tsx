import { useMemo, useState } from 'react';
import React from 'react';
import type { ReactNode } from 'react';
import {
  DONEMLER,
  EXAM_DURUM_LISTESI,
  EXAM_TUR_LISTESI,
  type Exam,
} from '@sinav/shared';
import { useExamDetail, useExams, useUpdateExam, useDeleteExam } from '@/services/exams';
import { useDepartments } from '@/services/departments';
import type { ExamConflict } from '@sinav/shared';
import { Badge } from '@/components/ui/badge';
import { ExamDetailPanel } from '@/components/panels/exam-detail-panel';
import { AddExamForm } from '@/components/forms/add-exam-form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  const { data: departments } = useDepartments();
  const { data, isLoading, isError, error } = useExams(filters);
  const updateExam = useUpdateExam();
  const deleteExam = useDeleteExam();
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
              Sınav Listesi ({filteredExams.length})
            </h2>
            <p className="text-sm text-muted-foreground">
              Satıra tıklayarak detaylara ulaşabilirsiniz.
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            Yeni Sınav Ekle
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <Th>Fakülte / Bölüm</Th>
                <Th>Ders</Th>
                <Th>Dönem</Th>
                <Th>Tarih</Th>
                <Th>Saat</Th>
                <Th>Derslik</Th>
                <Th>Gözetmen</Th>
                <Th>Durum</Th>
                <Th>Tür</Th>
              </tr>
            </thead>
            <tbody className="divide-y bg-card">
              {isLoading && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-6 text-center text-muted-foreground"
                  >
                    Sınavlar yükleniyor…
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-6 text-center text-destructive"
                  >
                    {(error as Error)?.message ??
                      'Sınav listesi alınırken hata oluştu.'}
                  </td>
                </tr>
              )}
              {!isLoading && !isError && filteredExams.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-6 text-center text-muted-foreground"
                  >
                    Kriterlere uygun sınav bulunamadı.
                  </td>
                </tr>
              )}
              {!isLoading &&
                !isError &&
                (filters.cakismaVar || filters.gozetmenEksik ? (
                  // Show problem exams in a single list
                  problemExams.length > 0 ? (
                    problemExams.map((exam) => (
                      <ExamRow
                        key={exam.id}
                        exam={exam}
                        selected={exam.id === selectedExamId}
                        onSelect={() => setSelectedExamId(exam.id)}
                        onDelete={() => {
                          if (confirm('Bu sınavı silmek istediğinizden emin misiniz?')) {
                            deleteExam.mutate(exam.id);
                            if (selectedExamId === exam.id) {
                              setSelectedExamId(null);
                            }
                          }
                        }}
                      />
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-6 py-6 text-center text-muted-foreground"
                      >
                        Sorunlu sınav bulunamadı.
                      </td>
                    </tr>
                  )
                ) : (
                  // Show grouped exams by department
                  groupedExams.length > 0 ? (
                    groupedExams.map(([deptName, exams]) => (
                      <React.Fragment key={deptName}>
                        <tr className="bg-muted/30">
                          <td colSpan={9} className="px-6 py-3 font-semibold">
                            {deptName}
                          </td>
                        </tr>
                        {exams.map((exam) => (
                          <ExamRow
                            key={exam.id}
                            exam={exam}
                            selected={exam.id === selectedExamId}
                            onSelect={() => setSelectedExamId(exam.id)}
                            onDelete={() => {
                              if (confirm('Bu sınavı silmek istediğinizden emin misiniz?')) {
                                deleteExam.mutate(exam.id);
                                if (selectedExamId === exam.id) {
                                  setSelectedExamId(null);
                                }
                              }
                            }}
                          />
                        ))}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-6 py-6 text-center text-muted-foreground"
                      >
                        Kriterlere uygun sınav bulunamadı.
                      </td>
                    </tr>
                  )
                ))}
            </tbody>
          </table>
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
    </section>
  );
}

function ExamRow({
  exam,
  selected,
  onSelect,
  onDelete,
}: {
  exam: Exam;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const start = formatTime(exam.baslangic);
  const end = formatTime(exam.bitis);
  
  // Get all rooms (from both old derslik and new derslikler)
  const rooms = exam.derslikler && exam.derslikler.length > 0
    ? exam.derslikler.map((dr) => dr.derslik?.ad).filter(Boolean).join(', ')
    : exam.derslik?.ad ?? 'Atanmadı';
  
  // Get all proctors - show them vertically
  const proctors = exam.gozetmenler && exam.gozetmenler.length > 0
    ? exam.gozetmenler.map((g) => g.gozetmen?.ad).filter(Boolean)
    : [];

  return (
    <tr
      className={cn(
        'cursor-pointer hover:bg-muted/40',
        selected && 'bg-muted/60',
      )}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <Td>
        <div className="font-medium">{exam.ders?.bolum?.fakulte?.ad}</div>
        <div className="text-xs text-muted-foreground">
          {exam.ders?.bolum?.ad ?? '—'}
        </div>
      </Td>
      <Td>
        <div className="font-medium">{exam.ders?.ad ?? '—'}</div>
        <div className="text-xs text-muted-foreground">{exam.ders?.kod}</div>
      </Td>
      <Td>{donemLabel(exam.donem)}</Td>
      <Td>{formatTarih(exam.tarih)}</Td>
      <Td>{start && end ? `${start} - ${end}` : 'Belirsiz'}</Td>
      <Td className="max-w-xs">
        <div className="truncate" title={rooms}>{rooms}</div>
      </Td>
      <Td className="max-w-xs">
        {proctors.length > 0 ? (
          <div className="flex flex-col gap-0.5">
            {proctors.map((name, idx) => (
              <div key={idx} className="text-xs">{name}</div>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">Atanmadı</span>
        )}
      </Td>
      <Td>
        <Badge variant={statusVariant(exam.durum)}>{statusLabel(exam.durum)}</Badge>
      </Td>
      <Td>
        <Badge variant="secondary">{typeLabel(exam.tur)}</Badge>
      </Td>
    </tr>
  );
}

function Th({ children }: { children: ReactNode }) {
  return (
    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold">
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <td className={cn('px-6 py-4 align-top', className)}>{children}</td>;
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

