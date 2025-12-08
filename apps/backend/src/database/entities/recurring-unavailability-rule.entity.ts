import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { CoreEntity } from './base.entity';
import { Instructor } from './instructor.entity';
import { GUN_LISTESI } from '@sinav/shared';
import type { Gun } from '@sinav/shared';

@Entity({ name: 'recurring_unavailability_rules' })
@Unique(['ogretimUyesiId', 'gun', 'baslangicSaat', 'bitisSaat'])
export class RecurringUnavailabilityRule extends CoreEntity {
  @Column({ name: 'ogretim_uyesi_id' })
  ogretimUyesiId: string;

  @ManyToOne(
    () => Instructor,
    (instructor) => instructor.musaitDegilKurallari,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'ogretim_uyesi_id' })
  ogretimUyesi: Instructor;

  @Column({ type: 'enum', enum: GUN_LISTESI })
  gun: Gun;

  @Column({ type: 'time' })
  baslangicSaat: string;

  @Column({ type: 'time' })
  bitisSaat: string;

  @Column({ type: 'date', nullable: true })
  tekrarBitisTarihi?: string | null;
}
