import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ExamGroupsService } from './exam-groups.service';
import { CreateExamGroupDto } from './dto/create-exam-group.dto';
import { UpdateExamGroupDto } from './dto/update-exam-group.dto';

@Controller('exam-groups')
export class ExamGroupsController {
  constructor(private readonly examGroupsService: ExamGroupsService) {}

  @Post()
  create(@Body() createExamGroupDto: CreateExamGroupDto) {
    return this.examGroupsService.create(createExamGroupDto);
  }

  @Get()
  findAll() {
    return this.examGroupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examGroupsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExamGroupDto: UpdateExamGroupDto,
  ) {
    return this.examGroupsService.update(+id, updateExamGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.examGroupsService.remove(+id);
  }
}
