import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { CoreEntity } from './base.entity';
import { Exam } from './exam.entity';
import { Room } from './room.entity';

@Entity({ name: 'exam_rooms' })
@Unique(['sinavId', 'derslikId'])
export class ExamRoom extends CoreEntity {
  @Column({ name: 'sinav_id' })
  sinavId: string;

  @ManyToOne(() => Exam, (exam) => exam.derslikler, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sinav_id' })
  sinav: Exam;

  @Column({ name: 'derslik_id' })
  derslikId: string;

  @ManyToOne(() => Room, (room) => room.examRooms, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'derslik_id' })
  derslik: Room;
}

