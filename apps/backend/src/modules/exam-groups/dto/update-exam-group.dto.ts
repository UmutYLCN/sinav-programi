import { PartialType } from '@nestjs/mapped-types';
import { CreateExamGroupDto } from './create-exam-group.dto';

export class UpdateExamGroupDto extends PartialType(CreateExamGroupDto) {}
