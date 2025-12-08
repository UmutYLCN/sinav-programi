import { AppDataSource } from '../config/typeorm.config';
import { InitialSeeder } from './seeds/initial.seeder';

async function bootstrap() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const seeder = new InitialSeeder(AppDataSource);
    await seeder.run();

    console.log('✅ Örnek veriler başarıyla yüklendi.');
  } catch (error) {
    console.error('❌ Seed çalıştırılırken hata oluştu:', error);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

void bootstrap();
