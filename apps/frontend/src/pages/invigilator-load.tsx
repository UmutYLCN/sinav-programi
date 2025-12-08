import { useEffect, useMemo, useState } from 'react';
import { DONEMLER } from '@sinav/shared';
import { useFaculties } from '@/services/faculties';
import { useDepartments } from '@/services/departments';
import {
  useInvigilatorLoadDetail,
  useInvigilatorLoadList,
  type InvigilatorLoadFilters,
} from '@/services/invigilator-load';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { env } from '@/config/env';
import { useExamDetail } from '@/services/exams';
import { ExamDetailPanel } from '@/components/panels/exam-detail-panel';

const DEFAULT_FILTERS: InvigilatorLoadFilters = {
  donem: '',
  fakulteId: '',
  bolumId: '',
  baslangicTarihi: '',
  bitisTarihi: '',
};

export default function InvigilatorLoadPage() {
  const [filters, setFilters] = useState<InvigilatorLoadFilters>(DEFAULT_FILTERS);

  const { data: faculties } = useFaculties();
  const { data: departments } = useDepartments(
    filters.fakulteId ? filters.fakulteId : undefined,
  );

  const { data: loadList, isLoading: listLoading } =
    useInvigilatorLoadList(filters);

  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!loadList?.length) {
      setSelectedInstructorId(null);
      return;
    }
    const exists = loadList.some(
      (item) => item.ogretimUyesiId === selectedInstructorId,
    );
    if (!exists) {
      setSelectedInstructorId(loadList[0].ogretimUyesiId);
    }
  }, [loadList, selectedInstructorId]);

  const {
    data: detail,
    isLoading: detailLoading,
    isFetching: detailFetching,
  } = useInvigilatorLoadDetail(selectedInstructorId, filters);

  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const {
    data: selectedExamDetail,
    isFetching: examDetailFetching,
    status: examDetailStatus,
  } = useExamDetail(selectedExamId ?? undefined);

  const detailSkeleton = detailLoading || detailFetching;
  const examDetailLoading =
    examDetailStatus === 'pending' || examDetailFetching === true;

  const listItems = useMemo(
    () =>
      loadList?.map((item) => ({
        ...item,
        toplamSaatLabel: `${item.toplamSaat.toFixed(2)} saat`,
      })) ?? [],
    [loadList],
  );

  const handleFilterChange = (key: keyof InvigilatorLoadFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const exportIcs = () => {
    if (!selectedInstructorId) return;
    const params = new URLSearchParams();
    if (filters.baslangicTarihi) params.append('baslangic', filters.baslangicTarihi);
    if (filters.bitisTarihi) params.append('bitis', filters.bitisTarihi);
    window.open(
      `${env.apiUrl}/instructors/${selectedInstructorId}/schedule.ics?${params.toString()}`,
      '_blank',
    );
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Gözetmen Yük Listesi
        </h1>
        <p className="text-muted-foreground">
          Gözetmenlerin toplam görev sürelerini takip edin, dilediğiniz aralıkta
          detaylı rapor alın.
        </p>
      </header>

      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h2 className="text-lg font-semibold">Filtreler</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Dönem</span>
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={filters.donem ?? ''}
              onChange={(event) => handleFilterChange('donem', event.target.value)}
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
            <span>Fakülte</span>
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={filters.fakulteId ?? ''}
              onChange={(event) => {
                const value = event.target.value;
                handleFilterChange('fakulteId', value);
                handleFilterChange('bolumId', '');
              }}
            >
              <option value="">Tümü</option>
              {faculties?.veriler.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.ad}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Bölüm</span>
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={filters.bolumId ?? ''}
              onChange={(event) => handleFilterChange('bolumId', event.target.value)}
              disabled={!filters.fakulteId}
            >
              <option value="">Tümü</option>
              {departments?.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.ad}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Başlangıç Tarihi</span>
            <input
              type="date"
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={filters.baslangicTarihi ?? ''}
              onChange={(event) =>
                handleFilterChange('baslangicTarihi', event.target.value)
              }
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Bitiş Tarihi</span>
            <input
              type="date"
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={filters.bitisTarihi ?? ''}
              onChange={(event) =>
                handleFilterChange('bitisTarihi', event.target.value)
              }
            />
          </label>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        <aside className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold">
              Gözetmenler ({listItems.length})
            </h2>
            <p className="text-sm text-muted-foreground">
              Toplam görevi en yüksekten başlayarak listelenir.
            </p>
          </div>
          <div className="max-h-[640px] overflow-y-auto">
            {listLoading ? (
              <Placeholder message="Gözetmen yükleri hesaplanıyor…" />
            ) : listItems.length === 0 ? (
              <Placeholder message="Kriterlere uyan gözetmen bulunamadı." />
            ) : (
              <ul className="divide-y">
                {listItems.map((item) => (
                  <li key={item.ogretimUyesiId}>
                    <button
                      type="button"
                      onClick={() => setSelectedInstructorId(item.ogretimUyesiId)}
                      className={cn(
                        'flex w-full flex-col gap-1 px-6 py-4 text-left transition-colors',
                        selectedInstructorId === item.ogretimUyesiId
                          ? 'bg-primary/10'
                          : 'hover:bg-muted/60',
                      )}
                    >
                      <span className="text-sm font-semibold">{item.ad}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.fakulte ?? 'Fakülte belirtilmemiş'}
                        {item.bolum ? ` • ${item.bolum}` : ''}
                      </span>
                      <div className="mt-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
                        <span>{item.toplamSaatLabel}</span>
                        <span>{item.sinavSayisi} sınav</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {detail?.ogretimUyesi.ad ?? 'Gözetmen Detayı'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {detail?.ogretimUyesi.email ?? 'Seçilen gözetmenin detayını görüntüleyin.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={exportIcs}
                disabled={!selectedInstructorId}
              >
                Takvimi .ICS indir
              </Button>
              <Button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    baslangicTarihi: '',
                    bitisTarihi: '',
                    fakulteId: '',
                    bolumId: '',
                    donem: '',
                  }))
                }
              >
                Filtreleri Temizle
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Toplam Saat"
              value={detail ? `${detail.toplamSaat.toFixed(2)} saat` : '—'}
              loading={detailSkeleton}
            />
            <StatCard
              title="Sınav Sayısı"
              value={detail ? `${detail.sinavSayisi}` : '—'}
              loading={detailSkeleton}
            />
            <StatCard
              title="Çakışmalar"
              value={detail ? `${detail.cakismalar.length}` : '—'}
              loading={detailSkeleton}
            />
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold">Sınav Görevleri</h3>
              <p className="text-sm text-muted-foreground">
                Baş gözetmen olduğu görevler rozet ile belirtilmiştir.
              </p>
            </div>
            {detailSkeleton ? (
              <Placeholder message="Görevler yükleniyor…" />
            ) : !detail ? (
              <Placeholder message="Bir gözetmen seçin." />
            ) : detail.sinavlar.length === 0 ? (
              <Placeholder message="Bu aralıkta görev bulunmamaktadır." />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y text-sm">
                  <thead className="bg-muted/40 text-muted-foreground">
                    <tr>
                      <Th>Tarih</Th>
                      <Th>Saat</Th>
                      <Th>Ders</Th>
                      <Th>Bölüm</Th>
                      <Th>Derslik</Th>
                      <Th>Süre</Th>
                      <Th>Rol</Th>
                      <Th></Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {detail.sinavlar.map((assignment) => (
                      <tr key={assignment.sinavId} className="hover:bg-muted/40">
                        <Td>{formatDate(assignment.tarih)}</Td>
                        <Td>{formatTimeRange(assignment.baslangic, assignment.bitis)}</Td>
                        <Td>
                          <div className="font-medium">
                            {assignment.dersKod ?? 'Kod yok'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {assignment.ders ?? 'Ders adı belirtilmemiş'}
                          </div>
                        </Td>
                        <Td>{assignment.bolum ?? '—'}</Td>
                        <Td>{assignment.derslik ?? '—'}</Td>
                        <Td>{`${assignment.sureDakika} dk`}</Td>
                        <Td>
                          <Badge
                            variant={
                              assignment.gozetmenRol === 'birincil'
                                ? 'success'
                                : 'secondary'
                            }
                          >
                            {assignment.gozetmenRol === 'birincil'
                              ? 'Baş Gözetmen'
                              : 'Gözetmen'}
                          </Badge>
                        </Td>
                        <Td className="text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedExamId(assignment.sinavId)}
                          >
                            Sınav Detayı
                          </Button>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {detail?.cakismalar.length ? (
              <div className="border-t bg-amber-50 px-6 py-4 text-sm text-amber-700">
                <p className="font-semibold">Çakışma Uyarıları</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {detail.cakismalar.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <ExamDetailPanel
        exam={selectedExamDetail}
        conflicts={selectedExamDetail?.cakismalar ?? null}
        loading={examDetailLoading}
        updating={false}
        open={Boolean(selectedExamId)}
        onClose={() => setSelectedExamId(null)}
      />
    </section>
  );
}

function Placeholder({ message }: { message: string }) {
  return (
    <div className="px-6 py-16 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function StatCard({
  title,
  value,
  loading,
}: {
  title: string;
  value: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <p className="mt-2 text-2xl font-semibold">
        {loading ? <span className="text-muted-foreground">Yükleniyor…</span> : value}
      </p>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn(
        'px-6 py-3 text-left text-xs font-semibold uppercase',
        className,
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={cn('px-6 py-4 align-top text-sm', className)}>{children}</td>
  );
}

function formatDate(value?: string | null) {
  if (!value) return 'Belirlenmedi';
  try {
    return new Date(value).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

function formatTimeRange(start?: string | null, end?: string | null) {
  if (!start || !end) return 'Belirlenmedi';
  const s = start.length === 5 ? start : start.slice(0, 5);
  const e = end.length === 5 ? end : end.slice(0, 5);
  return `${s} - ${e}`;
}
