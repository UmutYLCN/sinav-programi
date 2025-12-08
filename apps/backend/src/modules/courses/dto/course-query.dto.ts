import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { DONEMLER_LIST } from '@sinav/shared';

export class CourseQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID('all', { message: 'Bölüm kimliği geçerli bir UUID olmalıdır.' })
  bolumId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Fakülte kimliği geçerli bir UUID olmalıdır.' })
  fakulteId?: string;

  @IsOptional()
  @IsIn(DONEMLER_LIST, {
    message: 'Dönem yalnızca güz veya bahar olabilir.',
  })
  donem?: string;

  @IsOptional()
  @IsInt({ message: 'Sınıf tam sayı olmalıdır.' })
  @Min(1, { message: 'Sınıf en az 1 olabilir.' })
  @Max(6, { message: 'Sınıf en fazla 6 olabilir.' })
  sinif?: number;
}
