import { Module } from '@nestjs/common';
import { ExamGroupsService } from './exam-groups.service';
import { ExamGroupsController } from './exam-groups.controller';

@Module({
  controllers: [ExamGroupsController],
  providers: [ExamGroupsService],
})
export class ExamGroupsModule {}
