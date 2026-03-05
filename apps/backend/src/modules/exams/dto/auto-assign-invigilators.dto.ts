import {
  IsArray,
  IsOptional,
  IsUUID,
  IsIn,
} from 'class-validator';
import { DONEMLER_LIST, EXAM_DURUM_LISTESI } from '@sinav/shared';

export class AutoAssignInvigilatorsDto {
  @IsOptional()
  @IsIn(DONEMLER_LIST, {
    message: 'Dönem yalnızca güz veya bahar olabilir.',
  })
  donem?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Bölüm kimliği geçerli bir UUID olmalıdır.' })
  bolumId?: string;

  @IsOptional()
  @IsIn(EXAM_DURUM_LISTESI, {
    message: 'Durum yalnızca planlanmadı, taslak veya yayınlandı olabilir.',
  })
  durum?: string;


  @IsOptional()
  @IsArray({ message: 'Sınav kimlikleri dizi olmalıdır.' })
  @IsUUID('all', {
    each: true,
    message: 'Sınav kimlikleri geçerli UUID olmalıdır.',
  })
  sinavIds?: string[]; // Seçili sınavlar için
}

