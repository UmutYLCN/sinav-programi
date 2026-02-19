import { useState, useMemo } from 'react';
import { DONEMLER, EXAM_DURUM_LISTESI, type Exam } from '@sinav/shared';
import {
  useExams,
  useAutoAssignInvigilators,
  type AutoAssignInvigilatorsDto,
  type AutoAssignResult,
} from '@/services/exams';
import { useDepartments } from '@/services/departments';
import { Button } from '@/components/ui/button';
import { Select, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

type AssignmentMode = 'all' | 'selected';

export default function AutoAssignInvigilatorsPage() {
  const [donem, setDonem] = useState<string>('');
  const [bolumId, setBolumId] = useState<string>('');
  const [durum, setDurum] = useState<string>('');
  const [esikDeger, setEsikDeger] = useState<number>(30);
  const [assignmentMode, setAssignmentMode] = useState<AssignmentMode>('all');
  const [selectedExamIds, setSelectedExamIds] = useState<Set<string>>(
    new Set(),
  );
  const [previewResult, setPreviewResult] = useState<AutoAssignResult | null>(
    null,
  );
  const [isAssigning, setIsAssigning] = useState(false);

  const { data: departments } = useDepartments();
  const { data: examsData } = useExams({
    donem: donem || undefined,
    bolumId: bolumId || undefined,
    durum: durum || undefined,
    tur: 'sinav',
  });

  const autoAssignMutation = useAutoAssignInvigilators();

  // Filtrelere uyan ve tarih/saat bilgisi olan sınavları filtrele
  const eligibleExams = useMemo(() => {
    const exams = examsData?.veriler ?? [];
    return exams.filter(
      (exam) => exam.tarih && exam.baslangic && exam.bitis,
    ) as Exam[];
  }, [examsData]);

  const handleSelectExam = (examId: string, checked: boolean) => {
    const newSet = new Set(selectedExamIds);
    if (checked) {
      newSet.add(examId);
    } else {
      newSet.delete(examId);
    }
    setSelectedExamIds(newSet);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedExamIds(new Set(eligibleExams.map((e) => e.id)));
    } else {
      setSelectedExamIds(new Set());
    }
  };

  const handleAutoAssign = async () => {
    setIsAssigning(true);
    try {
      const dto: AutoAssignInvigilatorsDto = {
        donem: donem || undefined,
        bolumId: bolumId || undefined,
        durum: durum || undefined,
        esikDeger,
        sinavIds:
          assignmentMode === 'selected'
            ? Array.from(selectedExamIds)
            : undefined,
      };

      const result = await autoAssignMutation.mutateAsync(dto);
      setPreviewResult(result);
    } catch (error) {
      console.error('Otomatik atama hatası:', error);
      alert(
        'Otomatik atama sırasında bir hata oluştu. Lütfen tekrar deneyin.',
      );
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Otomatik Gözetmen Atama
        </h1>
        <p className="text-muted-foreground mt-2">
          Sınavlara gözetmenleri otomatik olarak atayın. Sistem müsaitlik ve
          yük dengesini göz önünde bulundurarak atama yapar.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="donem">Dönem</Label>
              <Select id="donem" value={donem} onValueChange={setDonem}>
                <SelectItem value="">Tümü</SelectItem>
                {DONEMLER.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d === 'guz' ? 'Güz' : 'Bahar'}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bolum">Bölüm</Label>
              <Select id="bolum" value={bolumId} onValueChange={setBolumId}>
                <SelectItem value="">Tümü</SelectItem>
                {departments?.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.ad}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="durum">Durum</Label>
              <Select id="durum" value={durum} onValueChange={setDurum}>
                <SelectItem value="">Tümü</SelectItem>
                {EXAM_DURUM_LISTESI.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d === 'planlanmadi'
                      ? 'Planlanmadı'
                      : d === 'taslak'
                        ? 'Taslak'
                        : 'Yayınlandı'}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="esikDeger">
              Öğrenci Kapasitesi Eşiği (Bu değerin üstünde 2 gözetmen
              atanır)
            </Label>
            <Input
              id="esikDeger"
              type="number"
              min="1"
              max="200"
              value={esikDeger}
              onChange={(e) => setEsikDeger(Number(e.target.value))}
              className="max-w-xs"
            />
            <p className="text-sm text-muted-foreground">
              Her derslik için; derslik başına düşen öğrenci sayısı ≤ {esikDeger} ise 1 gözetmen, &gt; {esikDeger}{' '}
              ise 2 gözetmen atanır.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Atama Modu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="mode-all"
              name="assignment-mode"
              checked={assignmentMode === 'all'}
              onChange={() => setAssignmentMode('all')}
              className="h-4 w-4"
            />
            <Label htmlFor="mode-all" className="cursor-pointer">
              Tüm Sınavlar ({eligibleExams.length} sınav)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="mode-selected"
              name="assignment-mode"
              checked={assignmentMode === 'selected'}
              onChange={() => setAssignmentMode('selected')}
              className="h-4 w-4"
            />
            <Label htmlFor="mode-selected" className="cursor-pointer">
              Seçili Sınavlar ({selectedExamIds.size} seçili)
            </Label>
          </div>

          {assignmentMode === 'selected' && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2 border-b pb-2">
                <Checkbox
                  checked={
                    eligibleExams.length > 0 &&
                    selectedExamIds.size === eligibleExams.length
                  }
                  onCheckedChange={handleSelectAll}
                />
                <Label className="cursor-pointer font-medium">
                  Tümünü Seç ({eligibleExams.length} sınav)
                </Label>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {eligibleExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center space-x-2 p-2 hover:bg-accent rounded"
                  >
                    <Checkbox
                      checked={selectedExamIds.has(exam.id)}
                      onCheckedChange={(checked) =>
                        handleSelectExam(exam.id, checked === true)
                      }
                    />
                    <Label className="cursor-pointer flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {exam.ders?.kod ?? 'Bilinmeyen'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {exam.tarih} {exam.baslangic} - {exam.bitis}
                        </span>
                        <Badge variant="outline">
                          {exam.sinif || exam.ders?.ogrenciKapasitesi || 'N/A'} öğrenci
                          {exam.derslikler && exam.derslikler.length > 1 && (
                            <span className="ml-1 opacity-70">
                              ({exam.derslikler.length} derslik)
                            </span>
                          )}
                        </Badge>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          onClick={handleAutoAssign}
          disabled={isAssigning || eligibleExams.length === 0}
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

      {previewResult && (
        <Card>
          <CardHeader>
            <CardTitle>Atama Sonuçları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
              <p className="text-sm text-green-800">{previewResult.mesaj}</p>
            </div>

            {previewResult.atananlar.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">
                  Başarıyla Atanan Sınavlar ({previewResult.atananlar.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {previewResult.atananlar.map((item) => (
                    <div
                      key={item.sinavId}
                      className="p-3 border rounded-lg space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.sinavKod}</span>
                        <Badge>{item.gozetmenSayisi} gözetmen</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {item.gozetmenler.map((g) => (
                          <div key={g.id}>
                            • {g.ad}{' '}
                            <Badge variant="outline" className="ml-1">
                              {g.rol === 'birincil' ? 'Baş Gözetmen' : 'Gözetmen'}
                            </Badge>
                            {g.derslik && g.derslik !== '—' && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                (Derslik: {g.derslik})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {previewResult.atanamayanlar.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  Atanamayan Sınavlar ({previewResult.atanamayanlar.length})
                </h3>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <p className="text-sm text-red-800">
                    Bu sınavlar için yeterli müsait gözetmen bulunamadı. Lütfen
                    manuel olarak atama yapın.
                  </p>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto mt-2">
                  {previewResult.atanamayanlar.map((item) => (
                    <div
                      key={item.sinavId}
                      className="p-3 border border-destructive rounded-lg"
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

            {Object.keys(previewResult.gozetmenYukleri).length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Gözetmen Yükleri</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Gözetmen</th>
                        <th className="p-2 text-left">Toplam Yük</th>
                        <th className="p-2 text-left">Günlük Yükler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(previewResult.gozetmenYukleri)
                        .filter(([_, data]) => data.toplamYuk > 0)
                        .sort(([_, a], [__, b]) => b.toplamYuk - a.toplamYuk)
                        .map(([id, data]) => (
                          <tr key={id} className="border-t">
                            <td className="p-2">{data.ad}</td>
                            <td className="p-2">
                              <Badge>{data.toplamYuk} sınav</Badge>
                            </td>
                            <td className="p-2">
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(data.gunlukYukler).map(
                                  ([date, count]) => (
                                    <Badge
                                      key={date}
                                      variant={
                                        count >= 4 ? 'destructive' : 'outline'
                                      }
                                    >
                                      {date}: {count}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

