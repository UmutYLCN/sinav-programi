import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { EnvConfig, validateEnv } from './env.validation';
import { Faculty } from '../database/entities/faculty.entity';
import { Department } from '../database/entities/department.entity';
import { Instructor } from '../database/entities/instructor.entity';
import { Course } from '../database/entities/course.entity';
import { Room } from '../database/entities/room.entity';
import { ExamGroup } from '../database/entities/exam-group.entity';
import { Exam } from '../database/entities/exam.entity';
import { ExamInvigilator } from '../database/entities/exam-invigilator.entity';
import { ExamRoom } from '../database/entities/exam-room.entity';
import { InstructorUnavailability } from '../database/entities/instructor-unavailability.entity';
import { RecurringUnavailabilityRule } from '../database/entities/recurring-unavailability-rule.entity';
import { User } from '../database/entities/user.entity';

const entities = [
  Faculty,
  Department,
  Instructor,
  Course,
  Room,
  ExamGroup,
  Exam,
  ExamInvigilator,
  ExamRoom,
  InstructorUnavailability,
  RecurringUnavailabilityRule,
  User,
];

export const typeOrmModuleFactory = (
  configService: ConfigService<EnvConfig, true>,
): TypeOrmModuleOptions => {
  // MySQL için timezone formatı +03:00 olmalı
  const timezone = '+03:00'; // Europe/Istanbul için UTC+3

  const host = configService.get('DATABASE_HOST', { infer: true });
  // IPv6 localhost (::1) yerine IPv4 (127.0.0.1) kullan
  const dbHost = host === 'localhost' || host === '::1' ? '127.0.0.1' : host;

  return {
    type: 'mysql',
    host: dbHost,
    port: configService.get('DATABASE_PORT', { infer: true }),
    username: configService.get('DATABASE_USER', { infer: true }),
    password: configService.get('DATABASE_PASSWORD', { infer: true }),
    database: configService.get('DATABASE_NAME', { infer: true }),
    entities,
    synchronize: false, // Manuel migration kullanıyoruz
    migrationsTableName: 'migrations',
    migrations: ['dist/database/migrations/*.js'],
    timezone,
    logging: configService.get('DATABASE_LOGGING', { infer: true }) === 'true',
  };
};

export const createDataSourceOptions = (
  config: EnvConfig,
): DataSourceOptions => {
  // IPv6 localhost (::1) yerine IPv4 (127.0.0.1) kullan
  const dbHost = config.DATABASE_HOST === 'localhost' || config.DATABASE_HOST === '::1' ? '127.0.0.1' : config.DATABASE_HOST;

  return {
    type: 'mysql',
    host: dbHost,
    port: config.DATABASE_PORT,
    username: config.DATABASE_USER,
    password: config.DATABASE_PASSWORD,
    database: config.DATABASE_NAME,
    entities,
    synchronize: false, // Manuel migration kullanıyoruz
    migrationsTableName: 'migrations',
    migrations: ['dist/database/migrations/*.js'],
    timezone: '+03:00', // Europe/Istanbul için UTC+3
    logging: config.DATABASE_LOGGING === 'true',
  };
};

const rawEnv: Record<string, unknown> = { ...process.env };
export const AppDataSource = new DataSource(
  createDataSourceOptions(validateEnv(rawEnv)),
);
