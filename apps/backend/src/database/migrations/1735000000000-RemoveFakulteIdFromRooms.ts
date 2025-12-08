import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class RemoveFakulteIdFromRooms1735000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Önce foreign key constraint'i kaldır
    const table = await queryRunner.getTable('rooms');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('fakulte_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('rooms', foreignKey);
      }
    }

    // Sonra kolonu kaldır
    const hasColumn = await queryRunner.hasColumn('rooms', 'fakulte_id');
    if (hasColumn) {
      await queryRunner.dropColumn('rooms', 'fakulte_id');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Geri alma: kolonu tekrar ekle
    const hasColumn = await queryRunner.hasColumn('rooms', 'fakulte_id');
    if (!hasColumn) {
      await queryRunner.addColumn(
        'rooms',
        new TableColumn({
          name: 'fakulte_id',
          type: 'varchar',
          length: '36',
          isNullable: true,
        }),
      );

      // Foreign key constraint'i tekrar ekle
      await queryRunner.createForeignKey(
        'rooms',
        new TableForeignKey({
          columnNames: ['fakulte_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'faculties',
          onDelete: 'CASCADE',
          onUpdate: 'NO ACTION',
        }),
      );
    }
  }
}

