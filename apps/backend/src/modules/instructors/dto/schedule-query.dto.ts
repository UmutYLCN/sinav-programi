import { IsDateString, IsOptional } from 'class-validator';

export class InstructorScheduleQueryDto {
  @IsOptional()
  @IsDateString({}, { message: 'Başlangıç tarihi ISO formatında olmalıdır.' })
  start?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Bitiş tarihi ISO formatında olmalıdır.' })
  end?: string;
}
