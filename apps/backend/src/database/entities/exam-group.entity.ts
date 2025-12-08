import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { CoreEntity } from './base.entity';
import { Exam } from './exam.entity';

@Entity({ name: 'exam_groups' })
@Unique(['ad'])
export class ExamGroup extends CoreEntity {
  @Column({ length: 150 })
  ad: string;

  @Column({ type: 'text', nullable: true })
  aciklama?: string | null;

  @OneToMany(() => Exam, (exam) => exam.ortakGrup)
  sinavlar: Exam[];
}
