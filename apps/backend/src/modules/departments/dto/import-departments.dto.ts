import { IsArray, ValidateNested, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class ImportDepartmentItemDto {
  @IsString()
  @IsNotEmpty()
  ad: string;

  @IsString()
  @IsNotEmpty()
  kod: string;

  @IsOptional()
  @IsString()
  fakulteId?: string; // UUID - eski format için

  @IsOptional()
  @IsString()
  fakulteKod?: string; // Fakülte kodu - yeni format için

  @IsOptional()
  @IsString()
  fakulteAd?: string; // Fakülte adı - yeni format için
}

export class ImportDepartmentsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportDepartmentItemDto)
  kayitlar: ImportDepartmentItemDto[];
}

