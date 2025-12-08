# 🔧 Hata Çözüm Rehberi

## Sorun 1: pnpm Komutu Bulunamıyor

### Çözüm:
Yeni bir PowerShell penceresi açın ve şu komutu çalıştırın:

```powershell
npm install -g pnpm
```

Kurulumdan sonra yeni bir terminal açın ve kontrol edin:
```powershell
pnpm --version
```

## Sorun 2: Node.js Komutu Çalışmıyor

### Çözüm:
1. Node.js'in kurulu olduğundan emin olun: https://nodejs.org/
2. **Yeni bir PowerShell penceresi açın** (PATH güncellemesi için)
3. Kontrol edin:
```powershell
node --version
npm --version
```

Eğer hala çalışmıyorsa:
- Bilgisayarınızı yeniden başlatın
- Veya Node.js'i yeniden kurun

## Sorun 3: Shared Paketi Build Edilmemiş

### Çözüm:
```powershell
cd C:\Users\mhmmd\OneDrive\Masaüstü\SinavProgrami
cd packages\shared
pnpm install
pnpm build
cd ..\..
```

## Sorun 4: Backend Başlamıyor

### Adımlar:

1. **MySQL'in çalıştığından emin olun**
   - XAMPP, WAMP veya MySQL Workbench kullanıyorsanız MySQL servisinin çalıştığından emin olun

2. **Veritabanını oluşturun:**
   ```sql
   CREATE DATABASE IF NOT EXISTS sinav_programi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **`.env.local` dosyasını kontrol edin:**
   `apps/backend/.env.local` dosyasında şu değerlerin doğru olduğundan emin olun:
   ```env
   DATABASE_HOST=localhost
   DATABASE_PORT=3306
   DATABASE_USER=root
   DATABASE_PASSWORD=your_mysql_password
   DATABASE_NAME=sinav_programi
   ```

4. **Backend'i başlatın:**
   ```powershell
   cd C:\Users\mhmmd\OneDrive\Masaüstü\SinavProgrami\apps\backend
   pnpm install
   pnpm start:dev
   ```

## Sorun 5: Frontend Başlamıyor

### Adımlar:

1. **`.env.local` dosyasını oluşturun:**
   `apps/frontend/.env.local` dosyasını oluşturun ve şu içeriği ekleyin:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

2. **Frontend'i başlatın:**
   ```powershell
   cd C:\Users\mhmmd\OneDrive\Masaüstü\SinavProgrami\apps\frontend
   pnpm install
   pnpm dev
   ```

## ✅ Doğru Çalıştırma Sırası

### 1. Terminal 1 - Backend:
```powershell
cd C:\Users\mhmmd\OneDrive\Masaüstü\SinavProgrami\apps\backend
pnpm start:dev
```

Backend başarıyla çalıştığında şunu göreceksiniz:
```
[Nest] INFO [NestApplication] Nest application successfully started
```

### 2. Terminal 2 - Frontend:
```powershell
cd C:\Users\mhmmd\OneDrive\Masaüstü\SinavProgrami\apps\frontend
pnpm dev
```

Frontend başarıyla çalıştığında şunu göreceksiniz:
```
  VITE v7.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

### 3. Tarayıcıda açın:
```
http://localhost:5173
```

## 🚨 Yaygın Hatalar ve Çözümleri

### Hata: "Cannot find module '@sinav/shared'"
**Çözüm:**
```powershell
cd packages\shared
pnpm build
cd ..\..
cd apps\backend
pnpm install
```

### Hata: "ECONNREFUSED ::1:3306"
**Çözüm:**
- MySQL'in çalıştığından emin olun
- `.env.local` dosyasındaki `DATABASE_HOST` değerini `127.0.0.1` olarak deneyin

### Hata: "Port 3000 is already in use"
**Çözüm:**
- Port 3000'i kullanan uygulamayı kapatın
- Veya `.env.local` dosyasında `PORT=3001` olarak değiştirin

### Hata: "You are using Node.js 19.8.1. Vite requires Node.js version 20.19+ or 22.12+"
**Çözüm:**
- Node.js'i güncelleyin: https://nodejs.org/
- v20.19+ veya v22.12+ versiyonunu kurun

## 📞 Yardım

Eğer hala sorun yaşıyorsanız, lütfen şu bilgileri paylaşın:
1. Node.js versiyonu: `node --version`
2. pnpm versiyonu: `pnpm --version`
3. Backend çalıştırırken aldığınız hata mesajı
4. Frontend çalıştırırken aldığınız hata mesajı

