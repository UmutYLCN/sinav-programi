import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateFacultyDto {
  @IsString({ message: 'Fakülte adı metin olmalıdır.' })
  @IsNotEmpty({ message: 'Fakülte adı zorunludur.' })
  @MaxLength(150, { message: 'Fakülte adı en fazla 150 karakter olabilir.' })
  ad: string;

  @IsString({ message: 'Fakülte kodu metin olmalıdır.' })
  @IsNotEmpty({ message: 'Fakülte kodu zorunludur.' })
  @MaxLength(50, { message: 'Fakülte kodu en fazla 50 karakter olabilir.' })
  kod: string;
}
