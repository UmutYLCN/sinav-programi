import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { KULLANICI_ROL_LISTESI } from '@sinav/shared';
import type { KullaniciRol } from '@sinav/shared';

export class CreateInstructorDto {
  @IsString({ message: 'Ad alanı metin olmalıdır.' })
  @IsNotEmpty({ message: 'Ad alanı zorunludur.' })
  @MaxLength(150, { message: 'Ad alanı en fazla 150 karakter olabilir.' })
  ad: string;

  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
  @MaxLength(200, { message: 'E-posta en fazla 200 karakter olabilir.' })
  email: string;

  @IsUUID('all', { message: 'Bölüm kimliği geçerli bir UUID olmalıdır.' })
  bolumId: string;

  @IsOptional()
  @IsArray({ message: 'Roller dizi olmalıdır.' })
  @ArrayNotEmpty({ message: 'En az bir rol seçilmelidir.' })
  @IsIn(KULLANICI_ROL_LISTESI, {
    each: true,
    message: 'Geçersiz rol değeri seçildi.',
  })
  roller?: KullaniciRol[];

  @IsOptional()
  @IsBoolean({ message: 'Aktif bilgisi true/false olmalıdır.' })
  aktif?: boolean;
}
