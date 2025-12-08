import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUnavailabilityDto } from './create-unavailability.dto';

export class ImportUnavailabilityDto {
  @IsArray({ message: 'Kayıt listesi dizi olmalıdır.' })
  @ArrayNotEmpty({ message: 'En az bir kayıt bulunmalıdır.' })
  @ValidateNested({ each: true })
  @Type(() => CreateUnavailabilityDto)
  kayitlar: CreateUnavailabilityDto[];
}
