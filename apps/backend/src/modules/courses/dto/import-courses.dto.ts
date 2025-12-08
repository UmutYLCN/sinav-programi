import { IsArray, ValidateNested, IsString, IsInt, IsIn, Min, Max, IsOptional, IsNotEmpty, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { DONEMLER_LIST } from '@sinav/shared';
import type { Donem } from '@sinav/shared';

export class ImportCourseItemDto {
  @IsString({ message: 'Ders kodu metin olmalıdır.' })
  @IsNotEmpty({ message: 'Ders kodu zorunludur.' })
  kod: string;

  @IsString({ message: 'Ders adı metin olmalıdır.' })
  @IsNotEmpty({ message: 'Ders adı zorunludur.' })
  ad: string;

  @IsInt({ message: 'Sınıf değeri tam sayı olmalıdır.' })
  @Min(1, { message: 'Sınıf en az 1 olabilir.' })
  @Max(6, { message: 'Sınıf en fazla 6 olabilir.' })
  sinif: number;

  @IsIn(DONEMLER_LIST, {
    message: 'Dönem yalnızca güz veya bahar olabilir.',
  })
  donem: Donem;

  @IsOptional()
  @IsString({ message: 'Bölüm kimliği metin olmalıdır.' })
  bolumId?: string; // UUID - eski format için

  @IsOptional()
  @IsString({ message: 'Bölüm kodu metin olmalıdır.' })
  bolumKod?: string; // Bölüm kodu - yeni format için

  @IsOptional()
  @IsString({ message: 'Bölüm adı metin olmalıdır.' })
  bolumAd?: string; // Bölüm adı - yeni format için

  @IsOptional()
  @IsInt({ message: 'Kredi değeri tam sayı olmalıdır.' })
  @IsPositive({ message: 'Kredi değeri pozitif olmalıdır.' })
  kredi?: number;

  @IsOptional()
  @IsInt({ message: 'Öğrenci kapasitesi tam sayı olmalıdır.' })
  @IsPositive({ message: 'Öğrenci kapasitesi pozitif olmalıdır.' })
  ogrenciKapasitesi?: number;
}

export class ImportCoursesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportCourseItemDto)
  kayitlar: ImportCourseItemDto[];
}
