import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateFacultyDto } from './create-faculty.dto';

export class ImportFacultiesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFacultyDto)
  kayitlar: CreateFacultyDto[];
}

