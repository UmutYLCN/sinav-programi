import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { InstructorsService } from './instructors.service';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import { ImportInstructorsDto } from './dto/import-instructors.dto';
import { InstructorQueryDto } from './dto/instructor-query.dto';
import { AvailableInstructorQueryDto } from './dto/available-instructor-query.dto';
import { InstructorScheduleQueryDto } from './dto/schedule-query.dto';

@Controller('instructors')
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}

  @Post()
  create(@Body() createInstructorDto: CreateInstructorDto) {
    return this.instructorsService.create(createInstructorDto);
  }

  @Get()
  findAll(@Query() query: InstructorQueryDto) {
    return this.instructorsService.findAll(query);
  }

  @Get('available')
  findAvailable(@Query() query: AvailableInstructorQueryDto) {
    return this.instructorsService.findAvailable(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.instructorsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInstructorDto: UpdateInstructorDto,
  ) {
    return this.instructorsService.update(id, updateInstructorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.instructorsService.remove(id);
  }

  @Get(':id/schedule')
  getSchedule(
    @Param('id') id: string,
    @Query() query: InstructorScheduleQueryDto,
  ) {
    return this.instructorsService.getSchedule(id, query);
  }

  @Get(':id/schedule.ics')
  async exportScheduleIcs(
    @Param('id') id: string,
    @Query() query: InstructorScheduleQueryDto,
    @Res() res: Response,
  ) {
    const { ics, dosyaAdi } = await this.instructorsService.exportScheduleIcs(
      id,
      query,
    );
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${dosyaAdi}"`);
    res.send(ics);
  }

  @Post('import')
  import(@Body() dto: ImportInstructorsDto) {
    return this.instructorsService.import(dto);
  }
}
