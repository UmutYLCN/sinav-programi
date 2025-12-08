import { DataSource } from 'typeorm';
import { Faculty } from '../entities/faculty.entity';
import { Department } from '../entities/department.entity';
import { Instructor } from '../entities/instructor.entity';
import { Room } from '../entities/room.entity';
import { Course } from '../entities/course.entity';
import type { Donem, KullaniciRol, DerslikTip } from '@sinav/shared';

export class InitialSeeder {
  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    await this.seedFacultiesAndDepartments();
    await this.seedInstructors();
    await this.seedRooms();
    await this.seedCourses();
  }

  private async seedFacultiesAndDepartments() {
    const facultyRepo = this.dataSource.getRepository(Faculty);
    const departmentRepo = this.dataSource.getRepository(Department);

    const faculties = [
      { ad: 'Mühendislik Fakültesi', kod: 'MF' },
      { ad: 'Fen Edebiyat Fakültesi', kod: 'FEF' },
    ];

    for (const fac of faculties) {
      let faculty = await facultyRepo.findOne({ where: { kod: fac.kod } });
      if (!faculty) {
        faculty = facultyRepo.create(fac);
        faculty = await facultyRepo.save(faculty);
      }

      const departments = this.getDepartmentsForFaculty(faculty.kod).map(
        (dep) => ({
          ...dep,
          fakulte: faculty,
          fakulteId: faculty.id,
        }),
      );

      for (const dep of departments) {
        const existing = await departmentRepo.findOne({
          where: { kod: dep.kod },
        });
        if (!existing) {
          await departmentRepo.save(departmentRepo.create(dep));
        }
      }
    }
  }

  private getDepartmentsForFaculty(facultyCode: string) {
    if (facultyCode === 'MF') {
      return [
        { ad: 'Bilgisayar Mühendisliği', kod: 'CENG' },
        { ad: 'Elektrik-Elektronik Mühendisliği', kod: 'EE' },
      ];
    }
    return [
      { ad: 'Matematik', kod: 'MAT' },
      { ad: 'Fizik', kod: 'FZK' },
    ];
  }

  private async seedInstructors() {
    const departmentRepo = this.dataSource.getRepository(Department);
    const instructorRepo = this.dataSource.getRepository(Instructor);

    const departments = await departmentRepo.find();
    if (departments.length === 0) {
      return;
    }

    const instructors: Array<{
      ad: string;
      email: string;
      bolumKod: string;
      roller: KullaniciRol[];
    }> = [
      {
        ad: 'Dr. Öğr. Üyesi Ayşe Yılmaz',
        email: 'ayse.yilmaz@example.edu.tr',
        bolumKod: 'CENG',
        roller: ['OGRETIM_UYESI' as KullaniciRol],
      },
      {
        ad: 'Doç. Dr. Mehmet Demir',
        email: 'mehmet.demir@example.edu.tr',
        bolumKod: 'EE',
        roller: [
          'OGRETIM_UYESI' as KullaniciRol,
          'BOLUM_SORUMLUSU' as KullaniciRol,
        ],
      },
      {
        ad: 'Prof. Dr. Elif Kaya',
        email: 'elif.kaya@example.edu.tr',
        bolumKod: 'MAT',
        roller: ['OGRETIM_UYESI' as KullaniciRol],
      },
    ];

    for (const inst of instructors) {
      const bolum = departments.find((d) => d.kod === inst.bolumKod);
      if (!bolum) continue;

      const existing = await instructorRepo.findOne({
        where: { email: inst.email },
      });
      if (existing) continue;

      const instructor = instructorRepo.create({
        ad: inst.ad,
        email: inst.email,
        bolum,
        bolumId: bolum.id,
        roller: inst.roller,
        aktif: true,
      });
      await instructorRepo.save(instructor);
    }
  }

  private async seedRooms() {
    const facultyRepo = this.dataSource.getRepository(Faculty);
    const roomRepo = this.dataSource.getRepository(Room);

    const faculties = await facultyRepo.find();
    for (const faculty of faculties) {
      const rooms: Array<{
        ad: string;
        bina: string;
        tip: DerslikTip;
        kapasite: number;
      }> = [
        {
          ad: `${faculty.kod}-A101`,
          bina: 'A Blok',
          tip: 'amfi' as DerslikTip,
          kapasite: 120,
        },
        {
          ad: `${faculty.kod}-L201`,
          bina: 'Laboratuvar Binası',
          tip: 'laboratuvar' as DerslikTip,
          kapasite: 40,
        },
      ];

      for (const room of rooms) {
        const existing = await roomRepo.findOne({
          where: { ad: room.ad },
        });
        if (existing) continue;

        await roomRepo.save(
          roomRepo.create(room),
        );
      }
    }
  }

  private async seedCourses() {
    const departmentRepo = this.dataSource.getRepository(Department);
    const courseRepo = this.dataSource.getRepository(Course);

    const departments = await departmentRepo.find();
    for (const department of departments) {
      const courses = this.getCoursesForDepartment(department.kod);
      for (const course of courses) {
        const existing = await courseRepo.findOne({
          where: { kod: course.kod, bolumId: department.id },
        });
        if (existing) continue;

        await courseRepo.save(
          courseRepo.create({
            ...course,
            bolum: department,
            bolumId: department.id,
          }),
        );
      }
    }
  }

  private getCoursesForDepartment(
    kod: string,
  ): Array<{
    kod: string;
    ad: string;
    sinif: number;
    donem: Donem;
  }> {
    switch (kod) {
      case 'CENG':
        return [
          {
            kod: 'CENG101',
            ad: 'Programlamaya Giriş',
            sinif: 1,
            donem: 'guz' as Donem,
          },
          {
            kod: 'CENG202',
            ad: 'Veri Yapıları',
            sinif: 2,
            donem: 'bahar' as Donem,
          },
        ];
      case 'EE':
        return [
          {
            kod: 'EE105',
            ad: 'Devre Teorisi',
            sinif: 1,
            donem: 'guz' as Donem,
          },
          {
            kod: 'EE210',
            ad: 'Elektromanyetik Alanlar',
            sinif: 2,
            donem: 'bahar' as Donem,
          },
        ];
      case 'MAT':
        return [
          { kod: 'MAT101', ad: 'Analiz I', sinif: 1, donem: 'guz' as Donem },
          {
            kod: 'MAT206',
            ad: 'Lineer Cebir',
            sinif: 2,
            donem: 'bahar' as Donem,
          },
        ];
      default:
        return [
          {
            kod: `${kod}101`,
            ad: `${kod} Giriş`,
            sinif: 1,
            donem: 'guz' as Donem,
          },
        ];
    }
  }
}
