import { useDashboardStats } from '@/services/dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gauge, ClipboardList, Building2, GraduationCap, School, Users, BookOpen, PlusCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Veriler yüklenirken bir hata oluştu.';
    
    // Network hatası kontrolü
    const isNetworkError = 
      errorMessage.includes('Network Error') ||
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('timeout');
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 p-6">
        <div className="text-destructive font-semibold text-lg">
          {isNetworkError ? "Backend API'ye bağlanılamıyor" : "Veriler yüklenirken bir hata oluştu"}
        </div>
        <div className="text-sm text-muted-foreground max-w-md text-center">
          {errorMessage}
        </div>
        {isNetworkError && (
          <div className="text-xs text-muted-foreground space-y-1 text-center">
            <div>Backend API'nin çalıştığından emin olun:</div>
            <div className="font-mono bg-muted p-2 rounded">
              http://localhost:3000/api/dashboard/stats
            </div>
            <div className="mt-2">Backend'i başlatmak için:</div>
            <div className="font-mono bg-muted p-2 rounded">
              cd apps/backend && pnpm start:dev
            </div>
          </div>
        )}
      </div>
    );
  }

  // Veri yoksa bilgilendirme mesajı göster
  const hasNoData = stats && 
    stats.sinavlar.toplam === 0 &&
    stats.fakulteler === 0 &&
    stats.bolumler === 0 &&
    stats.derslikler === 0 &&
    stats.dersler === 0 &&
    stats.ogretimUyeleri === 0;

  const kpiCards = [
    {
      title: 'Toplam Sınav',
      value: stats?.sinavlar.toplam ?? 0,
      description: 'Tüm sınavlar',
      icon: ClipboardList,
      color: 'text-blue-600',
    },
    {
      title: 'Planlanan Sınav',
      value: stats?.sinavlar.planlandi ?? 0,
      description: 'Tarih ve saat atanmış',
      icon: Gauge,
      color: 'text-green-600',
    },
    {
      title: 'Planlanmamış',
      value: stats?.sinavlar.planlanmadi ?? 0,
      description: 'Henüz planlanmadı',
      icon: ClipboardList,
      color: 'text-amber-600',
    },
    {
      title: 'Fakülteler',
      value: stats?.fakulteler ?? 0,
      description: 'Toplam fakülte sayısı',
      icon: Building2,
      color: 'text-purple-600',
    },
    {
      title: 'Bölümler',
      value: stats?.bolumler ?? 0,
      description: 'Toplam bölüm sayısı',
      icon: GraduationCap,
      color: 'text-indigo-600',
    },
    {
      title: 'Derslikler',
      value: stats?.derslikler ?? 0,
      description: 'Toplam derslik sayısı',
      icon: School,
      color: 'text-pink-600',
    },
    {
      title: 'Dersler',
      value: stats?.dersler ?? 0,
      description: 'Toplam ders sayısı',
      icon: BookOpen,
      color: 'text-cyan-600',
    },
    {
      title: 'Öğretim Üyeleri',
      value: stats?.ogretimUyeleri ?? 0,
      description: 'Toplam öğretim üyesi',
      icon: Users,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gösterge Paneli</h1>
        <p className="text-muted-foreground mt-2">
          Dönem, fakülte ve bölüm bazlı sınav planlama özetini görüntüleyin.
        </p>
        {hasNoData && (
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    📊 Veri Bulunamadı
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                    Henüz veritabanında veri bulunmuyor. Bu normaldir. Aşağıdaki adımları takip ederek veri ekleyebilirsiniz:
                  </p>
                  <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      <span><strong>Fakülteler:</strong> Veri Yönetimi sayfasından fakülte ekleyin</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      <span><strong>Bölümler:</strong> Fakülte ekledikten sonra bölüm ekleyin</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      <span><strong>Dersler:</strong> Bölüm ekledikten sonra ders ekleyin</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      <span><strong>Derslikler:</strong> Fakülte ekledikten sonra derslik ekleyin</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      <span><strong>Sınavlar:</strong> Ders ekledikten sonra Sınavlar sayfasından sınav ekleyin</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button asChild variant="default" size="sm">
                      <Link to="/data">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Veri Yönetimi
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/exams">
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Sınavlar
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sınav Durumu Özeti</CardTitle>
          <CardDescription>Planlanan ve planlanmamış sınavların dağılımı</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Planlanan Sınavlar</span>
              <span className="text-sm text-muted-foreground">
                {stats?.sinavlar.toplam
                  ? Math.round((stats.sinavlar.planlandi / stats.sinavlar.toplam) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{
                  width: stats?.sinavlar.toplam
                    ? `${(stats.sinavlar.planlandi / stats.sinavlar.toplam) * 100}%`
                    : '0%',
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Planlanmamış Sınavlar</span>
              <span className="text-sm text-muted-foreground">
                {stats?.sinavlar.toplam
                  ? Math.round((stats.sinavlar.planlanmadi / stats.sinavlar.toplam) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-amber-600 h-2 rounded-full transition-all"
                style={{
                  width: stats?.sinavlar.toplam
                    ? `${(stats.sinavlar.planlanmadi / stats.sinavlar.toplam) * 100}%`
                    : '0%',
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

