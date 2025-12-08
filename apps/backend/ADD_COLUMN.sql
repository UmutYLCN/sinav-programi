-- Öğrenci Kapasitesi Kolonu Ekleme
-- Bu dosyayı MySQL'de çalıştırın

-- 1. Önce veritabanınızı seçin (veritabanı adınızı yazın)
USE sinav_programi;

-- 2. Kolonu ekleyin
ALTER TABLE courses ADD COLUMN ogrenci_kapasitesi INT NULL;

-- 3. Kontrol edin
DESCRIBE courses;

