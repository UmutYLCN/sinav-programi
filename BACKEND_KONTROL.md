# Backend Kontrol Kılavuzu

## Backend'in Çalışıp Çalışmadığını Kontrol Etme

### 1. Port Kontrolü (PowerShell)
```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
```

### 2. API İsteği ile Kontrol
```powershell
# PowerShell'de:
Invoke-WebRequest -Uri "http://localhost:3000/api" -UseBasicParsing

# Veya tarayıcıda:
http://localhost:3000/api
```

### 3. Process Kontrolü
```powershell
Get-Process | Where-Object {$_.ProcessName -eq "node"}
```

## Backend'i Başlatma

### Geliştirme Modu (Development)
```powershell
cd apps/backend
pnpm start:dev
```

### Production Modu
```powershell
cd apps/backend
pnpm build
pnpm start:prod
```

## Backend'in Başlamaması Durumunda Kontrol Edilecekler

### 1. MySQL Çalışıyor mu?
- MySQL servisinin çalıştığından emin olun
- Windows'ta: Services.msc → MySQL servisini kontrol edin

### 2. .env.local Dosyası Var mı?
```powershell
cd apps/backend
Test-Path .env.local
```

### 3. Veritabanı Bağlantısı
- `.env.local` dosyasındaki bilgilerin doğru olduğundan emin olun:
  - DATABASE_HOST=127.0.0.1
  - DATABASE_PORT=3306
  - DATABASE_USER=muhammed.kocak
  - DATABASE_PASSWORD=12345
  - DATABASE_NAME=sinav_programi

### 4. Backend Build Edilmiş mi?
```powershell
cd apps/backend
Test-Path dist/main.js
```

Eğer yoksa:
```powershell
pnpm build
```

## Backend Loglarını Görüntüleme

Backend çalışırken terminal'de loglar görünecektir. Hata mesajlarını kontrol edin.

## API Endpoint'leri

Backend başladıktan sonra şu endpoint'ler kullanılabilir:

- `GET /api` - API bilgisi
- `GET /api/faculties` - Fakülteler
- `GET /api/departments` - Bölümler
- `GET /api/courses` - Dersler
- `GET /api/exams` - Sınavlar
- `GET /api/instructors` - Öğretim üyeleri
- `GET /api/rooms` - Derslikler

## Sorun Giderme

### Backend başlamıyorsa:
1. MySQL'in çalıştığını kontrol edin
2. `.env.local` dosyasının doğru olduğunu kontrol edin
3. `pnpm build` komutunu çalıştırın
4. Terminal'deki hata mesajlarını kontrol edin

### Port 3000 kullanımda hatası:
```powershell
# Port 3000'i kullanan process'i bulun:
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess

# Process'i durdurun (ID'yi değiştirin):
Stop-Process -Id <PROCESS_ID>
```

