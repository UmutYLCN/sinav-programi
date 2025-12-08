import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import type { KullaniciRol } from '@sinav/shared';
import { CoreEntity } from './base.entity';
import { Department } from './department.entity';
import { Exam } from './exam.entity';
import { ExamInvigilator } from './exam-invigilator.entity';
import { InstructorUnavailability } from './instructor-unavailability.entity';
import { RecurringUnavailabilityRule } from './recurring-unavailability-rule.entity';

@Entity({ name: 'instructors' })
@Unique(['email'])
export class Instructor extends CoreEntity {
  @Column({ length: 150 })
  ad: string;

  @Column({ length: 200 })
  email: string;

  @Column({ default: true })
  aktif: boolean;

  @Column({
    type: 'json',
    name: 'roller',
    nullable: false,
    default: () => "'[]'",
  })
  roller: KullaniciRol[];

  @Column({ name: 'bolum_id' })
  bolumId: string;

  @ManyToOne(() => Department, (department) => department.ogretimUyeleri, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bolum_id' })
  bolum: Department;

  @OneToMany(() => Exam, (exam) => exam.ogretimUyesi)
  ogrettigiSinavlar: Exam[];

  @OneToMany(() => ExamInvigilator, (inv) => inv.gozetmen)
  gozetmenlikler: ExamInvigilator[];

  @OneToMany(
    () => InstructorUnavailability,
    (unavailability) => unavailability.ogretimUyesi,
  )
  musaitDegiller: InstructorUnavailability[];

  @OneToMany(() => RecurringUnavailabilityRule, (rule) => rule.ogretimUyesi)
  musaitDegilKurallari: RecurringUnavailabilityRule[];
}
