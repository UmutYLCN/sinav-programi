import {
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { DONEMLER_LIST } from '@sinav/shared';
import type { Donem } from '@sinav/shared';

export class UpdateCourseDto {
  @IsOptional()
  @IsString({ message: 'Ders kodu metin olmalıdır.' })
  @MaxLength(20, { message: 'Ders kodu en fazla 20 karakter olabilir.' })
  kod?: string;

  @IsOptional()
  @IsString({ message: 'Ders adı metin olmalıdır.' })
  @MaxLength(200, { message: 'Ders adı en fazla 200 karakter olabilir.' })
  ad?: string;

  @IsOptional()
  @IsInt({ message: 'Sınıf değeri tam sayı olmalıdır.' })
  @Min(1, { message: 'Sınıf en az 1 olabilir.' })
  @Max(6, { message: 'Sınıf en fazla 6 olabilir.' })
  sinif?: number;

  @IsOptional()
  @IsIn(DONEMLER_LIST, {
    message: 'Dönem yalnızca güz veya bahar olabilir.',
  })
  donem?: Donem;

  @IsOptional()
  @IsUUID('all', { message: 'Bölüm kimliği geçerli bir UUID olmalıdır.' })
  bolumId?: string;

  @IsOptional()
  @IsInt({ message: 'Kredi değeri tam sayı olmalıdır.' })
  @IsPositive({ message: 'Kredi değeri pozitif olmalıdır.' })
  kredi?: number;

  @IsOptional()
  @ValidateIf((o) => o.ogrenciKapasitesi !== null)
  @IsInt({ message: 'Öğrenci kapasitesi tam sayı olmalıdır.' })
  @IsPositive({ message: 'Öğrenci kapasitesi pozitif olmalıdır.' })
  ogrenciKapasitesi?: number | null;
}
