import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from '../../database/entities/course.entity';
import { Department } from '../../database/entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Department])],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
