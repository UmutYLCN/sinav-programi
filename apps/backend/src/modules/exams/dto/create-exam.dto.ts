import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  DONEMLER_LIST,
  EXAM_DURUM_LISTESI,
  EXAM_TUR_LISTESI,
} from '@sinav/shared';

export class CreateExamDto {
  @IsUUID('all', { message: 'Ders kimliği geçerli bir UUID olmalıdır.' })
  dersId: string;

  @IsIn(EXAM_TUR_LISTESI, {
    message: 'Tür yalnızca sınav, ödev veya proje olabilir.',
  })
  tur: string = 'sinav';

  @IsOptional()
  @IsIn(EXAM_DURUM_LISTESI, {
    message: 'Durum yalnızca planlanmadı, taslak veya yayınlandı olabilir.',
  })
  durum?: string;

  @IsOptional()
  @IsIn(DONEMLER_LIST, {
    message: 'Dönem yalnızca güz veya bahar olabilir.',
  })
  donem?: string;

  @IsOptional()
  @IsInt({ message: 'Sınıf adedi tam sayı olmalıdır.' })
  @Min(1, { message: 'Sınıf adedi en az 1 olmalıdır.' })
  @Max(6, { message: 'Sınıf adedi en fazla 6 olabilir.' })
  sinif?: number;

  @ValidateIf((o) => (o as CreateExamDto).tur === 'sinav')
  @IsNotEmpty({ message: 'Sınav tarihi zorunludur.' })
  @IsDateString({}, { message: 'Sınav tarihi ISO formatında olmalıdır.' })
  tarih?: string;

  @ValidateIf((o) => (o as CreateExamDto).tur === 'sinav')
  @IsString({ message: 'Başlangıç saati geçerli olmalıdır.' })
  @Length(5, 5, { message: 'Başlangıç saati HH:mm formatında olmalıdır.' })
  baslangic?: string;

  @ValidateIf((o) => (o as CreateExamDto).tur === 'sinav')
  @IsString({ message: 'Bitiş saati geçerli olmalıdır.' })
  @Length(5, 5, { message: 'Bitiş saati HH:mm formatında olmalıdır.' })
  bitis?: string;

  @ValidateIf((o) => (o as CreateExamDto).tur === 'sinav')
  @IsOptional()
  @IsUUID('all', { message: 'Derslik kimliği geçerli bir UUID olmalıdır.' })
  derslikId?: string; // Deprecated: Use derslikIds instead

  @ValidateIf((o) => (o as CreateExamDto).tur === 'sinav')
  @IsOptional()
  @IsArray({ message: 'Derslik listesi dizi olmalıdır.' })
  @ArrayUnique({ message: 'Derslik listesinde tekrar eden kayıtlar var.' })
  @IsUUID('all', {
    each: true,
    message: 'Derslik kimliği geçerli bir UUID olmalıdır.',
  })
  derslikIds?: string[];

  @IsNotEmpty({ message: 'Sorumlu öğretim üyesi zorunludur.' })
  @IsUUID('all', {
    message: 'Öğretim üyesi kimliği geçerli bir UUID olmalıdır.',
  })
  ogretimUyesiId: string;

  @IsOptional()
  @IsUUID('all', {
    message: 'Ortak sınav grubu kimliği geçerli bir UUID olmalıdır.',
  })
  ortakGrupId?: string;

  @IsOptional()
  @IsArray({ message: 'Gözetmen listesi dizi olmalıdır.' })
  @ArrayUnique({ message: 'Gözetmen listesinde tekrar eden kayıtlar var.' })
  @IsUUID('all', {
    each: true,
    message: 'Gözetmen kimliği geçerli bir UUID olmalıdır.',
  })
  gozetmenIds?: string[];

  @IsOptional()
  @IsString({ message: 'Notlar metin olmalıdır.' })
  notlar?: string;

  @IsOptional()
  cakismaOnayli?: boolean; // Kontrollü çakışma onayı

  @ValidateIf((o) => (o as CreateExamDto).tur !== 'sinav')
  @IsOptional()
  @IsDateString({}, { message: 'Teslim tarihi ISO formatında olmalıdır.' })
  teslimTarihi?: string | null;

  @ValidateIf((o) => (o as CreateExamDto).tur !== 'sinav')
  @IsOptional()
  @IsString({ message: 'Teslim bağlantısı geçerli olmalıdır.' })
  teslimLinki?: string | null;
}
