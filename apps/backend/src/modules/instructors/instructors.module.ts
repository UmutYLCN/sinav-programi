import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { InstructorsService } from './instructors.service';
import { InstructorsController } from './instructors.controller';
import { Instructor } from '../../database/entities/instructor.entity';
import { Department } from '../../database/entities/department.entity';
import { Exam } from '../../database/entities/exam.entity';
import { ExamInvigilator } from '../../database/entities/exam-invigilator.entity';
import { InstructorUnavailability } from '../../database/entities/instructor-unavailability.entity';
import { RecurringUnavailabilityRule } from '../../database/entities/recurring-unavailability-rule.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Instructor,
      Department,
      Exam,
      ExamInvigilator,
      InstructorUnavailability,
      RecurringUnavailabilityRule,
    ]),
  ],
  controllers: [InstructorsController],
  providers: [InstructorsService],
  exports: [InstructorsService],
})
export class InstructorsModule {}
