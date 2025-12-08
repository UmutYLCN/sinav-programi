# MySQL Kurulum ve Başlatma Rehberi

## MySQL Çalışmıyor - Çözüm Adımları

### Durum
MySQL servisi çalışmıyor veya kurulu değil. Port 3306'da hiçbir servis dinlemiyor.

### Çözüm 1: XAMPP Kurulumu (En Kolay)

1. **XAMPP İndirin:**
   - https://www.apachefriends.org/ adresine gidin
   - Windows için XAMPP'i indirin ve kurun

2. **XAMPP'i Başlatın:**
   - XAMPP Control Panel'i açın
   - MySQL'in yanındaki "Start" butonuna tıklayın
   - MySQL'in yeşil renkte çalıştığını kontrol edin

3. **Veritabanını Oluşturun:**
   - `http://localhost/phpmyadmin` adresine gidin
   - Sol menüden "New" butonuna tıklayın
   - Database name: `sinav_programi`
   - Collation: `utf8mb4_unicode_ci`
   - "Create" butonuna tıklayın

4. **Kullanıcı Ayarları:**
   - XAMPP'te varsayılan kullanıcı: `root`
   - Varsayılan şifre: (boş)

### Çözüm 2: MySQL Standalone Kurulumu

1. **MySQL İndirin:**
   - https://dev.mysql.com/downloads/mysql/ adresine gidin
   - MySQL Community Server'ı indirin

2. **MySQL'i Kurun:**
   - Kurulum sırasında root şifresi belirleyin
   - Port: 3306 (varsayılan)
   - Windows Service olarak kurun

3. **MySQL Servisini Başlatın:**
   - Windows Servisleri'ni açın (Win+R → `services.msc`)
   - "MySQL80" veya "MySQL" servisini bulun
   - Sağ tıklayıp "Start" seçeneğini seçin

4. **Veritabanını Oluşturun:**
   - MySQL Workbench'i açın
   - Yeni bir connection oluşturun
   - Şu SQL komutunu çalıştırın:
   ```sql
   CREATE DATABASE IF NOT EXISTS sinav_programi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### Çözüm 3: WAMP Kurulumu

1. **WAMP İndirin:**
   - https://www.wampserver.com/ adresine gidin
   - WAMP Server'ı indirin ve kurun

2. **WAMP'i Başlatın:**
   - WAMP ikonuna sağ tıklayın
   - "Start All Services" seçeneğini seçin
   - İkon yeşil renkte olmalı

3. **Veritabanını Oluşturun:**
   - `http://localhost/phpmyadmin` adresine gidin
   - Veritabanını oluşturun

## .env.local Dosyası Ayarları

MySQL kurulduktan sonra `apps/backend/.env.local` dosyasını şu şekilde ayarlayın:

```env
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=sinav_programi
```

**Not:** Eğer MySQL'de root şifresi varsa, `DATABASE_PASSWORD` alanına şifreyi yazın.

## Test

MySQL'in çalıştığını test etmek için:

```powershell
Test-NetConnection -ComputerName 127.0.0.1 -Port 3306
```

Başarılı olursa "TcpTestSucceeded : True" göreceksiniz.

## Sorun Giderme

### MySQL Başlamıyor
- XAMPP/WAMP'i yönetici olarak çalıştırın
- Port 3306'nın başka bir uygulama tarafından kullanılmadığından emin olun
- Windows Firewall'un MySQL'i engellemediğinden emin olun

### Bağlantı Hatası Devam Ediyor
- `.env.local` dosyasındaki `DATABASE_HOST=127.0.0.1` olduğundan emin olun
- MySQL kullanıcı adı ve şifresinin doğru olduğundan emin olun
- Veritabanının oluşturulduğundan emin olun

