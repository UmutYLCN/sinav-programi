import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UnavailabilityService } from './unavailability.service';
import { UnavailabilityController } from './unavailability.controller';
import { InstructorUnavailability } from '../../database/entities/instructor-unavailability.entity';
import { Instructor } from '../../database/entities/instructor.entity';
import { Department } from '../../database/entities/department.entity';
import { Exam } from '../../database/entities/exam.entity';
import { ExamInvigilator } from '../../database/entities/exam-invigilator.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      InstructorUnavailability,
      Instructor,
      Department,
      Exam,
      ExamInvigilator,
    ]),
  ],
  controllers: [UnavailabilityController],
  providers: [UnavailabilityService],
})
export class UnavailabilityModule {}
