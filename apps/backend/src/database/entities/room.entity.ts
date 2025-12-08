import {
  Column,
  Entity,
  OneToMany,
  Unique,
} from 'typeorm';
import { DERSLIK_TIP_LISTESI } from '@sinav/shared';
import type { DerslikTip } from '@sinav/shared';
import { CoreEntity } from './base.entity';
import { Exam } from './exam.entity';
import { ExamRoom } from './exam-room.entity';

@Entity({ name: 'rooms' })
@Unique(['ad'])
export class Room extends CoreEntity {
  @Column({ length: 150 })
  ad: string;

  @Column({ length: 150 })
  bina: string;

  @Column({ type: 'enum', enum: DERSLIK_TIP_LISTESI })
  tip: DerslikTip;

  @Column({ type: 'int' })
  kapasite: number;

  @OneToMany(() => Exam, (exam) => exam.derslik)
  sinavlar: Exam[]; // Deprecated: Use examRooms instead

  @OneToMany(() => ExamRoom, (examRoom) => examRoom.derslik)
  examRooms: ExamRoom[];

  sinavSayisi?: number;
}
