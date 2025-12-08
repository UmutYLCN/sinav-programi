import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  IsIn,
} from 'class-validator';
import { KULLANICI_ROL_LISTESI } from '@sinav/shared';
import type { KullaniciRol } from '@sinav/shared';

export class CreateUserDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
  email: string;

  @IsString({ message: 'Şifre metin olmalıdır.' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır.' })
  sifre: string;

  @IsString({ message: 'Rol alanı metin olmalıdır.' })
  @IsIn(KULLANICI_ROL_LISTESI, { message: 'Rol değeri geçerli değil.' })
  rol: KullaniciRol;

  @IsOptional()
  @IsUUID('all', {
    message: 'Öğretim üyesi kimliği geçerli bir UUID olmalıdır.',
  })
  ogretimUyesiId?: string;

  @IsOptional()
  @IsBoolean({ message: 'Aktif bilgisi true/false olmalıdır.' })
  aktif?: boolean;
}
