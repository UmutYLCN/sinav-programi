import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { CoreEntity } from './base.entity';
import { Instructor } from './instructor.entity';
import { KULLANICI_ROL_LISTESI } from '@sinav/shared';
import type { KullaniciRol } from '@sinav/shared';

@Entity({ name: 'users' })
@Unique(['email'])
export class User extends CoreEntity {
  @Column({ length: 200 })
  email: string;

  @Column({ name: 'sifre_hash', length: 255 })
  sifreHash: string;

  @Column({ default: true })
  aktif: boolean;

  @Column({
    type: 'enum',
    enum: KULLANICI_ROL_LISTESI,
    default: 'OGRETIM_UYESI',
  })
  rol: KullaniciRol;

  @Column({ name: 'ogretim_uyesi_id', nullable: true })
  ogretimUyesiId?: string | null;

  @ManyToOne(() => Instructor, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'ogretim_uyesi_id' })
  ogretimUyesi?: Instructor | null;
}
