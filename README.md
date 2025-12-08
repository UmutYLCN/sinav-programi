# Sınav Programı Yönetim Sistemi

Üniversitelerin dönemlik sınav programlarını tamamen manuel atama yaklaşımıyla yönetmek için hazırlanmış monorepo yapı. Backend NestJS + TypeORM (MySQL), frontend React + Vite + Tailwind + Zustand, ortak tipler `@sinav/shared` paketinde Zod ile tanımlıdır. Tüm arayüz metinleri ve API mesajları Türkçe tutulmuştur.

## Monorepo Yapısı

- `apps/backend`: NestJS Rest API (JWT auth, TypeORM, CSV/ICS ihracı)
- `apps/frontend`: Vite + React arayüzü (shadcn/ui tabanlı bileşenler, React Query, Zustand)
- `packages/shared`: Ortak enum ve Zod şemaları (`@sinav/shared`)

Pnpm workspace kullanıldığı için tüm komutları kök klasörden çalıştırabilirsiniz.

```bash
# bağımlılık kurulumu
pnpm install
```

## Ortak Çevresel Değişkenler

- Zaman dilimi: `Europe/Istanbul`
- Hafta başlangıcı: Pazartesi
- Roller: `YONETICI`, `BOLUM_SORUMLUSU`, `OGRETIM_UYESI`

### Backend `.env` Örneği

`apps/backend/.env.local` (veya `.env`) dosyası:

```env
NODE_ENV=development
PORT=3000
TIMEZONE=Europe/Istanbul

DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=sinav_user
DATABASE_PASSWORD=sinav_sifre
DATABASE_NAME=sinav_programi
DATABASE_LOGGING=false

JWT_SECRET=super-gizli-anahtar
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

> `apps/backend/src/config/env.validation.ts` dosyasında tüm zorunlu alanları görebilirsiniz. `TIMEZONE` varsayılanı `Europe/Istanbul` olarak ayarlanmıştır.

### Frontend `.env` Örneği

`apps/frontend/.env.local`:

```env
VITE_API_URL=http://localhost:3000/api
```

Frontend, Vite proxy sayesinde doğrudan backend’e yönlenir (bkz. `apps/frontend/vite.config.ts`).

## Backend Çalıştırma

```bash
cd apps/backend

# geliştirme
pnpm start:dev

# TypeScript tip kontrolü
pnpm exec tsc --noEmit

# ESLint
pnpm lint

# Migration (manuel gerekirse)
pnpm migration:generate
pnpm migration:run

# Seed (örnek veri)
pnpm db:seed
```

HTTP servisleri `http://localhost:3000/api` üzerinden yayınlanır.

### Başlıca Endpointler

- `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`
- `GET /faculties`, `GET /departments`, `GET /courses`, `GET /rooms`
- `GET /exams` (manuel atama, çakışma kontrolü)
- `GET /instructors/available`, `GET /instructors/:id/schedule`, `GET /instructors/:id/schedule.ics`
- `GET /invigilator-load`, `GET /invigilator-load/:id`
- `GET /unavailability`, `POST /unavailability`, `POST /unavailability/import`, `GET /unavailability/export/csv`

Tüm cevaplar Türkçe mesaj ve alan adları içerir.

## Frontend Çalıştırma

```bash
cd apps/frontend

# geliştirme sunucusu (http://localhost:5173)
pnpm dev

# tip kontrolü
pnpm exec tsc --noEmit

# prod build
pnpm build
```

### Ana Sayfalar

- **Dashboard**: Dönem filtreleri, KPI kartları, yaklaşan sınavlar, mini takvim.
- **Sınavlar**: Filtreler + tablo; seçilen satır için yan panelde detay & çakışma rozeti, durum düzenleme.
- **Planım (Gözetmen Takvimi)**: FullCalendar ile haftalık/aylık görünüm, ICS dışa aktarım.
- **Gözetmen Yükü**: Toplam görev saatleri, detay tablosu, ICS linki.
- **Müsait Değil**: Kaydedilen kayıtlar, CSV iç/dışa aktarma (servis hazır, UI placeholder).
- **Veri Yönetimi**: Fakülte, bölüm, derslik, ders ve öğretim üyesi listeleri, arama filtreleri.

### UI Notları

- Genel tasarım Tailwind + shadcn/ui bileşenleri üzerine kurulu.
- Durum renkleri (sınav durumları, çakışma uyarıları, roller) `Badge` varyantları ile yönetiliyor.
- React Query cache & optimistic stale yönetimi, Zustand store ileride eklenecek local state için hazır.

## Ortak Tipler (`@sinav/shared`)

- `packages/shared/src/enums.ts`: Donem, sınav türü/durumu, kullanıcı rolü, derslik tipi vb.
- `packages/shared/src/schemas/*`: Fakülte, Bölüm, Ders, Sınav, Gözetmen, Kullanıcı, Müsait Değil, Invigilator load yapıları (Zod).
- Backend DTO’ları ve frontend API client’ları bu tipleri kullanır.

Build etmek için:

```bash
cd packages/shared
pnpm build
```

Turkçe doğrulama mesajları ve tipler hem frontend form validasyonuna hem backend DTO’larına hizmet eder.

## Test & Doğrulama

- Backend: `pnpm --filter backend exec tsc --noEmit` temizdir.
- Frontend: `pnpm --filter frontend exec tsc --noEmit`.
- Linter uyumu için `pnpm --filter backend lint`, `pnpm --filter frontend lint` (varsayılan ayarlarda minimal uyarı).
- Otomatik testler (unit/e2e) şablon olarak mevcut ama kapsamlı senaryolar eklenmedi (manuel atama odaklı olduğu için veri kontrolleri manuel testle doğrulandı).

## Yayın / Veri Tabanı

- Prod ortamı için `.env` dosyalarını uygun değerlerle güncelleyin.
- MySQL şemasını TypeORM migration’ları ile oluşturabilirsiniz (`migration:run`).
- Varsayılan seed (`pnpm db:seed`) fakülte/bölüm/ders/derslik ve 3 örnek öğretim üyesi ekler.
- Vite frontend’i `pnpm build` sonrasında `dist` klasörüne üretir; herhangi bir static server ile servis edebilirsiniz (ör. nginx, Netlify).

## Yol Haritasında Olabilecek Ekler

- Sınav ekranında inline gözetmen/oda düzenleme formlarını modallar ile genişletmek.
- CSV/ICS import-export ekranlarında kullanıcıya progress geri bildirimi.
- Unit test senaryoları (service seviyesinde çakışma kontrolleri).
- Rol yönetimi için detaylı politika/guard eklemeleri.

Herhangi bir adımda takıldığınızda `docs/` klasörü altına eklenmesi planlanan ek yönergeleri kullanabilirsiniz (şimdilik README temel rehberdir).

