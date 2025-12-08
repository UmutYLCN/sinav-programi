-- Bu script'i MySQL'de çalıştırın
-- Önce mevcut foreign key constraint'leri kontrol edin:

SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = 'sinav_programi'
    AND TABLE_NAME = 'rooms'
    AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Eğer fakulte_id ile ilgili bir constraint varsa, onu kaldırın:
-- (Constraint adı farklı olabilir, yukarıdaki sorgudan öğrenebilirsiniz)

-- Örnek:
-- ALTER TABLE `rooms` DROP FOREIGN KEY `FK_95bfdebe7b3d967a642b4c3556d`;

-- Veya tüm foreign key constraint'leri görmek için:
SHOW CREATE TABLE `rooms`;

