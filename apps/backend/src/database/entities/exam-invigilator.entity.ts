import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { CoreEntity } from './base.entity';
import { Exam } from './exam.entity';
import { Instructor } from './instructor.entity';

export type InvigilatorRole = 'birincil' | 'ikincil';

@Entity({ name: 'exam_invigilators' })
@Unique(['sinavId', 'ogretimUyesiId'])
export class ExamInvigilator extends CoreEntity {
  @Column({ name: 'sinav_id' })
  sinavId: string;

  @ManyToOne(() => Exam, (exam) => exam.gozetmenler, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sinav_id' })
  sinav: Exam;

  @Column({ name: 'ogretim_uyesi_id' })
  ogretimUyesiId: string;

  @ManyToOne(() => Instructor, (instructor) => instructor.gozetmenlikler, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ogretim_uyesi_id' })
  gozetmen: Instructor;

  @Column({ type: 'enum', enum: ['birincil', 'ikincil'], default: 'birincil' })
  rol: InvigilatorRole;
}
