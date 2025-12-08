import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { InvigilatorLoadService } from './invigilator-load.service';
import { InvigilatorLoadController } from './invigilator-load.controller';
import { ExamInvigilator } from '../../database/entities/exam-invigilator.entity';
import { Instructor } from '../../database/entities/instructor.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ExamInvigilator, Instructor]),
  ],
  controllers: [InvigilatorLoadController],
  providers: [InvigilatorLoadService],
})
export class InvigilatorLoadModule {}
