import { useMemo, useState } from 'react';
import {
  useUnavailabilities,
  useDeleteUnavailability,
  useBulkDeleteUnavailabilities,
  exportUnavailabilitiesCsv,
  type UnavailabilityFilters,
} from '@/services/unavailability';
import { useInstructors } from '@/services/instructors';
import { useFaculties } from '@/services/faculties';
import { useDepartments } from '@/services/departments';
import { UnavailabilityForm } from '@/components/forms/unavailability-form';
import { Button } from '@/components/ui/button';
import type { InstructorUnavailability } from '@sinav/shared';

type FilterState = {
  search: string;
  ogretimUyesiId: string;
  bolumId: string;
  fakulteId: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  overrideEdildi: boolean | undefined;
  page: number;
};

const DEFAULT_FILTERS: FilterState = {
  search: '',
  ogretimUyesiId: '',
  bolumId: '',
  fakulteId: '',
  baslangicTarihi: '',
  bitisTarihi: '',
  overrideEdildi: undefined,
  page: 1,
};

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
      {children}
    </th>
  );
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm ${className}`}>
      {children}
    </td>
  );
}

export default function UnavailabilityPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const queryFilters: UnavailabilityFilters = useMemo(() => {
    const result: UnavailabilityFilters = {
      page: filters.page,
      limit: 25,
    };
    if (filters.search) result.search = filters.search;
    if (filters.ogretimUyesiId) result.ogretimUyesiId = filters.ogretimUyesiId;
    if (filters.bolumId) result.bolumId = filters.bolumId;
    if (filters.fakulteId) result.fakulteId = filters.fakulteId;
    if (filters.baslangicTarihi) result.baslangicTarihi = filters.baslangicTarihi;
    if (filters.bitisTarihi) result.bitisTarihi = filters.bitisTarihi;
    if (filters.overrideEdildi !== undefined) result.overrideEdildi = filters.overrideEdildi;
    return result;
  }, [filters]);

  const { data, isLoading, isError, error } = useUnavailabilities(queryFilters);
  const { data: instructors } = useInstructors();
  const { data: facultiesData } = useFaculties();
  const { data: departments } = useDepartments(filters.fakulteId);
  const deleteMutation = useDeleteUnavailability();
  const bulkDeleteMutation = useBulkDeleteUnavailabilities();

  const selectedRecord = useMemo(
    () => data?.veriler.find((r) => r.id === selectedId) ?? null,
    [data, selectedId],
  );

  const handleDelete = async (id: string) => {
    if (confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
      try {
        await deleteMutation.mutateAsync(id);
        if (selectedId === id) {
          setSelectedId(null);
        }
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (confirm(`${selectedIds.size} kaydı silmek istediğinizden emin misiniz?`)) {
      try {
        await bulkDeleteMutation.mutateAsync(Array.from(selectedIds));
        setSelectedIds(new Set());
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  const handleExport = async () => {
    try {
      await exportUnavailabilitiesCsv(queryFilters);
    } catch (error) {
      alert('CSV dışa aktarma sırasında bir hata oluştu.');
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('tr-TR'),
      time: date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === data?.veriler.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data?.veriler.map((r) => r.id) ?? []));
    }
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Müsait Değil Kayıtları
        </h1>
        <p className="text-muted-foreground">
          CSV içe/dışa aktarma ve çakışma uyarılarıyla birlikte kayıt yönetimi.
        </p>
      </header>

      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Serbest Arama</span>
            <input
              className="rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Gözetmen adı, neden..."
              value={filters.search}
              onChange={(event) =>
                setFilters((state) => ({ ...state, search: event.target.value, page: 1 }))
              }
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Fakülte</span>
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={filters.fakulteId}
              onChange={(event) =>
                setFilters((state) => ({
                  ...state,
                  fakulteId: event.target.value,
                  bolumId: '',
                  page: 1,
                }))
              }
            >
              <option value="">Tümü</option>
              {facultiesData?.veriler.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.ad}
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
                setFilters((state) => ({ ...state, bolumId: event.target.value, page: 1 }))
              }
              disabled={!filters.fakulteId}
            >
              <option value="">Tümü</option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.ad}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Gözetmen</span>
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={filters.ogretimUyesiId}
              onChange={(event) =>
                setFilters((state) => ({ ...state, ogretimUyesiId: event.target.value, page: 1 }))
              }
            >
              <option value="">Tümü</option>
              {instructors?.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.ad} ({i.email})
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Başlangıç Tarihi</span>
            <input
              type="date"
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={filters.baslangicTarihi}
              onChange={(event) =>
                setFilters((state) => ({ ...state, baslangicTarihi: event.target.value, page: 1 }))
              }
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>Bitiş Tarihi</span>
            <input
              type="date"
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={filters.bitisTarihi}
              onChange={(event) =>
                setFilters((state) => ({ ...state, bitisTarihi: event.target.value, page: 1 }))
              }
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={filters.overrideEdildi === true}
              onChange={(event) =>
                setFilters((state) => ({
                  ...state,
                  overrideEdildi: event.target.checked ? true : undefined,
                  page: 1,
                }))
              }
              className="rounded border-gray-300"
            />
            <span>Sadece Override Edilenler</span>
          </label>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Kayıt Listesi ({data?.toplam ?? 0})
            </h2>
            <p className="text-sm text-muted-foreground">
              Satıra tıklayarak düzenleyebilirsiniz.
            </p>
          </div>
          <div className="flex gap-2">
            {selectedIds.size > 0 && (
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
              >
                Seçilenleri Sil ({selectedIds.size})
              </Button>
            )}
            <Button variant="outline" onClick={handleExport}>
              CSV Dışa Aktar
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              Yeni Kayıt Ekle
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <Th>
                  <input
                    type="checkbox"
                    checked={data && selectedIds.size === data.veriler.length && data.veriler.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </Th>
                <Th>Gözetmen</Th>
                <Th>Bölüm</Th>
                <Th>Tarih</Th>
                <Th>Başlangıç</Th>
                <Th>Bitiş</Th>
                <Th>Neden</Th>
                <Th>İşlemler</Th>
              </tr>
            </thead>
            <tbody className="divide-y bg-card">
              {isLoading && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-6 text-center text-muted-foreground"
                  >
                    Kayıtlar yükleniyor…
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-6 text-center text-destructive"
                  >
                    {(error as Error)?.message ??
                      'Kayıt listesi alınırken hata oluştu.'}
                  </td>
                </tr>
              )}
              {!isLoading && !isError && (!data?.veriler || data.veriler.length === 0) && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-6 text-center text-muted-foreground"
                  >
                    Kriterlere uygun kayıt bulunamadı.
                  </td>
                </tr>
              )}
              {!isLoading &&
                !isError &&
                data?.veriler.map((record) => {
                  const baslangic = formatDateTime(record.baslangic);
                  const bitis = formatDateTime(record.bitis);
                  return (
                    <tr
                      key={record.id}
                      className={`hover:bg-muted/50 cursor-pointer ${
                        selectedId === record.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedId(record.id)}
                    >
                      <Td>
                        <div onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(record.id)}
                            onChange={() => toggleSelect(record.id)}
                            className="rounded border-gray-300"
                          />
                        </div>
                      </Td>
                      <Td>
                        <div className="font-medium">
                          {record.ogretimUyesi?.ad ?? 'Bilinmiyor'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {record.ogretimUyesi?.email ?? ''}
                        </div>
                      </Td>
                      <Td>
                        {record.ogretimUyesi?.bolum?.ad ?? '-'}
                      </Td>
                      <Td>{baslangic.date}</Td>
                      <Td>{baslangic.time}</Td>
                      <Td>{bitis.time}</Td>
                      <Td className="max-w-xs truncate" title={record.neden}>
                        {record.neden}
                      </Td>
                      <Td>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedId(record.id);
                            }}
                          >
                            Düzenle
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(record.id)}
                            disabled={deleteMutation.isPending}
                          >
                            Sil
                          </Button>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        {data && data.toplam > (data.limit || 25) && (
          <div className="border-t px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Sayfa {data.sayfa} / {Math.ceil(data.toplam / (data.limit || 25))} (Toplam: {data.toplam})
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFilters((state) => ({ ...state, page: Math.max(1, state.page - 1) }))
                }
                disabled={filters.page === 1}
              >
                Önceki
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFilters((state) => ({
                    ...state,
                    page: state.page + 1,
                  }))
                }
                disabled={data.sayfa * (data.limit || 25) >= data.toplam}
              >
                Sonraki
              </Button>
            </div>
          </div>
        )}
      </div>

      <UnavailabilityForm
        open={showAddDialog || Boolean(selectedId && selectedRecord)}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setSelectedId(null);
          }
        }}
        editing={selectedId && selectedRecord ? selectedRecord : null}
      />
    </section>
  );
}
