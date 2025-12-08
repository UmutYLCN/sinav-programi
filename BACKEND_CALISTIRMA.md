# Backend Çalıştırma Kılavuzu

## Adım 1: MySQL'in Çalıştığından Emin Olun

Windows'ta MySQL servisini kontrol edin:
- `Win + R` tuşlarına basın
- `services.msc` yazın ve Enter'a basın
- "MySQL" servisini bulun ve "Running" durumunda olduğundan emin olun
- Eğer çalışmıyorsa, sağ tıklayıp "Start" seçin

## Adım 2: Backend Klasörüne Gidin

PowerShell veya Terminal'de:
```powershell
cd C:\Users\mhmmd\OneDrive\Masaüstü\SinavProgrami\apps\backend
```

## Adım 3: .env.local Dosyasını Kontrol Edin

`.env.local` dosyasının mevcut olduğundan ve doğru bilgileri içerdiğinden emin olun:

```env
NODE_ENV=development
PORT=3000
TIMEZONE=Europe/Istanbul
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_USER=muhammed.kocak
DATABASE_PASSWORD=12345
DATABASE_NAME=sinav_programi
DATABASE_LOGGING=false
JWT_SECRET=super-gizli-anahtar
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

## Adım 4: Backend'i Başlatın

### Geliştirme Modu (Development - Önerilen)
```powershell
pnpm start:dev
```

Bu komut:
- Backend'i watch mode'da başlatır
- Dosya değişikliklerinde otomatik yeniden başlatır
- Tabloları otomatik oluşturur (synchronize: true)

### Production Modu
```powershell
pnpm build
pnpm start:prod
```

## Adım 5: Backend'in Başladığını Kontrol Edin

Backend başarıyla başladığında terminal'de şu mesajları göreceksiniz:

```
[Nest] Starting Nest application...
query: CREATE TABLE IF NOT EXISTS faculties...
[Nest] Nest application successfully started
Application is running on: http://localhost:3000
```

## Adım 6: Backend'i Test Edin

### Tarayıcıda:
```
http://localhost:3000/api
```

### PowerShell'de:
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api" -UseBasicParsing
```

## Sorun Giderme

### Backend başlamıyorsa:

1. **MySQL Bağlantı Hatası:**
   - MySQL servisinin çalıştığından emin olun
   - `.env.local` dosyasındaki bilgilerin doğru olduğundan emin olun
   - Veritabanının (`sinav_programi`) oluşturulduğundan emin olun

2. **Port 3000 Kullanımda:**
   ```powershell
   # Port 3000'i kullanan process'i bulun:
   Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess
   
   # Process'i durdurun (ID'yi değiştirin):
   Stop-Process -Id <PROCESS_ID>
   ```

3. **Build Hatası:**
   ```powershell
   pnpm build
   ```

4. **Dependency Hatası:**
   ```powershell
   pnpm install
   ```

## Önemli Notlar

- Backend'in başlaması 10-30 saniye sürebilir
- İlk başlatmada tablolar otomatik oluşturulacak
- Development modunda (`pnpm start:dev`) dosya değişikliklerinde otomatik yeniden başlatılır
- Backend çalışırken terminal penceresini kapatmayın

## Backend Çalışırken

- Terminal'de logları görebilirsiniz
- Hata mesajları terminal'de görünecektir
- Backend'i durdurmak için `Ctrl + C` tuşlarına basın

