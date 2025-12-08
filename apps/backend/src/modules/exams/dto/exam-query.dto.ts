import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator';
import {
  DONEMLER_LIST,
  EXAM_DURUM_LISTESI,
  EXAM_TUR_LISTESI,
} from '@sinav/shared';

export class ExamQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID('all', { message: 'Fakülte kimliği geçerli bir UUID olmalıdır.' })
  fakulteId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Bölüm kimliği geçerli bir UUID olmalıdır.' })
  bolumId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Ders kimliği geçerli bir UUID olmalıdır.' })
  dersId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Derslik kimliği geçerli bir UUID olmalıdır.' })
  derslikId?: string;

  @IsOptional()
  @IsUUID('all', {
    message: 'Öğretim üyesi kimliği geçerli bir UUID olmalıdır.',
  })
  ogretimUyesiId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Gözetmen kimliği geçerli bir UUID olmalıdır.' })
  gozetmenId?: string;

  @IsOptional()
  @IsIn(DONEMLER_LIST, {
    message: 'Dönem yalnızca güz veya bahar olabilir.',
  })
  donem?: string;

  @IsOptional()
  @IsIn(EXAM_DURUM_LISTESI, { message: 'Durum geçerli değil.' })
  durum?: string;

  @IsOptional()
  @IsIn(EXAM_TUR_LISTESI, { message: 'Tür geçerli değil.' })
  tur?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Başlangıç tarihi ISO formatında olmalıdır.' })
  baslangicTarihi?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Bitiş tarihi ISO formatında olmalıdır.' })
  bitisTarihi?: string;
}
