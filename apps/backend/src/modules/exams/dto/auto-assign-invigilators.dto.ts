import {
  IsArray,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
  Max,
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
  @IsInt({ message: 'Eşik değeri tam sayı olmalıdır.' })
  @Min(1, { message: 'Eşik değeri en az 1 olmalıdır.' })
  @Max(200, { message: 'Eşik değeri en fazla 200 olabilir.' })
  esikDeger?: number; // Öğrenci kapasitesi eşiği (varsayılan: 30)

  @IsOptional()
  @IsArray({ message: 'Sınav kimlikleri dizi olmalıdır.' })
  @IsUUID('all', {
    each: true,
    message: 'Sınav kimlikleri geçerli UUID olmalıdır.',
  })
  sinavIds?: string[]; // Seçili sınavlar için
}

