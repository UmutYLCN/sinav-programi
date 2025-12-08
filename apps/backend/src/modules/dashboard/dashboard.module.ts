import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Exam } from '../../database/entities/exam.entity';
import { Faculty } from '../../database/entities/faculty.entity';
import { Department } from '../../database/entities/department.entity';
import { Room } from '../../database/entities/room.entity';
import { Course } from '../../database/entities/course.entity';
import { Instructor } from '../../database/entities/instructor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Exam,
      Faculty,
      Department,
      Room,
      Course,
      Instructor,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
