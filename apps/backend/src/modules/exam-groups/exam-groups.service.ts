import { Injectable } from '@nestjs/common';
import { CreateExamGroupDto } from './dto/create-exam-group.dto';
import { UpdateExamGroupDto } from './dto/update-exam-group.dto';

@Injectable()
export class ExamGroupsService {
  create(_createExamGroupDto: CreateExamGroupDto) {
    void _createExamGroupDto;
    return 'This action adds a new examGroup';
  }

  findAll() {
    return `This action returns all examGroups`;
  }

  findOne(id: number) {
    return `This action returns a #${id} examGroup`;
  }

  update(id: number, _updateExamGroupDto: UpdateExamGroupDto) {
    void _updateExamGroupDto;
    return `This action updates a #${id} examGroup`;
  }

  remove(id: number) {
    return `This action removes a #${id} examGroup`;
  }
}
