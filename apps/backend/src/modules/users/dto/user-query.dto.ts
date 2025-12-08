import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { IsBooleanString, IsIn, IsOptional } from 'class-validator';
import { KULLANICI_ROL_LISTESI } from '@sinav/shared';

export class UserQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(KULLANICI_ROL_LISTESI, { message: 'Rol değeri geçerli değil.' })
  rol?: string;

  @IsOptional()
  @IsBooleanString({ message: 'Aktif filtresi true/false olmalıdır.' })
  aktif?: string;
}
