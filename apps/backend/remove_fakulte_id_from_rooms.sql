-- Bu script'i MySQL'de çalıştırın:
-- mysql -u [kullanıcı_adı] -p [veritabanı_adı] < remove_fakulte_id_from_rooms.sql

-- Foreign key constraint'i kaldır
ALTER TABLE `rooms` DROP FOREIGN KEY `FK_95bfdebe7b3d967a642b4c3556d`;

-- fakulte_id kolonunu kaldır
ALTER TABLE `rooms` DROP COLUMN `fakulte_id`;

