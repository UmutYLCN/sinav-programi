import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class AvailableInstructorQueryDto {
  @IsDateString({}, { message: 'Başlangıç zamanı ISO formatında olmalıdır.' })
  baslangic: string;

  @IsDateString({}, { message: 'Bitiş zamanı ISO formatında olmalıdır.' })
  bitis: string;

  @IsOptional()
  @IsUUID('all', { message: 'Sınav kimliği geçerli bir UUID olmalıdır.' })
  sinavId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Bölüm kimliği geçerli bir UUID olmalıdır.' })
  bolumId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Fakülte kimliği geçerli bir UUID olmalıdır.' })
  fakulteId?: string;

  @IsOptional()
  @IsUUID('all', {
    message: 'Hariç tutulan gözetmen kimliği geçerli olmalıdır.',
  })
  haricTutId?: string;
}
