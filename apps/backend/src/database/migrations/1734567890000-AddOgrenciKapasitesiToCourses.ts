import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddOgrenciKapasitesiToCourses1734567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'courses',
      new TableColumn({
        name: 'ogrenci_kapasitesi',
        type: 'int',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('courses', 'ogrenci_kapasitesi');
  }
}

