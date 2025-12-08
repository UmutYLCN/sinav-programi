import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @IsString({ message: 'Bölüm adı metin olmalıdır.' })
  @IsNotEmpty({ message: 'Bölüm adı zorunludur.' })
  @MaxLength(150, { message: 'Bölüm adı en fazla 150 karakter olabilir.' })
  ad: string;

  @IsString({ message: 'Bölüm kodu metin olmalıdır.' })
  @IsNotEmpty({ message: 'Bölüm kodu zorunludur.' })
  @MaxLength(50, { message: 'Bölüm kodu en fazla 50 karakter olabilir.' })
  kod: string;

  @IsUUID('all', { message: 'Fakülte kimliği geçerli bir UUID olmalıdır.' })
  fakulteId: string;
}
