import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { IsBooleanString, IsIn, IsOptional, IsUUID } from 'class-validator';
import { KULLANICI_ROL_LISTESI } from '@sinav/shared';

export class InstructorQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID('all', { message: 'Fakülte kimliği geçerli bir UUID olmalıdır.' })
  fakulteId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Bölüm kimliği geçerli bir UUID olmalıdır.' })
  bolumId?: string;

  @IsOptional()
  @IsIn(KULLANICI_ROL_LISTESI, {
    message: 'Rol değeri geçerli değil.',
  })
  rol?: string;

  @IsOptional()
  @IsBooleanString({ message: 'Aktif değeri true veya false olmalıdır.' })
  aktif?: string;
}
