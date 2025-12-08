import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { DERSLIK_TIP_LISTESI } from '@sinav/shared';
import type { DerslikTip } from '@sinav/shared';

export class CreateRoomDto {
  @IsString({ message: 'Derslik adı metin olmalıdır.' })
  @IsNotEmpty({ message: 'Derslik adı zorunludur.' })
  @MaxLength(150, { message: 'Derslik adı en fazla 150 karakter olabilir.' })
  ad: string;

  @IsString({ message: 'Bina adı metin olmalıdır.' })
  @IsNotEmpty({ message: 'Bina adı zorunludur.' })
  @MaxLength(150, { message: 'Bina adı en fazla 150 karakter olabilir.' })
  bina: string;

  @IsIn(DERSLIK_TIP_LISTESI, {
    message:
      'Derslik tipi amfi, laboratuvar, sınıf, toplantı veya diğer olabilir.',
  })
  tip: DerslikTip;

  @IsInt({ message: 'Kapasite tam sayı olmalıdır.' })
  @IsPositive({ message: 'Kapasite pozitif olmalıdır.' })
  kapasite: number;
}
