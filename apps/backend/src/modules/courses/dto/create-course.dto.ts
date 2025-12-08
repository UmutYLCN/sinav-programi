import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { DONEMLER_LIST } from '@sinav/shared';
import type { Donem } from '@sinav/shared';

export class CreateCourseDto {
  @IsString({ message: 'Ders kodu metin olmalıdır.' })
  @IsNotEmpty({ message: 'Ders kodu zorunludur.' })
  @MaxLength(20, { message: 'Ders kodu en fazla 20 karakter olabilir.' })
  kod: string;

  @IsString({ message: 'Ders adı metin olmalıdır.' })
  @IsNotEmpty({ message: 'Ders adı zorunludur.' })
  @MaxLength(200, { message: 'Ders adı en fazla 200 karakter olabilir.' })
  ad: string;

  @IsInt({ message: 'Sınıf değeri tam sayı olmalıdır.' })
  @Min(1, { message: 'Sınıf en az 1 olabilir.' })
  @Max(6, { message: 'Sınıf en fazla 6 olabilir.' })
  sinif: number;

  @IsIn(DONEMLER_LIST, {
    message: 'Dönem yalnızca güz veya bahar olabilir.',
  })
  donem: Donem;

  @IsUUID('all', { message: 'Bölüm kimliği geçerli bir UUID olmalıdır.' })
  bolumId: string;

  @IsOptional()
  @IsInt({ message: 'Kredi değeri tam sayı olmalıdır.' })
  @IsPositive({ message: 'Kredi değeri pozitif olmalıdır.' })
  kredi?: number;

  @IsOptional()
  @IsInt({ message: 'Öğrenci kapasitesi tam sayı olmalıdır.' })
  @IsPositive({ message: 'Öğrenci kapasitesi pozitif olmalıdır.' })
  ogrenciKapasitesi?: number;
}
