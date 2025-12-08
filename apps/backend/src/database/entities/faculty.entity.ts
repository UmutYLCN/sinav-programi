import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { CoreEntity } from './base.entity';
import { Department } from './department.entity';

@Entity({ name: 'faculties' })
@Unique(['kod'])
export class Faculty extends CoreEntity {
  @Column({ length: 150 })
  ad: string;

  @Column({ length: 50 })
  kod: string;

  @OneToMany(() => Department, (department) => department.fakulte, {
    cascade: ['remove'],
  })
  bolumler: Department[];

  bolumSayisi?: number;
}
