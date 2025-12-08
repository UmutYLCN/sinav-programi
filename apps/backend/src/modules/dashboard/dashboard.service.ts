import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exam } from '../../database/entities/exam.entity';
import { Faculty } from '../../database/entities/faculty.entity';
import { Department } from '../../database/entities/department.entity';
import { Room } from '../../database/entities/room.entity';
import { Course } from '../../database/entities/course.entity';
import { Instructor } from '../../database/entities/instructor.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Instructor)
    private readonly instructorRepository: Repository<Instructor>,
  ) {}

  async getStats() {
    const [
      totalExams,
      draftExams,
      publishedExams,
      unplannedExams,
      totalFaculties,
      totalDepartments,
      totalRooms,
      totalCourses,
      totalInstructors,
    ] = await Promise.all([
      this.examRepository.count(),
      this.examRepository.count({ where: { durum: 'taslak' } }),
      this.examRepository.count({ where: { durum: 'yayinlandi' } }),
      this.examRepository.count({ where: { durum: 'planlanmadi' } }),
      this.facultyRepository.count(),
      this.departmentRepository.count(),
      this.roomRepository.count(),
      this.courseRepository.count(),
      this.instructorRepository.count(),
    ]);

    const plannedExams = draftExams + publishedExams;

    return {
      sinavlar: {
        toplam: totalExams,
        planlandi: plannedExams,
        planlanmadi: unplannedExams,
      },
      fakulteler: totalFaculties,
      bolumler: totalDepartments,
      derslikler: totalRooms,
      dersler: totalCourses,
      ogretimUyeleri: totalInstructors,
    };
  }
}
