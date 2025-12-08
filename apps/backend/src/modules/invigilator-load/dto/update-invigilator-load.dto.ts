import { PartialType } from '@nestjs/mapped-types';
import { CreateInvigilatorLoadDto } from './create-invigilator-load.dto';

export class UpdateInvigilatorLoadDto extends PartialType(
  CreateInvigilatorLoadDto,
) {}
