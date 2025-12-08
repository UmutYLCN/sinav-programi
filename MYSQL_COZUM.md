# MySQL Bağlantı Sorunu Çözümü

## Sorun
Backend MySQL'e bağlanamıyor: `ECONNREFUSED ::1:3306`

## Çözüm Adımları

### 1. MySQL Servisini Başlatın

**XAMPP Kullanıyorsanız:**
1. XAMPP Control Panel'i açın
2. MySQL'in yanındaki "Start" butonuna tıklayın
3. MySQL'in yeşil renkte çalıştığını kontrol edin

**WAMP Kullanıyorsanız:**
1. WAMP ikonuna sağ tıklayın
2. "Start All Services" seçeneğini seçin
3. MySQL'in çalıştığını kontrol edin

**MySQL Workbench veya Standalone MySQL:**
1. Windows Servisleri'ni açın (Win+R → `services.msc`)
2. "MySQL" veya "MySQL80" servisini bulun
3. Sağ tıklayıp "Start" seçeneğini seçin

### 2. `.env.local` Dosyasını Kontrol Edin

`apps/backend/.env.local` dosyasını açın ve şu içeriği kullanın:

```env
NODE_ENV=development
PORT=3000
TIMEZONE=Europe/Istanbul

DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=sinav_programi
DATABASE_LOGGING=false

JWT_SECRET=super-gizli-anahtar
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

**Önemli:** 
- `DATABASE_HOST` değerini `127.0.0.1` olarak ayarlayın (IPv4)
- `DATABASE_USER` değerini MySQL kullanıcı adınıza göre ayarlayın (genellikle `root`)
- `DATABASE_PASSWORD` değerini MySQL şifrenize göre ayarlayın (eğer şifre yoksa boş bırakın)

### 3. Veritabanını Oluşturun

MySQL'e bağlanın ve şu komutu çalıştırın:

```sql
CREATE DATABASE IF NOT EXISTS sinav_programi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**MySQL'e bağlanma:**
- XAMPP: `http://localhost/phpmyadmin` adresine gidin
- MySQL Workbench: Yeni bir connection oluşturun
- Komut satırı: `mysql -u root -p` (şifre varsa)

### 4. Backend'i Yeniden Başlatın

MySQL başladıktan sonra backend'i yeniden başlatın:

```powershell
cd C:\Users\mhmmd\OneDrive\Masaüstü\SinavProgrami\apps\backend
corepack pnpm start:dev
```

### 5. MySQL Portunu Kontrol Edin

Eğer MySQL farklı bir portta çalışıyorsa (örneğin 3307), `.env.local` dosyasında `DATABASE_PORT` değerini güncelleyin.

### Alternatif: MySQL Kurulu Değilse

Eğer MySQL kurulu değilse:
1. XAMPP indirin ve kurun: https://www.apachefriends.org/
2. Veya MySQL'i doğrudan kurun: https://dev.mysql.com/downloads/mysql/

## Test

MySQL'in çalıştığını test etmek için:

```powershell
Test-NetConnection -ComputerName 127.0.0.1 -Port 3306
```

Başarılı olursa "TcpTestSucceeded : True" göreceksiniz.

