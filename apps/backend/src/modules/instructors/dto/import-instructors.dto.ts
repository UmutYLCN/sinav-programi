import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateInstructorDto } from './create-instructor.dto';

export class ImportInstructorsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInstructorDto)
  kayitlar: CreateInstructorDto[];
}

