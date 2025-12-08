import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import {
  IsBooleanString,
  IsDateString,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class UnavailabilityQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID('all', {
    message: 'Öğretim üyesi kimliği geçerli bir UUID olmalıdır.',
  })
  ogretimUyesiId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Bölüm kimliği geçerli bir UUID olmalıdır.' })
  bolumId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Fakülte kimliği geçerli bir UUID olmalıdır.' })
  fakulteId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Başlangıç tarihi ISO formatında olmalıdır.' })
  baslangicTarihi?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Bitiş tarihi ISO formatında olmalıdır.' })
  bitisTarihi?: string;

  @IsOptional()
  @IsBooleanString({ message: 'Override filtresi true/false olmalıdır.' })
  overrideEdildi?: string;
}
