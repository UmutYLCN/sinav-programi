import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FacultiesModule } from './modules/faculties/faculties.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { InstructorsModule } from './modules/instructors/instructors.module';
import { CoursesModule } from './modules/courses/courses.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { ExamGroupsModule } from './modules/exam-groups/exam-groups.module';
import { ExamsModule } from './modules/exams/exams.module';
import { UnavailabilityModule } from './modules/unavailability/unavailability.module';
import { InvigilatorLoadModule } from './modules/invigilator-load/invigilator-load.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { validateEnv } from './config/env.validation';
import { typeOrmModuleFactory } from './config/typeorm.config';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: ['.env.local', '.env'],
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmModuleFactory,
    }),
    FacultiesModule,
    DepartmentsModule,
    InstructorsModule,
    CoursesModule,
    RoomsModule,
    ExamGroupsModule,
    ExamsModule,
    UnavailabilityModule,
    InvigilatorLoadModule,
    DashboardModule,
    ReportsModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    // {  <-- Hatanın olduğu yer burasıydı, düzelttim.
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
  ],
})
export class AppModule {}