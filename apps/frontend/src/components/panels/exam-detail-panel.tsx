import { useEffect, useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TimeInput } from '@/components/ui/time-input';
import type { UpdateExamInput } from '@/services/exams';
import { useDeleteExam } from '@/services/exams';
import { useRooms } from '@/services/rooms';
import { useInstructors } from '@/services/instructors';
import type { Exam, ExamConflict } from '@sinav/shared';

interface ExamDetailPanelProps {
  open: boolean;
  exam?: Exam | null;
  conflicts?: ExamConflict[] | null;
  loading: boolean;
  updating?: boolean;
  updateError?: string | null;
  onUpdate?: (payload: UpdateExamInput) => void;
  onClose: () => void;
  onDeleted?: () => void;
}

export function ExamDetailPanel({
  open,
  exam,
  conflicts,
  loading,
  updating = false,
  updateError = null,
  onUpdate,
  onClose,
  onDeleted,
}: ExamDetailPanelProps) {
  const currentExam = exam ?? null;
  const deleteExam = useDeleteExam();
  const { data: rooms } = useRooms();
  const { data: instructors } = useInstructors();
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit form state
  const [editTarih, setEditTarih] = useState('');
  const [editBaslangic, setEditBaslangic] = useState('');
  const [editBitis, setEditBitis] = useState('');
  const [editDerslikIds, setEditDerslikIds] = useState<string[]>([]);
  const [editGozetmenIds, setEditGozetmenIds] = useState<string[]>([]);
  const [editOgretimUyesiId, setEditOgretimUyesiId] = useState('');
  const [editNotlar, setEditNotlar] = useState('');

  useEffect(() => {
    if (currentExam) {
      setEditTarih(currentExam.tarih ? currentExam.tarih.split('T')[0] : '');
      setEditBaslangic(currentExam.baslangic || '');
      setEditBitis(currentExam.bitis || '');
      setEditDerslikIds(
        currentExam.derslikler && currentExam.derslikler.length > 0
          ? currentExam.derslikler.map((dr) => dr.derslikId).filter(Boolean)
          : currentExam.derslikId
          ? [currentExam.derslikId]
          : []
      );
      setEditGozetmenIds(
        currentExam.gozetmenler?.map((g) => g.ogretimUyesiId).filter(Boolean) ?? []
      );
      setEditOgretimUyesiId(currentExam.ogretimUyesiId || '');
      setEditNotlar(currentExam.notlar || '');
    }
  }, [currentExam]);

  const handleSave = () => {
    if (!onUpdate || !currentExam) return;
    
    const payload: UpdateExamInput = {};
    if (editTarih !== (currentExam.tarih?.split('T')[0] || '')) {
      payload.tarih = editTarih || undefined;
    }
    if (editBaslangic !== (currentExam.baslangic || '')) {
      payload.baslangic = editBaslangic || undefined;
    }
    if (editBitis !== (currentExam.bitis || '')) {
      payload.bitis = editBitis || undefined;
    }
    if (JSON.stringify(editDerslikIds.sort()) !== JSON.stringify(
      (currentExam.derslikler?.map((dr) => dr.derslikId).filter(Boolean) ?? 
       currentExam.derslikId ? [currentExam.derslikId] : []).sort()
    )) {
      payload.derslikIds = editDerslikIds;
    }
    if (JSON.stringify(editGozetmenIds.sort()) !== JSON.stringify(
      (currentExam.gozetmenler?.map((g) => g.ogretimUyesiId).filter(Boolean) ?? []).sort()
    )) {
      payload.gozetmenIds = editGozetmenIds;
    }
    if (editOgretimUyesiId !== (currentExam.ogretimUyesiId || '')) {
      if (!editOgretimUyesiId) {
        alert('Sorumlu öğretim üyesi seçimi zorunludur.');
        return;
      }
      payload.ogretimUyesiId = editOgretimUyesiId;
    }
    if (editNotlar !== (currentExam.notlar || '')) {
      payload.notlar = editNotlar || undefined;
    }
    
    if (Object.keys(payload).length > 0) {
      onUpdate(payload);
      setIsEditing(false);
    }
  };

  const handleDerslikToggle = (roomId: string) => {
    if (editDerslikIds.includes(roomId)) {
      setEditDerslikIds(editDerslikIds.filter((id) => id !== roomId));
    } else {
      const selectedRoom = rooms?.find((r) => r.id === roomId);
      const ogrenciKapasitesi = currentExam?.ders?.ogrenciKapasitesi;
      
      // Kapasite kontrolü: Eğer öğrenci kapasitesi 30 veya daha az ise amfi seçilmesine izin verme
      if (selectedRoom && ogrenciKapasitesi && ogrenciKapasitesi <= 30) {
        if (selectedRoom.tip === 'amfi') {
          alert(`Bu dersin öğrenci kapasitesi ${ogrenciKapasitesi} kişi. ${ogrenciKapasitesi} kişi veya daha az öğrenci olan dersler için amfi seçilemez. Lütfen sınıf, laboratuvar veya diğer tip derslik seçin.`);
          return;
        }
      }
      
      setEditDerslikIds([...editDerslikIds, roomId]);
    }
  };

  const handleGozetmenToggle = (instructorId: string) => {
    if (editGozetmenIds.includes(instructorId)) {
      setEditGozetmenIds(editGozetmenIds.filter((id) => id !== instructorId));
    } else {
      setEditGozetmenIds([...editGozetmenIds, instructorId]);
    }
  };

  const handleDelete = () => {
    if (!currentExam) return;
    if (confirm('Bu sınavı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      deleteExam.mutate(currentExam.id, {
        onSuccess: () => {
          onClose();
          onDeleted?.();
        },
      });
    }
  };

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-y-0 right-0 z-40 w-full max-w-xl transform border-l bg-background shadow-2xl transition-transform duration-200 ease-out ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">
              {currentExam?.ders?.ad ?? 'Sınav Detayı'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {currentExam?.ders?.kod ?? 'Ders bilgisi bulunamadı'}
            </p>
          </div>
          <div className="flex gap-2">
            {currentExam && (
              <>
                <Button
                  type="button"
                  variant={isEditing ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => {
                    if (isEditing) {
                      setIsEditing(false);
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  disabled={updating || deleteExam.isPending}
                >
                  {isEditing ? 'İptal' : 'Düzenle'}
                </Button>
                {isEditing && (
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={handleSave}
                    disabled={updating}
                  >
                    {updating ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteExam.isPending || isEditing}
                >
                  {deleteExam.isPending ? 'Siliniyor...' : 'Sil'}
                </Button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted"
            >
              Kapat
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          {!currentExam ? (
            <div className="space-y-2">
              {loading ? (
                <p className="text-sm text-muted-foreground">
                  Sınav detayları yükleniyor…
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Detay görmek için bir sınav seçiniz.
                </p>
              )}
            </div>
          ) : (
            <>
              {loading && (
                <div className="rounded-md border border-dashed border-muted-foreground/40 bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
                  Güncel bilgiler getiriliyor…
                </div>
              )}

              <section className="space-y-2">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                  Genel Bilgiler
                </h3>
                <dl className="grid gap-3 text-sm md:grid-cols-2">
                  <DetailItem
                    baslik="Fakülte"
                    deger={currentExam.ders?.bolum?.fakulte?.ad}
                  />
                  <DetailItem
                    baslik="Bölüm"
                    deger={currentExam.ders?.bolum?.ad}
                  />
                  <DetailItem
                    baslik="Dönem"
                    deger={donemLabel(currentExam.donem)}
                  />
                  <DetailItem baslik="Sınıf" deger={String(currentExam.sinif)} />
                  <DetailItem baslik="Tür" deger={typeLabel(currentExam.tur)} />
                  <DetailItem 
                    baslik="Öğrenci Kapasitesi" 
                    deger={
                      currentExam.ders?.ogrenciKapasitesi 
                        ? `${currentExam.ders.ogrenciKapasitesi} öğrenci`
                        : 'Belirtilmemiş'
                    } 
                  />
                  <DurumControl
                    durum={currentExam.durum}
                    onUpdate={onUpdate}
                    updating={updating}
                  />
                </dl>
                {updateError && (
                  <p className="text-xs text-destructive">{updateError}</p>
                )}
              </section>

              {currentExam.tur === 'sinav' && (
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                    Zaman & Mekan
                  </h3>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs font-medium mb-1 block">Tarih</label>
                          <input
                            type="date"
                            value={editTarih}
                            onChange={(e) => setEditTarih(e.target.value)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium mb-1 block">Başlangıç</label>
                          <TimeInput
                            value={editBaslangic}
                            onChange={(value) => setEditBaslangic(value)}
                            step="60"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium mb-1 block">Bitiş</label>
                          <TimeInput
                            value={editBitis}
                            onChange={(value) => setEditBitis(value)}
                            step="60"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-2 block">Derslikler</label>
                        <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                          {currentExam.ders?.ogrenciKapasitesi && (
                            <div className="text-xs text-muted-foreground mb-2 pb-2 border-b">
                              Dersin öğrenci kapasitesi: <strong>{currentExam.ders.ogrenciKapasitesi} öğrenci</strong>
                              {currentExam.ders.ogrenciKapasitesi <= 30 && (
                                <span className="text-amber-600 ml-1">(Amfi seçilemez)</span>
                              )}
                            </div>
                          )}
                          {rooms?.map((r) => {
                            const ogrenciKapasitesi = currentExam.ders?.ogrenciKapasitesi;
                            const isDisabled = ogrenciKapasitesi && ogrenciKapasitesi <= 30 && r.tip === 'amfi';
                            const isSelected = editDerslikIds.includes(r.id);
                            
                            return (
                              <label 
                                key={r.id} 
                                className={`flex items-center gap-2 ${
                                  isDisabled && !isSelected 
                                    ? 'cursor-not-allowed opacity-50' 
                                    : 'cursor-pointer'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleDerslikToggle(r.id)}
                                  disabled={isDisabled && !isSelected}
                                  className="rounded border-gray-300"
                                />
                                <span className="text-sm">
                                  {r.ad} - {r.bina} (Kapasite: {r.kapasite}, Tip: {r.tip === 'amfi' ? 'Amfi' : r.tip === 'laboratuvar' ? 'Laboratuvar' : r.tip === 'sinif' ? 'Sınıf' : r.tip === 'toplanti' ? 'Toplantı' : 'Diğer'})
                                  {isDisabled && !isSelected && (
                                    <span className="text-xs text-amber-600 ml-1">(Seçilemez)</span>
                                  )}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block">Notlar</label>
                        <textarea
                          value={editNotlar}
                          onChange={(e) => setEditNotlar(e.target.value)}
                          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                          rows={3}
                        />
                      </div>
                    </div>
                  ) : (
                    <dl className="grid gap-3 text-sm md:grid-cols-2">
                      <DetailItem
                        baslik="Tarih"
                        deger={formatTarih(currentExam.tarih)}
                      />
                      <DetailItem
                        baslik="Saat"
                        deger={formatSaatAraligi(
                          currentExam.baslangic,
                          currentExam.bitis,
                        )}
                      />
                      <DetailItem
                        baslik="Derslikler"
                        deger={
                          currentExam.derslikler && currentExam.derslikler.length > 0
                            ? currentExam.derslikler.map((dr, idx) => (
                                <div key={dr.id || idx} className="mb-1">
                                  <div className="font-medium">{dr.derslik?.ad ?? 'Bilinmeyen'}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {dr.derslik?.bina ?? ''} - Kapasite: {dr.derslik?.kapasite ?? '—'}
                                  </div>
                                </div>
                              ))
                            : currentExam.derslik?.ad
                            ? (
                                <div>
                                  <div className="font-medium">{currentExam.derslik.ad}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {currentExam.derslik.bina} - Kapasite: {currentExam.derslik.kapasite}
                                  </div>
                                </div>
                              )
                            : 'Atanmadı'
                        }
                        sinifIsmi="md:col-span-2"
                      />
                      <DetailItem
                        baslik="Not"
                        deger={currentExam.notlar ?? 'Not girilmedi'}
                        sinifIsmi="md:col-span-2"
                      />
                    </dl>
                  )}
                </section>
              )}

              <section className="space-y-2">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                  Öğretim Üyesi & Gözetmenler
                </h3>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium mb-1 block">
                        Sorumlu Öğretim Üyesi <span className="text-destructive">*</span>
                      </label>
                      <select
                        required
                        value={editOgretimUyesiId}
                        onChange={(e) => setEditOgretimUyesiId(e.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Seçiniz</option>
                        {instructors?.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.ad} ({i.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-2 block">Gözetmenler</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                        {instructors?.map((i) => (
                          <label key={i.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editGozetmenIds.includes(i.id)}
                              onChange={() => handleGozetmenToggle(i.id)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">{i.ad} ({i.email})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <dl className="grid gap-3 text-sm md:grid-cols-2">
                    <DetailItem
                      baslik="Sorumlu Öğretim Üyesi"
                      deger={currentExam.ogretimUyesi?.ad ?? 'Atanmadı'}
                      sinifIsmi="md:col-span-2"
                    />
                    {currentExam.gozetmenler && currentExam.gozetmenler.length > 0 ? (
                      currentExam.gozetmenler.map((gozetmen) => (
                        <DetailItem
                          key={`${gozetmen.ogretimUyesiId}-${gozetmen.rol}`}
                          baslik={gozetmen.rol === 'birincil' ? 'Baş Gözetmen' : 'Gözetmen'}
                          deger={gozetmen.gozetmen?.ad ?? 'Atanmadı'}
                          sinifIsmi="md:col-span-2"
                        />
                      ))
                    ) : (
                      <DetailItem
                        baslik="Gözetmenler"
                        deger="Henüz gözetmen atanmadı"
                        sinifIsmi="md:col-span-2"
                      />
                    )}
                  </dl>
                )}
              </section>

              {currentExam.tur !== 'sinav' && (
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                    Teslim Bilgileri
                  </h3>
                  <dl className="grid gap-3 text-sm md:grid-cols-2">
                    <DetailItem
                      baslik="Teslim Tarihi"
                      deger={
                        currentExam.teslimTarihi
                          ? formatTarihSaat(currentExam.teslimTarihi)
                          : 'Belirlenmedi'
                      }
                    />
                    <DetailItem
                      baslik="Teslim Linki"
                      deger={
                        currentExam.teslimLinki ? (
                          <a
                            href={currentExam.teslimLinki}
                            className="text-primary underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Linki aç
                          </a>
                        ) : (
                          'Girilmedi'
                        )
                      }
                    />
                  </dl>
                </section>
              )}

              <section className="space-y-2">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                  Çakışma Kontrolleri
                </h3>
                <div className="rounded-md border border-dashed border-muted-foreground/40 bg-muted/30 px-4 py-3 text-sm space-y-3">
                  {loading ? (
                    <p className="text-muted-foreground">
                      Çakışmalar güncelleniyor…
                    </p>
                  ) : conflicts && conflicts.length > 0 ? (
                    <>
                      <ul className="space-y-2">
                        {conflicts.map((conflict) => (
                          <li
                            key={`${conflict.tur}-${conflict.ilgiliId ?? 'genel'}-${conflict.mesaj}`}
                            className="flex items-start gap-2"
                          >
                            <Badge variant={conflictVariant(conflict.seviye)}>
                              {conflictLabel(conflict.tur)}
                            </Badge>
                            <span className="text-sm text-foreground">
                              {conflict.mesaj}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {conflicts.some((c) => c.seviye === 'kritik') && (
                        <div className="pt-2 border-t border-muted-foreground/20">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={currentExam.cakismaOnayli ?? false}
                              onChange={(e) => {
                                if (onUpdate) {
                                  onUpdate({ cakismaOnayli: e.target.checked });
                                }
                              }}
                              disabled={updating}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">
                              Kontrollü çakışma onayı (Bu çakışmalara izin ver)
                            </span>
                          </label>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-emerald-600">
                      Çakışma tespit edilmedi.
                    </p>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  baslik,
  deger,
  sinifIsmi,
}: {
  baslik: string;
  deger: ReactNode;
  sinifIsmi?: string;
}) {
  return (
    <div className={sinifIsmi}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {baslik}
      </dt>
      <dd className="mt-1 text-sm text-foreground">{deger ?? '—'}</dd>
    </div>
  );
}

function StatusBadge({ durum }: { durum: Exam['durum'] }) {
  return <Badge variant={statusVariant(durum)}>{statusLabel(durum)}</Badge>;
}

function DurumControl({
  durum,
  onUpdate,
  updating,
}: {
  durum: Exam['durum'];
  onUpdate?: (payload: UpdateExamInput) => void;
  updating?: boolean;
}) {
  const [value, setValue] = useState<Exam['durum']>(durum);

  useEffect(() => {
    setValue(durum);
  }, [durum]);

  const hasChanged = value !== durum;

  return (
    <div className="md:col-span-2">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Durum
      </dt>
      <dd className="mt-1 flex flex-col gap-2 text-sm text-foreground md:flex-row md:items-center">
        <select
          className="w-full rounded-md border bg-background px-3 py-2 text-sm md:w-48"
          value={value}
          onChange={(event) => setValue(event.target.value as Exam['durum'])}
          disabled={updating}
        >
          <option value="planlanmadi">Planlanmadı</option>
          <option value="taslak">Taslak</option>
          <option value="yayinlandi">Yayınlandı</option>
        </select>
        <div className="flex items-center gap-2">
          <StatusBadge durum={value} />
          {onUpdate ? (
            <Button
              type="button"
              size="sm"
              onClick={() => onUpdate({ durum: value })}
              disabled={!hasChanged || updating}
            >
              {updating ? 'Kaydediliyor…' : 'Kaydet'}
            </Button>
          ) : null}
        </div>
      </dd>
    </div>
  );
}

function conflictLabel(value: ExamConflict['tur']) {
  switch (value) {
    case 'derslik':
      return 'Derslik';
    case 'ogretim-uyesi':
      return 'Öğretim Üyesi';
    case 'gozetmen':
      return 'Gözetmen';
    case 'musait-degil':
      return 'Müsait Değil';
    default:
      return value;
  }
}

function conflictVariant(value: ExamConflict['seviye']) {
  switch (value) {
    case 'kritik':
      return 'destructive' as const;
    case 'uyari':
      return 'warning' as const;
    default:
      return 'outline' as const;
  }
}

function donemLabel(value: Exam['donem']) {
  switch (value) {
    case 'guz':
      return 'Güz';
    case 'bahar':
      return 'Bahar';
    default:
      return value;
  }
}

function typeLabel(value: Exam['tur']) {
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

function statusLabel(value: Exam['durum']) {
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

function statusVariant(value: Exam['durum']) {
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

function formatSaatAraligi(
  baslangic?: string | null,
  bitis?: string | null,
) {
  if (!baslangic || !bitis) return 'Belirlenmedi';
  // Ensure 24-hour format (HH:mm)
  const start = baslangic.slice(0, 5);
  const end = bitis.slice(0, 5);
  return `${start} - ${end}`;
}

function formatTarih(value?: string | null) {
  if (!value) return 'Belirlenmedi';
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

function formatTarihSaat(deger: string) {
  try {
    const tarih = new Date(deger);
    const gun = tarih.getDate().toString().padStart(2, '0');
    const ay = (tarih.getMonth() + 1).toString().padStart(2, '0');
    const yil = tarih.getFullYear();
    const saat = tarih.getHours().toString().padStart(2, '0');
    const dakika = tarih.getMinutes().toString().padStart(2, '0');
    return `${gun}.${ay}.${yil} ${saat}:${dakika}`;
  } catch (error) {
    console.error('Tarih formatlama hatası', error);
    return deger;
  }
}

