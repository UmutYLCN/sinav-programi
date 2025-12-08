import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { DONEMLER_LIST } from '@sinav/shared';
import type { Donem } from '@sinav/shared';
import { CoreEntity } from './base.entity';
import { Department } from './department.entity';
import { Exam } from './exam.entity';

@Entity({ name: 'courses' })
@Unique(['kod', 'bolumId'])
export class Course extends CoreEntity {
  @Column({ length: 20 })
  kod: string;

  @Column({ length: 200 })
  ad: string;

  @Column({ type: 'int', name: 'sinif' })
  sinif: number;

  @Column({
    type: 'enum',
    enum: DONEMLER_LIST,
  })
  donem: Donem;

  @Column({ type: 'int', nullable: true })
  kredi?: number | null;

  @Column({ type: 'int', nullable: true, name: 'ogrenci_kapasitesi' })
  ogrenciKapasitesi?: number | null;

  @Column({ name: 'bolum_id' })
  bolumId: string;

  @ManyToOne(() => Department, (department) => department.dersler, {
    nullable: false,
    onDelete: 'RESTRICT', // Bölüm kullanılıyorsa silinemez
  })
  @JoinColumn({ name: 'bolum_id' })
  bolum: Department;

  @OneToMany(() => Exam, (exam) => exam.ders)
  sinavlar: Exam[];

  sinavSayisi?: number;
}
