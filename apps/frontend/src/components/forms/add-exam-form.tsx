import { useState } from 'react';
import { useCreateExam } from '@/services/exams';
import { useCourses } from '@/services/courses';
import { useRooms } from '@/services/rooms';
import { useInstructors } from '@/services/instructors';
import { DONEMLER, EXAM_DURUM_LISTESI, EXAM_TUR_LISTESI } from '@sinav/shared';
import { Button } from '@/components/ui/button';
import { TimeInput } from '@/components/ui/time-input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AddExamFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TUR_LABELS: Record<string, string> = {
  sinav: 'Sınav',
  odev: 'Ödev',
  proje: 'Proje',
};

const DURUM_LABELS: Record<string, string> = {
  planlanmadi: 'Planlanmadı',
  taslak: 'Taslak',
  yayinlandi: 'Yayınlandı',
};

export function AddExamForm({ open, onOpenChange }: AddExamFormProps) {
  const [dersId, setDersId] = useState('');
  const [tur, setTur] = useState<'sinav' | 'odev' | 'proje'>('sinav');
  const [durum, setDurum] = useState<'planlanmadi' | 'taslak' | 'yayinlandi'>('planlanmadi');
  const [donem, setDonem] = useState<'guz' | 'bahar' | ''>('');
  const [sinif, setSinif] = useState<number | undefined>(undefined);

  // Sınav için gerekli alanlar
  const [tarih, setTarih] = useState('');
  const [baslangic, setBaslangic] = useState('');
  const [bitis, setBitis] = useState('');
  const [derslikIds, setDerslikIds] = useState<string[]>([]);

  // Opsiyonel alanlar
  const [ogretimUyesiId, setOgretimUyesiId] = useState('');
  const [gozetmenIds, setGozetmenIds] = useState<string[]>([]);
  const [notlar, setNotlar] = useState('');
  const [cakismaOnayli, setCakismaOnayli] = useState(false);

  // Ödev/Proje için alanlar
  const [teslimTarihi, setTeslimTarihi] = useState('');
  const [teslimLinki, setTeslimLinki] = useState('');

  const { data: courses } = useCourses();
  const { data: rooms } = useRooms();
  const { data: instructors } = useInstructors();
  const createMutation = useCreateExam();

  // Ders seçildiğinde otomatik dönem/sınıf doldurma ve kapasite bilgisi alma
  const handleDersChange = (id: string) => {
    setDersId(id);
    const selectedCourse = courses?.find((c) => c.id === id);
    if (selectedCourse) {
      // Dersin öğrenci kapasitesini 'Sınıf' alanına (Öğrenci Sayısı) aktar
      if (selectedCourse.ogrenciKapasitesi) {
        setSinif(selectedCourse.ogrenciKapasitesi);
      }
    }
  };

  const isSinav = tur === 'sinav';

  const handleGozetmenToggle = (instructorId: string) => {
    if (gozetmenIds.includes(instructorId)) {
      setGozetmenIds(gozetmenIds.filter((id) => id !== instructorId));
    } else {
      setGozetmenIds([...gozetmenIds, instructorId]);
    }
  };

  const handleDerslikToggle = (roomId: string) => {
    if (derslikIds.includes(roomId)) {
      setDerslikIds(derslikIds.filter((id) => id !== roomId));
    } else {
      const selectedRoom = rooms?.find((r) => r.id === roomId);
      const selectedCourse = courses?.find((c) => c.id === dersId);
      const ogrenciKapasitesi = selectedCourse?.ogrenciKapasitesi;

      // Kapasite kontrolü: Eğer öğrenci kapasitesi 30 veya daha az ise amfi seçilmesine izin verme
      if (selectedRoom && ogrenciKapasitesi && ogrenciKapasitesi <= 30) {
        if (selectedRoom.tip === 'amfi') {
          alert(`Bu dersin öğrenci kapasitesi ${ogrenciKapasitesi} kişi. ${ogrenciKapasitesi} kişi veya daha az öğrenci olan dersler için amfi seçilemez. Lütfen sınıf, laboratuvar veya diğer tip derslik seçin.`);
          return;
        }
      }

      setDerslikIds([...derslikIds, roomId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dersId) return;

    if (!ogretimUyesiId) {
      alert('Sorumlu öğretim üyesi seçimi zorunludur.');
      return;
    }

    if (isSinav && (!tarih || !baslangic || !bitis)) {
      alert('Sınav türü için tarih, başlangıç ve bitiş saati zorunludur.');
      return;
    }

    try {
      const dto: any = {
        dersId,
        tur,
        durum,
      };

      if (donem) dto.donem = donem;
      if (sinif) dto.sinif = sinif;
      if (notlar) dto.notlar = notlar;

      if (isSinav) {
        // input type="date" zaten YYYY-MM-DD formatında döner
        dto.tarih = tarih || undefined;
        // input type="time" zaten HH:mm formatında döner
        dto.baslangic = baslangic || undefined;
        dto.bitis = bitis || undefined;
        // Sadece geçerli UUID'leri gönder
        const validDerslikIds = derslikIds.filter((id) => id && id.trim() !== '');
        if (validDerslikIds.length > 0) {
          dto.derslikIds = validDerslikIds;
        }
      } else {
        if (teslimTarihi) dto.teslimTarihi = teslimTarihi;
        if (teslimLinki) dto.teslimLinki = teslimLinki;
      }

      dto.ogretimUyesiId = ogretimUyesiId;
      if (gozetmenIds.length > 0) dto.gozetmenIds = gozetmenIds;
      if (cakismaOnayli) dto.cakismaOnayli = true;

      await createMutation.mutateAsync(dto);

      // Reset form
      setDersId('');
      setTur('sinav');
      setDurum('planlanmadi');
      setDonem('');
      setSinif(undefined);
      setTarih('');
      setBaslangic('');
      setBitis('');
      setDerslikIds([]);
      setOgretimUyesiId('');
      setGozetmenIds([]);
      setNotlar('');
      setCakismaOnayli(false);
      setTeslimTarihi('');
      setTeslimLinki('');

      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Yeni Sınav Ekle</DialogTitle>
            <DialogDescription>
              Sınav bilgilerini giriniz. Önce ders seçmelisiniz.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Ders <span className="text-destructive">*</span>
              </label>
              <select
                required
                value={dersId}
                onChange={(e) => handleDersChange(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">Ders seçiniz</option>
                {courses?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.kod} - {c.ad} ({c.bolum?.ad})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tür <span className="text-destructive">*</span>
                </label>
                <select
                  required
                  value={tur}
                  onChange={(e) => setTur(e.target.value as typeof tur)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {EXAM_TUR_LISTESI.map((t) => (
                    <option key={t} value={t}>
                      {TUR_LABELS[t] || t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Durum <span className="text-destructive">*</span>
                </label>
                <select
                  required
                  value={durum}
                  onChange={(e) => setDurum(e.target.value as typeof durum)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {EXAM_DURUM_LISTESI.map((d) => (
                    <option key={d} value={d}>
                      {DURUM_LABELS[d] || d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Dönem</label>
                <select
                  value={donem}
                  onChange={(e) => setDonem(e.target.value as typeof donem)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Ders dönemini kullan</option>
                  {DONEMLER.map((d) => (
                    <option key={d} value={d}>
                      {d === 'guz' ? 'Güz' : 'Bahar'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Öğrenci Sayısı (Mevcut)</label>
                <input
                  type="number"
                  min={1}
                  value={sinif || ''}
                  onChange={(e) => setSinif(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Ders kapasitesini kullan"
                />
              </div>
            </div>

            {isSinav ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Tarih <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={tarih}
                      onChange={(e) => setTarih(e.target.value)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Başlangıç <span className="text-destructive">*</span>
                    </label>
                    <TimeInput
                      value={baslangic}
                      onChange={(value) => setBaslangic(value)}
                      required
                      step="60"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Bitiş <span className="text-destructive">*</span>
                    </label>
                    <TimeInput
                      value={bitis}
                      onChange={(value) => setBitis(value)}
                      required
                      step="60"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Derslikler (Birden fazla seçebilirsiniz)
                  </label>
                  {(() => {
                    const selectedCourse = courses?.find((c) => c.id === dersId);
                    const ogrenciKapasitesi = selectedCourse?.ogrenciKapasitesi;
                    return (
                      <>
                        {ogrenciKapasitesi && (
                          <div className="text-xs text-muted-foreground mb-2 pb-2 border-b">
                            Dersin öğrenci kapasitesi: <strong>{ogrenciKapasitesi} öğrenci</strong>
                            {ogrenciKapasitesi <= 30 && (
                              <span className="text-amber-600 ml-1">(Amfi seçilemez)</span>
                            )}
                          </div>
                        )}
                        <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                          {rooms?.map((r) => {
                            const isDisabled = ogrenciKapasitesi && ogrenciKapasitesi <= 30 && r.tip === 'amfi';
                            const isSelected = derslikIds.includes(r.id);

                            return (
                              <label
                                key={r.id}
                                className={`flex items-center gap-2 ${isDisabled && !isSelected
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
                          {rooms?.length === 0 && (
                            <p className="text-sm text-muted-foreground">Derslik bulunamadı</p>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Teslim Tarihi</label>
                  <input
                    type="date"
                    value={teslimTarihi}
                    onChange={(e) => setTeslimTarihi(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Teslim Bağlantısı</label>
                  <input
                    type="url"
                    value={teslimLinki}
                    onChange={(e) => setTeslimLinki(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">
                Sorumlu Öğretim Üyesi <span className="text-destructive">*</span>
              </label>
              <select
                required
                value={ogretimUyesiId}
                onChange={(e) => setOgretimUyesiId(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">Öğretim üyesi seçiniz</option>
                {instructors?.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.ad} ({i.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Gözetmenler (İstediğiniz kadar seçebilirsiniz)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {instructors?.map((i) => (
                  <label key={i.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gozetmenIds.includes(i.id)}
                      onChange={() => handleGozetmenToggle(i.id)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{i.ad} ({i.email})</span>
                  </label>
                ))}
                {instructors?.length === 0 && (
                  <p className="text-sm text-muted-foreground">Gözetmen bulunamadı</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Notlar</label>
              <textarea
                value={notlar}
                onChange={(e) => setNotlar(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                rows={3}
                placeholder="Ek notlar..."
              />
            </div>

            {isSinav && (
              <div className="rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-4">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cakismaOnayli}
                    onChange={(e) => setCakismaOnayli(e.target.checked)}
                    className="rounded border-gray-300 mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                      Kontrollü Çakışma Onayı
                    </div>
                    <div className="text-xs text-amber-800 dark:text-amber-200">
                      Bu seçeneği işaretlerseniz, çakışma tespit edilse bile sınav kaydedilebilir.
                      Örnek: İki bölüm aynı dersi alıyorsa ve sınıf mevcudu azsa aynı sınıfa yazılabilir.
                    </div>
                  </div>
                </label>
              </div>
            )}

            {createMutation.isError && (
              <div className="text-sm text-destructive">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : 'Bir hata oluştu'}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              İptal
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !dersId}>
              {createMutation.isPending ? 'Ekleniyor...' : 'Ekle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

