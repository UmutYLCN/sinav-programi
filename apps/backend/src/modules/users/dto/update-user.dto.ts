import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { KULLANICI_ROL_LISTESI } from '@sinav/shared';
import type { KullaniciRol } from '@sinav/shared';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Şifre metin olmalıdır.' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır.' })
  sifre?: string;

  @IsOptional()
  @IsIn(KULLANICI_ROL_LISTESI, { message: 'Rol değeri geçerli değil.' })
  rol?: KullaniciRol;

  @IsOptional()
  @IsBoolean({ message: 'Aktif bilgisi true/false olmalıdır.' })
  aktif?: boolean;

  @IsOptional()
  @IsUUID('all', {
    message: 'Öğretim üyesi kimliği geçerli bir UUID olmalıdır.',
  })
  ogretimUyesiId?: string | null;
}
