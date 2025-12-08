import { useState, useEffect } from 'react';
import { useCreateFaculty, useUpdateFaculty, type Faculty } from '@/services/faculties';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AddFacultyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Faculty | null;
}

export function AddFacultyForm({ open, onOpenChange, initialData }: AddFacultyFormProps) {
  const [ad, setAd] = useState('');
  const [kod, setKod] = useState('');
  const createMutation = useCreateFaculty();
  const updateMutation = useUpdateFaculty();
  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setAd(initialData.ad);
      setKod(initialData.kod);
    } else {
      setAd('');
      setKod('');
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, dto: { ad, kod } });
      } else {
        await createMutation.mutateAsync({ ad, kod });
      }
      setAd('');
      setKod('');
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
            <DialogTitle>{isEditMode ? 'Fakülte Düzenle' : 'Yeni Fakülte Ekle'}</DialogTitle>
            <DialogDescription>
              Fakülte adı ve kodunu giriniz.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Fakülte Adı <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={150}
                value={ad}
                onChange={(e) => setAd(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Örn: Mühendislik Fakültesi"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Fakülte Kodu <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={50}
                value={kod}
                onChange={(e) => setKod(e.target.value.toUpperCase())}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Örn: MUH"
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (isEditMode ? 'Güncelleniyor...' : 'Ekleniyor...') : (isEditMode ? 'Güncelle' : 'Ekle')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

