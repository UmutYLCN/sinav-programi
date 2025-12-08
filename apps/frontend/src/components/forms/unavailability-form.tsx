import { useState, useEffect } from 'react';
import { useCreateUnavailability, useUpdateUnavailability, type CreateUnavailabilityDto, type UpdateUnavailabilityDto } from '@/services/unavailability';
import { useInstructors } from '@/services/instructors';
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
import type { InstructorUnavailability } from '@sinav/shared';

interface UnavailabilityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: InstructorUnavailability | null;
}

export function UnavailabilityForm({ open, onOpenChange, editing }: UnavailabilityFormProps) {
  const [ogretimUyesiId, setOgretimUyesiId] = useState('');
  const [tarih, setTarih] = useState('');
  const [baslangicSaat, setBaslangicSaat] = useState('');
  const [bitisSaat, setBitisSaat] = useState('');
  const [neden, setNeden] = useState('');
  const [zorla, setZorla] = useState(false);
  const [uyarilar, setUyarilar] = useState<string[]>([]);

  const { data: instructors } = useInstructors();
  const createMutation = useCreateUnavailability();
  const updateMutation = useUpdateUnavailability();

  const isEditing = Boolean(editing);
  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Initialize form when editing
  useEffect(() => {
    if (editing) {
      setOgretimUyesiId(editing.ogretimUyesiId);
      const baslangic = new Date(editing.baslangic);
      const bitis = new Date(editing.bitis);
      setTarih(baslangic.toISOString().split('T')[0]);
      setBaslangicSaat(`${baslangic.getHours().toString().padStart(2, '0')}:${baslangic.getMinutes().toString().padStart(2, '0')}`);
      setBitisSaat(`${bitis.getHours().toString().padStart(2, '0')}:${bitis.getMinutes().toString().padStart(2, '0')}`);
      setNeden(editing.neden);
      setZorla(editing.overrideEdildi || false);
      setUyarilar([]);
    } else {
      // Reset form for new entry
      const now = new Date();
      setOgretimUyesiId('');
      setTarih(now.toISOString().split('T')[0]);
      setBaslangicSaat('09:00');
      setBitisSaat('17:00');
      setNeden('');
      setZorla(false);
      setUyarilar([]);
    }
  }, [editing, open]);

  const combineDateTime = (date: string, time: string): string => {
    if (!date || !time) return '';
    const [hours, minutes] = time.split(':');
    const dateTime = new Date(date);
    dateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return dateTime.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ogretimUyesiId || !tarih || !baslangicSaat || !bitisSaat || !neden.trim()) {
      alert('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    const baslangic = combineDateTime(tarih, baslangicSaat);
    const bitis = combineDateTime(tarih, bitisSaat);

    if (new Date(bitis) <= new Date(baslangic)) {
      alert('Bitiş zamanı başlangıç zamanından sonra olmalıdır.');
      return;
    }

    try {
      if (isEditing && editing) {
        const dto: UpdateUnavailabilityDto = {
          ogretimUyesiId,
          baslangic,
          bitis,
          neden: neden.trim(),
          kaynak: 'manuel', // Varsayılan olarak manuel
          zorla,
        };
        const result = await updateMutation.mutateAsync({ id: editing.id, dto });
        if (result.uyarilar && result.uyarilar.length > 0) {
          setUyarilar(result.uyarilar);
        } else {
          onOpenChange(false);
        }
      } else {
        const dto: CreateUnavailabilityDto = {
          ogretimUyesiId,
          baslangic,
          bitis,
          neden: neden.trim(),
          kaynak: 'manuel', // Varsayılan olarak manuel
          zorla,
        };
        const result = await createMutation.mutateAsync(dto);
        if (result.uyarilar && result.uyarilar.length > 0) {
          setUyarilar(result.uyarilar);
        } else {
          onOpenChange(false);
        }
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Müsait Değil Kaydını Düzenle' : 'Yeni Müsait Değil Kaydı Ekle'}
            </DialogTitle>
            <DialogDescription>
              Gözetmenin müsait olmadığı zaman aralığını giriniz.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Gözetmen <span className="text-destructive">*</span>
              </label>
              <select
                required
                value={ogretimUyesiId}
                onChange={(e) => setOgretimUyesiId(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                disabled={isLoading}
              >
                <option value="">Gözetmen seçiniz</option>
                {instructors?.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.ad} ({i.email}) - {i.bolum?.ad}
                  </option>
                ))}
              </select>
            </div>

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
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Başlangıç Saati <span className="text-destructive">*</span>
                </label>
                <TimeInput
                  value={baslangicSaat}
                  onChange={(value) => setBaslangicSaat(value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Bitiş Saati <span className="text-destructive">*</span>
                </label>
                <TimeInput
                  value={bitisSaat}
                  onChange={(value) => setBitisSaat(value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Neden <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={neden}
                onChange={(e) => setNeden(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Örn: Toplantı, İzin, Başka bir görev..."
                maxLength={200}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maksimum 200 karakter
              </p>
            </div>

            <div className="rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-4">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={zorla}
                  onChange={(e) => setZorla(e.target.checked)}
                  className="rounded border-gray-300 mt-0.5"
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                    Çakışmayı Zorla (Override)
                  </div>
                  <div className="text-xs text-amber-800 dark:text-amber-200">
                    Bu seçeneği işaretlerseniz, bu zaman aralığı sınav programıyla çakışsa bile kaydedilebilir. 
                    Kayıt "override edildi" olarak işaretlenecektir.
                  </div>
                </div>
              </label>
            </div>

            {uyarilar.length > 0 && (
              <div className="rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-4">
                <div className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                  Uyarılar:
                </div>
                <ul className="text-xs text-amber-800 dark:text-amber-200 list-disc list-inside space-y-1">
                  {uyarilar.map((uyari, index) => (
                    <li key={index}>{uyari}</li>
                  ))}
                </ul>
              </div>
            )}

            {(createMutation.isError || updateMutation.isError) && (
              <div className="text-sm text-destructive">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : updateMutation.error instanceof Error
                  ? updateMutation.error.message
                  : 'Bir hata oluştu'}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setUyarilar([]);
              }}
              disabled={isLoading}
            >
              {uyarilar.length > 0 ? 'Kapat' : 'İptal'}
            </Button>
            {uyarilar.length === 0 && (
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? isEditing
                    ? 'Güncelleniyor...'
                    : 'Ekleniyor...'
                  : isEditing
                  ? 'Güncelle'
                  : 'Ekle'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

