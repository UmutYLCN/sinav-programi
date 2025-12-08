# Veritabanı Migration - Öğrenci Kapasitesi Ekleme

## Hızlı Çözüm (Önerilen)

MySQL veritabanınıza bağlanıp şu SQL komutunu çalıştırın:

```sql
ALTER TABLE courses ADD COLUMN ogrenci_kapasitesi INT NULL;
```

## Alternatif: Migration ile

1. Backend'i build edin:
```bash
cd apps/backend
pnpm build
```

2. Migration'ı çalıştırın:
```bash
pnpm migration:run
```

## Kontrol

Kolonun eklendiğini kontrol etmek için:
```sql
DESCRIBE courses;
```

`ogrenci_kapasitesi` kolonunu görmelisiniz.

