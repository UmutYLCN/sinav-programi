import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class DepartmentQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID('all', { message: 'Fakülte kimliği geçerli bir UUID olmalıdır.' })
  fakulteId?: string;
}
