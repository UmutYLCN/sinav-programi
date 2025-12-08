import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  Unique,
  JoinColumn,
} from 'typeorm';
import { CoreEntity } from './base.entity';
import { Faculty } from './faculty.entity';
import { Instructor } from './instructor.entity';
import { Course } from './course.entity';

@Entity({ name: 'departments' })
@Unique(['kod'])
export class Department extends CoreEntity {
  @Column({ length: 150 })
  ad: string;

  @Column({ length: 50 })
  kod: string;

  @ManyToOne(() => Faculty, (faculty) => faculty.bolumler, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fakulte_id' })
  fakulte: Faculty;

  @Column({ name: 'fakulte_id' })
  fakulteId: string;

  @OneToMany(() => Instructor, (instructor) => instructor.bolum)
  ogretimUyeleri: Instructor[];

  @OneToMany(() => Course, (course) => course.bolum)
  dersler: Course[];

  dersSayisi?: number;
}
