import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import type { UnavailabilitySource } from '../../../database/entities/instructor-unavailability.entity';

const KAYNAK_DEGERLERI: UnavailabilitySource[] = ['manuel', 'csv', 'kural'];

export class CreateUnavailabilityDto {
  @IsUUID('all', {
    message: 'Öğretim üyesi kimliği geçerli bir UUID olmalıdır.',
  })
  ogretimUyesiId: string;

  @IsDateString({}, { message: 'Başlangıç zamanı ISO formatında olmalıdır.' })
  baslangic: string;

  @IsDateString({}, { message: 'Bitiş zamanı ISO formatında olmalıdır.' })
  bitis: string;

  @IsString({ message: 'Neden metin olmalıdır.' })
  @IsNotEmpty({ message: 'Neden alanı boş bırakılamaz.' })
  @MaxLength(200, { message: 'Neden en fazla 200 karakter olabilir.' })
  neden: string;

  @IsOptional()
  @IsIn(KAYNAK_DEGERLERI, { message: 'Kaynak türü geçerli değil.' })
  kaynak?: UnavailabilitySource;

  @IsOptional()
  @IsBoolean({ message: 'Çakışma zorlaması true/false olmalıdır.' })
  zorla?: boolean;
}
