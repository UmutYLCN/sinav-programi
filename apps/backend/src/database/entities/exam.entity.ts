import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import {
  DONEMLER_LIST,
  EXAM_DURUM_LISTESI,
  EXAM_TUR_LISTESI,
} from '@sinav/shared';
import type { Donem, ExamDurum, ExamTur } from '@sinav/shared';
import { CoreEntity } from './base.entity';
import { Course } from './course.entity';
import { Room } from './room.entity';
import { Instructor } from './instructor.entity';
import { ExamGroup } from './exam-group.entity';
import { ExamInvigilator } from './exam-invigilator.entity';
import { ExamRoom } from './exam-room.entity';

@Entity({ name: 'exams' })
@Index(['dersId', 'tarih', 'baslangic'], { unique: false })
export class Exam extends CoreEntity {
  @Column({ name: 'ders_id' })
  dersId: string;

  @ManyToOne(() => Course, (course) => course.sinavlar, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ders_id' })
  ders: Course;

  @Column({
    type: 'enum',
    enum: DONEMLER_LIST,
  })
  donem: Donem;

  @Column({ type: 'int' })
  sinif: number;

  @Column({
    type: 'enum',
    enum: EXAM_TUR_LISTESI,
    default: 'sinav',
  })
  tur: ExamTur;

  @Column({
    type: 'enum',
    enum: EXAM_DURUM_LISTESI,
    default: 'planlanmadi',
  })
  durum: ExamDurum;

  @Column({ type: 'date', nullable: true })
  tarih?: string | null;

  @Column({ type: 'time', nullable: true })
  baslangic?: string | null;

  @Column({ type: 'time', nullable: true })
  bitis?: string | null;

  @Column({ name: 'derslik_id', nullable: true })
  derslikId?: string | null;

  @ManyToOne(() => Room, (room) => room.sinavlar, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'derslik_id' })
  derslik?: Room | null; // Deprecated: Use derslikler instead

  @OneToMany(() => ExamRoom, (examRoom) => examRoom.sinav, {
    cascade: true,
  })
  derslikler: ExamRoom[];

  @Column({ name: 'ogretim_uyesi_id' })
  ogretimUyesiId: string;

  @ManyToOne(() => Instructor, (instructor) => instructor.ogrettigiSinavlar, {
    nullable: false,
    onDelete: 'RESTRICT', // Öğretim üyesi kullanılıyorsa silinemez
  })
  @JoinColumn({ name: 'ogretim_uyesi_id' })
  ogretimUyesi: Instructor;

  @Column({ name: 'ortak_grup_id', nullable: true })
  ortakGrupId?: string | null;

  @ManyToOne(() => ExamGroup, (group) => group.sinavlar, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'ortak_grup_id' })
  ortakGrup?: ExamGroup | null;

  @OneToMany(() => ExamInvigilator, (inv) => inv.sinav, {
    cascade: true,
  })
  gozetmenler: ExamInvigilator[];

  @Column({ default: false })
  onayli: boolean;

  @Column({ name: 'cakisma_onayli', default: false })
  cakismaOnayli: boolean; // Kontrollü çakışma onayı

  @Column({ type: 'text', nullable: true })
  notlar?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  teslimLinki?: string | null;

  @Column({ type: 'datetime', nullable: true })
  teslimTarihi?: string | null;
}
