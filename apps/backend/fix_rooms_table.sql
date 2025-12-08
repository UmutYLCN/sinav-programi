-- Bu script'i MySQL'de çalıştırın
-- rooms tablosundaki fakulte_id ile ilgili tüm foreign key constraint'lerini kaldırır

-- Önce tablo yapısını kontrol edin
SHOW CREATE TABLE `rooms`;

-- Foreign key constraint'leri listeleyin
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'rooms'
    AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Eğer fakulte_id ile ilgili bir constraint varsa, constraint adını yukarıdaki sorgudan öğrenip şunu çalıştırın:
-- ALTER TABLE `rooms` DROP FOREIGN KEY `[constraint_adı]`;

-- Alternatif: Tüm foreign key constraint'lerini kaldırmak için (dikkatli kullanın):
-- SET @constraint_name = (SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rooms' AND COLUMN_NAME = 'fakulte_id' LIMIT 1);
-- SET @sql = CONCAT('ALTER TABLE rooms DROP FOREIGN KEY ', @constraint_name);
-- PREPARE stmt FROM @sql;
-- EXECUTE stmt;
-- DEALLOCATE PREPARE stmt;

