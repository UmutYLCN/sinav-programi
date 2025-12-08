import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { CoreEntity } from './base.entity';
import { Instructor } from './instructor.entity';

export type UnavailabilitySource = 'manuel' | 'csv' | 'kural';

@Entity({ name: 'instructor_unavailability' })
@Unique(['ogretimUyesiId', 'baslangic', 'bitis'])
export class InstructorUnavailability extends CoreEntity {
  @Column({ name: 'ogretim_uyesi_id' })
  ogretimUyesiId: string;

  @ManyToOne(() => Instructor, (instructor) => instructor.musaitDegiller, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ogretim_uyesi_id' })
  ogretimUyesi: Instructor;

  @Column({ type: 'datetime' })
  baslangic: Date;

  @Column({ type: 'datetime' })
  bitis: Date;

  @Column({ length: 200 })
  neden: string;

  @Column({ type: 'enum', enum: ['manuel', 'csv', 'kural'], default: 'manuel' })
  kaynak: UnavailabilitySource;

  @Column({ type: 'boolean', default: false })
  overrideEdildi: boolean;
}
