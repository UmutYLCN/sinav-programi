import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { DERSLIK_TIP_LISTESI } from '@sinav/shared';

export class RoomQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(DERSLIK_TIP_LISTESI, { message: 'Derslik tipi geçerli değil.' })
  tip?: string;

  @IsOptional()
  @IsInt({ message: 'Minimum kapasite tam sayı olmalıdır.' })
  @Min(0, { message: 'Minimum kapasite negatif olamaz.' })
  minKapasite?: number;

  @IsOptional()
  @IsInt({ message: 'Maksimum kapasite tam sayı olmalıdır.' })
  @Min(0, { message: 'Maksimum kapasite negatif olamaz.' })
  maxKapasite?: number;

  @IsOptional()
  @IsString({ message: 'Bina adı metin olmalıdır.' })
  @MaxLength(150, { message: 'Bina adı en fazla 150 karakter olabilir.' })
  bina?: string;
}
