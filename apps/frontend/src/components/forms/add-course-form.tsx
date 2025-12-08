import { useState, useEffect } from 'react';
import { useCreateCourse, useUpdateCourse, type Course } from '@/services/courses';
import { useDepartments } from '@/services/departments';
import { DONEMLER } from '@sinav/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AddCourseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Course | null;
}

export function AddCourseForm({ open, onOpenChange, initialData }: AddCourseFormProps) {
  const [kod, setKod] = useState('');
  const [ad, setAd] = useState('');
  const [sinif, setSinif] = useState(1);
  const [donem, setDonem] = useState<'guz' | 'bahar'>('guz');
  const [bolumId, setBolumId] = useState('');
  const [kredi, setKredi] = useState<number | undefined>(undefined);
  const [ogrenciKapasitesi, setOgrenciKapasitesi] = useState<number | undefined>(undefined);
  const { data: departments } = useDepartments();
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setKod(initialData.kod);
      setAd(initialData.ad);
      setSinif(initialData.sinif ?? 1);
      setDonem(initialData.donem ?? 'guz');
      setBolumId(initialData.bolumId);
      setKredi(initialData.kredi);
      setOgrenciKapasitesi(initialData.ogrenciKapasitesi ?? undefined);
    } else {
      setKod('');
      setAd('');
      setSinif(1);
      setDonem('guz');
      setBolumId('');
      setKredi(undefined);
      setOgrenciKapasitesi(undefined);
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bolumId) return;
    try {
      console.log('🔍 FORM SUBMIT - Başlangıç durumu:', {
        isEditMode,
        ogrenciKapasitesi,
        ogrenciKapasitesiType: typeof ogrenciKapasitesi,
        ogrenciKapasitesiIsNaN: isNaN(ogrenciKapasitesi as number),
        kredi,
      });

      // DTO oluştur - sadece tanımlı değerleri gönder
      const dto: any = {
        kod,
        ad,
        sinif,
        donem,
        bolumId,
      };
      
      console.log('🔍 FORM SUBMIT - İlk DTO:', JSON.stringify(dto, null, 2));
      
      // Kredi için: değer varsa ekle, yoksa undefined bırak (güncellemede değişmez)
      if (kredi !== undefined && kredi !== null && !isNaN(kredi) && kredi > 0) {
        dto.kredi = kredi;
        console.log('🔍 FORM SUBMIT - Kredi eklendi:', kredi);
      } else {
        console.log('🔍 FORM SUBMIT - Kredi eklenmedi:', { kredi, undefined: kredi === undefined, null: kredi === null, isNaN: isNaN(kredi as number) });
        if (isEditMode) {
          // Güncelleme modunda, eğer alan boşsa null gönder (temizlemek için)
          dto.kredi = null;
        }
      }
      
      // Öğrenci kapasitesi için: geçerli değer varsa ekle
      console.log('🔍 FORM SUBMIT - Öğrenci kapasitesi kontrolü:', {
        ogrenciKapasitesi,
        undefined: ogrenciKapasitesi === undefined,
        null: ogrenciKapasitesi === null,
        type: typeof ogrenciKapasitesi,
        isNumber: typeof ogrenciKapasitesi === 'number',
        isNaN: isNaN(ogrenciKapasitesi as number),
        greaterThanZero: ogrenciKapasitesi !== undefined && ogrenciKapasitesi !== null && ogrenciKapasitesi > 0,
      });

      if (ogrenciKapasitesi !== undefined && ogrenciKapasitesi !== null && typeof ogrenciKapasitesi === 'number' && !isNaN(ogrenciKapasitesi) && ogrenciKapasitesi > 0) {
        dto.ogrenciKapasitesi = ogrenciKapasitesi;
        console.log('✅ FORM SUBMIT - Öğrenci kapasitesi eklendi:', ogrenciKapasitesi);
      } else {
        if (isEditMode) {
          // Güncelleme modunda, eğer alan boşsa null gönder (temizlemek için)
          dto.ogrenciKapasitesi = null;
          console.log('🔍 FORM SUBMIT - Güncelleme modu: ogrenciKapasitesi null olarak ayarlandı');
        } else {
          console.log('❌ FORM SUBMIT - Öğrenci kapasitesi eklenmedi (yeni kayıt modu)');
        }
      }

      console.log('🔍 FORM SUBMIT - Final DTO:', JSON.stringify(dto, null, 2));
      console.log('🔍 FORM SUBMIT - Final DTO ogrenciKapasitesi:', dto.ogrenciKapasitesi);

      if (isEditMode && initialData) {
        console.log('🔍 FORM SUBMIT - Güncelleme mutation çağrılıyor');
        const result = await updateMutation.mutateAsync({
          id: initialData.id,
          dto,
        });
        console.log('🔍 FORM SUBMIT - Güncelleme sonucu:', JSON.stringify(result, null, 2));
        console.log('🔍 FORM SUBMIT - Güncelleme sonucu ogrenciKapasitesi:', result?.veri?.ogrenciKapasitesi);
      } else {
        console.log('🔍 FORM SUBMIT - Yeni kayıt mutation çağrılıyor');
        const result = await createMutation.mutateAsync(dto);
        console.log('🔍 FORM SUBMIT - Yeni kayıt sonucu:', JSON.stringify(result, null, 2));
        console.log('🔍 FORM SUBMIT - Yeni kayıt sonucu ogrenciKapasitesi:', result?.veri?.ogrenciKapasitesi);
      }
      setKod('');
      setAd('');
      setSinif(1);
      setDonem('guz');
      setBolumId('');
      setKredi(undefined);
      setOgrenciKapasitesi(undefined);
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const isError = createMutation.isError || updateMutation.isError;
  const error = createMutation.error || updateMutation.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Ders Düzenle' : 'Yeni Ders Ekle'}</DialogTitle>
            <DialogDescription>
              Ders bilgilerini giriniz. Önce bölüm seçmelisiniz.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Bölüm <span className="text-destructive">*</span>
              </label>
              <select
                required
                value={bolumId}
                onChange={(e) => setBolumId(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">Bölüm seçiniz</option>
                {departments?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.kod} - {d.ad}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Ders Kodu <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={kod}
                  onChange={(e) => setKod(e.target.value.toUpperCase())}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Örn: BM101"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Sınıf <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={6}
                  value={sinif}
                  onChange={(e) => setSinif(parseInt(e.target.value) || 1)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Ders Adı <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={200}
                value={ad}
                onChange={(e) => setAd(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Örn: Programlama Dilleri"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Dönem <span className="text-destructive">*</span>
                </label>
                <select
                  required
                  value={donem}
                  onChange={(e) => setDonem(e.target.value as 'guz' | 'bahar')}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {DONEMLER.map((d) => (
                    <option key={d} value={d}>
                      {d === 'guz' ? 'Güz' : 'Bahar'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Kredi</label>
                <input
                  type="number"
                  min={1}
                  value={kredi || ''}
                  onChange={(e) =>
                    setKredi(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Opsiyonel"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Öğrenci Kapasitesi</label>
              <input
                type="number"
                min={1}
                value={ogrenciKapasitesi !== undefined && ogrenciKapasitesi !== null ? String(ogrenciKapasitesi) : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || value === null || value === undefined) {
                    setOgrenciKapasitesi(undefined);
                  } else {
                    const numValue = parseInt(value, 10);
                    setOgrenciKapasitesi(isNaN(numValue) ? undefined : numValue);
                  }
                }}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Opsiyonel - Örn: 50"
              />
            </div>
            {isError && (
              <div className="text-sm text-destructive">
                {error instanceof Error
                  ? error.message
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
            <Button
              type="submit"
              disabled={isLoading || !bolumId}
            >
              {isLoading ? (isEditMode ? 'Güncelleniyor...' : 'Ekleniyor...') : (isEditMode ? 'Güncelle' : 'Ekle')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

