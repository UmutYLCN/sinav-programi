import { useState, useEffect } from 'react';
import { useCreateDepartment, useUpdateDepartment, type Department } from '@/services/departments';
import { useFaculties } from '@/services/faculties';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AddDepartmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Department | null;
}

export function AddDepartmentForm({
  open,
  onOpenChange,
  initialData,
}: AddDepartmentFormProps) {
  const [ad, setAd] = useState('');
  const [kod, setKod] = useState('');
  const [fakulteId, setFakulteId] = useState('');
  const { data: facultiesResponse } = useFaculties();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setAd(initialData.ad);
      setKod(initialData.kod);
      setFakulteId(initialData.fakulteId);
    } else {
      setAd('');
      setKod('');
      setFakulteId('');
    }
  }, [initialData, open]);

  const faculties = facultiesResponse?.veriler ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fakulteId) return;
    try {
      if (isEditMode && initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, dto: { ad, kod, fakulteId } });
      } else {
        await createMutation.mutateAsync({ ad, kod, fakulteId });
      }
      setAd('');
      setKod('');
      setFakulteId('');
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
            <DialogTitle>{isEditMode ? 'Bölüm Düzenle' : 'Yeni Bölüm Ekle'}</DialogTitle>
            <DialogDescription>
              Bölüm bilgilerini giriniz. Önce fakülte seçmelisiniz.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Fakülte <span className="text-destructive">*</span>
              </label>
              <select
                required
                value={fakulteId}
                onChange={(e) => setFakulteId(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">Fakülte seçiniz</option>
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.kod} - {f.ad}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Bölüm Adı <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={150}
                value={ad}
                onChange={(e) => setAd(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Örn: Bilgisayar Mühendisliği"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Bölüm Kodu <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={50}
                value={kod}
                onChange={(e) => setKod(e.target.value.toUpperCase())}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Örn: BM"
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
              disabled={isLoading || !fakulteId}
            >
              {isLoading ? (isEditMode ? 'Güncelleniyor...' : 'Ekleniyor...') : (isEditMode ? 'Güncelle' : 'Ekle')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

