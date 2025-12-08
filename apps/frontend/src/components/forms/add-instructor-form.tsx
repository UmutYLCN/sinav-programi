import { useState, useEffect } from 'react';
import { useCreateInstructor, useUpdateInstructor, type Instructor } from '@/services/instructors';
import { useDepartments } from '@/services/departments';
import { KULLANICI_ROL_LISTESI } from '@sinav/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AddInstructorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Instructor | null;
}

const ROL_LABELS: Record<string, string> = {
  YONETICI: 'Yönetici',
  BOLUM_SORUMLUSU: 'Bölüm Sorumlusu',
  OGRETIM_UYESI: 'Öğretim Üyesi',
};

export function AddInstructorForm({
  open,
  onOpenChange,
  initialData,
}: AddInstructorFormProps) {
  const [ad, setAd] = useState('');
  const [email, setEmail] = useState('');
  const [bolumId, setBolumId] = useState('');
  const [roller, setRoller] = useState<string[]>(['OGRETIM_UYESI']);
  const [aktif, setAktif] = useState(true);
  const { data: departments } = useDepartments();
  const createMutation = useCreateInstructor();
  const updateMutation = useUpdateInstructor();
  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setAd(initialData.ad);
      setEmail(initialData.email ?? '');
      setBolumId(initialData.bolumId);
      setRoller(Array.isArray(initialData.roller) ? initialData.roller : ['OGRETIM_UYESI']);
      setAktif(initialData.aktif ?? true);
    } else {
      setAd('');
      setEmail('');
      setBolumId('');
      setRoller(['OGRETIM_UYESI']);
      setAktif(true);
    }
  }, [initialData, open]);

  const handleRolChange = (rol: string, checked: boolean) => {
    if (checked) {
      setRoller([...roller, rol]);
    } else {
      setRoller(roller.filter((r) => r !== rol));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bolumId || roller.length === 0) return;
    try {
      if (isEditMode && initialData) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          dto: {
            ad,
            email,
            bolumId,
            roller: roller as any,
            aktif,
          },
        });
      } else {
        await createMutation.mutateAsync({
          ad,
          email,
          bolumId,
          roller: roller as any,
          aktif,
        });
      }
      setAd('');
      setEmail('');
      setBolumId('');
      setRoller(['OGRETIM_UYESI']);
      setAktif(true);
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
            <DialogTitle>{isEditMode ? 'Öğretim Üyesi Düzenle' : 'Yeni Öğretim Üyesi Ekle'}</DialogTitle>
            <DialogDescription>
              Öğretim üyesi bilgilerini giriniz. Önce bölüm seçmelisiniz.
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
            <div>
              <label className="text-sm font-medium mb-2 block">
                Ad Soyad <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={150}
                value={ad}
                onChange={(e) => setAd(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Örn: Ahmet Yılmaz"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                E-posta <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                required
                maxLength={200}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="ornek@universite.edu.tr"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Roller <span className="text-destructive">*</span>
              </label>
              <div className="space-y-2">
                {KULLANICI_ROL_LISTESI.map((rol) => (
                  <label key={rol} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={roller.includes(rol)}
                      onChange={(e) => handleRolChange(rol, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{ROL_LABELS[rol] || rol}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={aktif}
                  onChange={(e) => setAktif(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Aktif</span>
              </label>
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
              disabled={isLoading || !bolumId || roller.length === 0}
            >
              {isLoading ? (isEditMode ? 'Güncelleniyor...' : 'Ekleniyor...') : (isEditMode ? 'Güncelle' : 'Ekle')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

