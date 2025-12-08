import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { Exam } from '../../database/entities/exam.entity';
import { Course } from '../../database/entities/course.entity';
import { Room } from '../../database/entities/room.entity';
import { Instructor } from '../../database/entities/instructor.entity';
import { ExamGroup } from '../../database/entities/exam-group.entity';
import { ExamInvigilator } from '../../database/entities/exam-invigilator.entity';
import { ExamRoom } from '../../database/entities/exam-room.entity';
import { InstructorUnavailability } from '../../database/entities/instructor-unavailability.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Exam,
      Course,
      Room,
      Instructor,
      ExamGroup,
      ExamInvigilator,
      ExamRoom,
      InstructorUnavailability,
    ]),
  ],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}
