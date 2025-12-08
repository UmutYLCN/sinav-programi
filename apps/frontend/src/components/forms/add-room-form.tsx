import { useState, useEffect } from 'react';
import { useCreateRoom, useUpdateRoom, type Room } from '@/services/rooms';
import { DERSLIK_TIP_LISTESI } from '@sinav/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AddRoomFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Room | null;
}

const TIP_LABELS: Record<string, string> = {
  amfi: 'Amfi',
  laboratuvar: 'Laboratuvar',
  sinif: 'Sınıf',
  toplanti: 'Toplantı',
  diger: 'Diğer',
};

export function AddRoomForm({ open, onOpenChange, initialData }: AddRoomFormProps) {
  const [ad, setAd] = useState('');
  const [bina, setBina] = useState('');
  const [tip, setTip] = useState<'amfi' | 'laboratuvar' | 'sinif' | 'toplanti' | 'diger'>('sinif');
  const [kapasite, setKapasite] = useState(30);
  const createMutation = useCreateRoom();
  const updateMutation = useUpdateRoom();
  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setAd(initialData.ad);
      setBina(initialData.bina ?? '');
      setTip(initialData.tip ?? 'sinif');
      setKapasite(initialData.kapasite ?? 30);
    } else {
      setAd('');
      setBina('');
      setTip('sinif');
      setKapasite(30);
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && initialData) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          dto: {
            ad,
            bina,
            tip,
            kapasite,
          },
        });
      } else {
        await createMutation.mutateAsync({
          ad,
          bina,
          tip,
          kapasite,
        });
      }
      setAd('');
      setBina('');
      setTip('sinif');
      setKapasite(30);
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
            <DialogTitle>{isEditMode ? 'Derslik Düzenle' : 'Yeni Derslik Ekle'}</DialogTitle>
            <DialogDescription>
              Derslik bilgilerini giriniz.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Derslik Adı <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={ad}
                  onChange={(e) => setAd(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Örn: A-101"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Bina <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={bina}
                  onChange={(e) => setBina(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Örn: A Blok"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tip <span className="text-destructive">*</span>
                </label>
                <select
                  required
                  value={tip}
                  onChange={(e) =>
                    setTip(e.target.value as typeof tip)
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {DERSLIK_TIP_LISTESI.map((t) => (
                    <option key={t} value={t}>
                      {TIP_LABELS[t] || t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Kapasite <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={kapasite}
                  onChange={(e) => setKapasite(parseInt(e.target.value) || 1)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
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
              disabled={isLoading}
            >
              {isLoading ? (isEditMode ? 'Güncelleniyor...' : 'Ekleniyor...') : (isEditMode ? 'Güncelle' : 'Ekle')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

