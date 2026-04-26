import { useState } from 'react';
import { DONEMLER, EXAM_DURUM_LISTESI } from '@sinav/shared';
import {
  useAutoAssignInvigilators,
  type AutoAssignResult,
} from '@/services/exams';
import { useDepartments } from '@/services/departments';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AutoAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AutoAssignDialog({ open, onOpenChange }: AutoAssignDialogProps) {
  const [donem, setDonem] = useState('');
  const [bolumId, setBolumId] = useState('');
  const [durum, setDurum] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [result, setResult] = useState<AutoAssignResult | null>(null);

  const { data: departments } = useDepartments();
  const autoAssignMutation = useAutoAssignInvigilators();

  const handleAutoAssign = async () => {
    setIsAssigning(true);
    try {
      const res = await autoAssignMutation.mutateAsync({
        donem: donem || undefined,
        bolumId: bolumId || undefined,
        durum: durum || undefined,
      });
      setResult(res);
    } catch {
      alert('Otomatik atama sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose} containerClassName="max-w-2xl">
      <DialogContent onClose={handleClose}>
        <DialogHeader>
          <DialogTitle>Otomatik Gözetmen Atama</DialogTitle>
          <DialogDescription>
            Sistem müsaitlik ve yük dengesini göz önünde bulundurarak atama yapar.
            Aynı saatte birden fazla sınava atanmış gözetmenler otomatik olarak hariç tutulur.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-2 text-sm font-medium">
                <span>Dönem</span>
                <select
                  className="rounded-md border bg-background px-3 py-2 text-sm"
                  value={donem}
                  onChange={(e) => setDonem(e.target.value)}
                >
                  <option value="">Tümü</option>
                  {DONEMLER.map((d) => (
                    <option key={d} value={d}>
                      {d === 'guz' ? 'Güz' : 'Bahar'}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium">
                <span>Bölüm</span>
                <select
                  className="rounded-md border bg-background px-3 py-2 text-sm"
                  value={bolumId}
                  onChange={(e) => setBolumId(e.target.value)}
                >
                  <option value="">Tümü</option>
                  {departments?.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.ad}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium">
                <span>Durum</span>
                <select
                  className="rounded-md border bg-background px-3 py-2 text-sm"
                  value={durum}
                  onChange={(e) => setDurum(e.target.value)}
                >
                  <option value="">Tümü</option>
                  {EXAM_DURUM_LISTESI.map((d) => (
                    <option key={d} value={d}>
                      {d === 'planlanmadi'
                        ? 'Planlanmadı'
                        : d === 'taslak'
                          ? 'Taslak'
                          : 'Yayınlandı'}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={handleClose}>
                İptal
              </Button>
              <Button
                onClick={handleAutoAssign}
                disabled={isAssigning}
                className="flex items-center gap-2"
              >
                {isAssigning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Atanıyor...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    Otomatik Ata
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
              <p className="text-sm text-green-800">{result.mesaj}</p>
            </div>

            {result.atananlar.length > 0 && (
              <div>
                <h3 className="mb-2 font-semibold">
                  Başarıyla Atanan Sınavlar ({result.atananlar.length})
                </h3>
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {result.atananlar.map((item) => (
                    <div
                      key={item.sinavId}
                      className="rounded-lg border p-3 space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.sinavKod}</span>
                        <Badge>{item.gozetmenSayisi} gözetmen</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.gozetmenler.map((g) => (
                          <span key={g.id} className="mr-2">
                            • {g.ad}
                            {g.derslik && g.derslik !== '—' && (
                              <span className="ml-1 text-xs">({g.derslik})</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.atanamayanlar.length > 0 && (
              <div>
                <h3 className="mb-2 flex items-center gap-2 font-semibold">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  Atanamayan Sınavlar ({result.atanamayanlar.length})
                </h3>
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {result.atanamayanlar.map((item) => (
                    <div
                      key={item.sinavId}
                      className="rounded-lg border border-destructive p-3"
                    >
                      <div className="font-medium">{item.sinavKod}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.sebep}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={handleClose}>Kapat</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
