import {
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { DERSLIK_TIP_LISTESI } from '@sinav/shared';
import type { DerslikTip } from '@sinav/shared';

export class UpdateRoomDto {
  @IsOptional()
  @IsString({ message: 'Derslik adı metin olmalıdır.' })
  @MaxLength(150, { message: 'Derslik adı en fazla 150 karakter olabilir.' })
  ad?: string;

  @IsOptional()
  @IsString({ message: 'Bina adı metin olmalıdır.' })
  @MaxLength(150, { message: 'Bina adı en fazla 150 karakter olabilir.' })
  bina?: string;

  @IsOptional()
  @IsIn(DERSLIK_TIP_LISTESI, {
    message:
      'Derslik tipi amfi, laboratuvar, sınıf, toplantı veya diğer olabilir.',
  })
  tip?: DerslikTip;

  @IsOptional()
  @IsInt({ message: 'Kapasite tam sayı olmalıdır.' })
  @IsPositive({ message: 'Kapasite pozitif olmalıdır.' })
  kapasite?: number;
}
