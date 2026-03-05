# 🚀 Sınav Programı - Kurulum Rehberi

Bu rehber, projeyi sıfırdan bilgisayarınıza kurup çalıştırmanız için gereken tüm adımları içerir.

---

## 📋 Gereksinimler

Başlamadan önce aşağıdaki araçların bilgisayarınızda kurulu olduğundan emin olun:

| Araç | Versiyon | İndirme Linki |
|------|----------|---------------|
| **Node.js** | v18+ | [nodejs.org](https://nodejs.org) |
| **pnpm** | v8+ | `npm install -g pnpm` |
| **MySQL** | 8.0+ | XAMPP veya standalone kurulum |

### MySQL Kurulumu (XAMPP Önerilir)

XAMPP kullanmak en kolay yoldur:
1. [XAMPP](https://www.apachefriends.org/) indirin ve kurun
2. XAMPP'ı açın ve **MySQL** servisini **Start** edin
3. MySQL varsayılan olarak `root` kullanıcı, **şifresiz**, port `3306`'da çalışır

---

## 🔧 Kurulum Adımları

### 1. Projeyi klonlayın

```bash
git clone https://github.com/UmutYLCN/sinav-programi.git
cd sinav-programi
```

### 2. Bağımlılıkları yükleyin

```bash
pnpm install
```

### 3. Ortam değişkenlerini ayarlayın

Backend ve frontend için `.env.local` dosyalarını oluşturun:

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env.local

# Frontend
cp apps/frontend/.env.example apps/frontend/.env.local
```

> **Not:** XAMPP kullanıyorsanız `.env.local` dosyalarını değiştirmenize gerek yok, varsayılan ayarlar XAMPP ile uyumludur.
>
> Eğer MySQL'inizde root şifresi varsa, `apps/backend/.env.local` dosyasındaki `DATABASE_PASSWORD` alanına şifrenizi yazın.

### 4. MySQL veritabanını oluşturun

XAMPP kullanıyorsanız:
```bash
# macOS
/Applications/XAMPP/xamppfiles/bin/mysql -u root -e "CREATE DATABASE IF NOT EXISTS sinav_programi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Normal MySQL kurulumunda:
```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS sinav_programi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Şifreli ise:
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS sinav_programi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 5. Tabloları oluşturun

Backend'i ilk kez çalıştırarak tabloların otomatik oluşmasını sağlayın:

```bash
pnpm --filter backend start:dev
```

Backend başladıktan ve tablolar oluştuktan sonra **Ctrl+C** ile durdurun.

> **Not:** `synchronize` ayarı `true` olmalıdır ilk çalıştırmada. Eğer tablolar oluşmazsa, `apps/backend/src/config/typeorm.config.ts` dosyasında `synchronize: false` yerine `synchronize: true` yapın, backend'i çalıştırın, tablolar oluştuktan sonra tekrar `false` yapın.

### 6. Örnek verileri ve admin kullanıcıyı yükleyin

```bash
pnpm --filter backend db:seed
```

Bu komut şunları oluşturur:
- Fakülteler ve bölümler
- Örnek öğretim üyeleri
- Derslikler
- Dersler
- **Admin kullanıcı** 👇

### 7. Uygulamayı başlatın

İki terminal açın:

**Terminal 1 - Backend:**
```bash
pnpm --filter backend start:dev
```

**Terminal 2 - Frontend:**
```bash
pnpm --filter frontend dev
```

---

## 🔐 Giriş Bilgileri

Seed çalıştırdıktan sonra aşağıdaki bilgilerle giriş yapabilirsiniz:

| Alan | Değer |
|------|-------|
| **E-posta** | `admin@sinav.com` |
| **Şifre** | `admin123` |
| **Rol** | Yönetici |

**Frontend URL:** http://localhost:5173

**Backend API:** http://localhost:3000/api

---

## ❓ Sık Karşılaşılan Sorunlar

### MySQL bağlantı hatası
```
Error: Access denied for user 'root'@'localhost'
```
**Çözüm:** `apps/backend/.env.local` dosyasındaki `DATABASE_PASSWORD` alanına MySQL root şifrenizi yazın.

### Port çakışması
```
Error: listen EADDRINUSE :::3000
```
**Çözüm:** 3000 portunu kullanan başka bir uygulama var. Onu kapatın veya `.env.local`'deki `PORT` değerini değiştirin.

### XAMPP MySQL bağlantı sorunu
macOS'ta XAMPP MySQL farklı socket kullanır. TCP bağlantısı için `DATABASE_HOST=127.0.0.1` olduğundan emin olun (`localhost` değil).

---

## 📁 Proje Yapısı

```
sinav-programi/
├── apps/
│   ├── backend/          # NestJS backend (API)
│   │   ├── src/
│   │   │   ├── config/        # Konfigürasyon dosyaları
│   │   │   ├── database/      # Entity, migration, seed
│   │   │   └── modules/       # API modülleri
│   │   └── .env.local         # Ortam değişkenleri (git'e eklenmez)
│   └── frontend/         # React + Vite frontend
│       ├── src/
│       │   ├── components/    # UI bileşenleri
│       │   ├── pages/         # Sayfalar
│       │   └── services/      # API servisleri
│       └── .env.local         # Ortam değişkenleri (git'e eklenmez)
└── packages/
    └── shared/            # Ortak tipler ve şemalar
```
