import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator';
import { DONEMLER_LIST } from '@sinav/shared';

export class InvigilatorLoadQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID('all', { message: 'Fakülte kimliği geçerli bir UUID olmalıdır.' })
  fakulteId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Bölüm kimliği geçerli bir UUID olmalıdır.' })
  bolumId?: string;

  @IsOptional()
  @IsIn(DONEMLER_LIST, { message: 'Dönem değeri geçerli değil.' })
  donem?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Başlangıç tarihi ISO formatında olmalıdır.' })
  baslangicTarihi?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Bitiş tarihi ISO formatında olmalıdır.' })
  bitisTarihi?: string;
}
