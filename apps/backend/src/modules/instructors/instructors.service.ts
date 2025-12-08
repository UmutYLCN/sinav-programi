import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { In, Repository } from 'typeorm';
import { DateTime } from 'luxon';
import { createEvents, type EventAttributes } from 'ics';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import { ImportInstructorsDto } from './dto/import-instructors.dto';
import { Instructor } from '../../database/entities/instructor.entity';
import { Department } from '../../database/entities/department.entity';
import { InstructorQueryDto } from './dto/instructor-query.dto';
import { paginate } from '../../common/utils/paginate';
import { AvailableInstructorQueryDto } from './dto/available-instructor-query.dto';
import { Exam } from '../../database/entities/exam.entity';
import { ExamInvigilator } from '../../database/entities/exam-invigilator.entity';
import { InstructorUnavailability } from '../../database/entities/instructor-unavailability.entity';
import { RecurringUnavailabilityRule } from '../../database/entities/recurring-unavailability-rule.entity';
import { InstructorScheduleQueryDto } from './dto/schedule-query.dto';
import { EnvConfig } from '../../config/env.validation';

@Injectable()
export class InstructorsService {
  constructor(
    @InjectRepository(Instructor)
    private readonly instructorRepository: Repository<Instructor>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
    @InjectRepository(ExamInvigilator)
    private readonly examInvigilatorRepository: Repository<ExamInvigilator>,
    @InjectRepository(InstructorUnavailability)
    private readonly unavailabilityRepository: Repository<InstructorUnavailability>,
    @InjectRepository(RecurringUnavailabilityRule)
    private readonly recurringRepository: Repository<RecurringUnavailabilityRule>,
    private readonly configService: ConfigService<EnvConfig, true>,
  ) {}

  async create(createInstructorDto: CreateInstructorDto) {
    const existing = await this.instructorRepository.findOne({
      where: { email: createInstructorDto.email },
    });
    if (existing) {
      throw new ConflictException(
        'Bu e-posta adresi ile kayıtlı bir öğretim üyesi zaten mevcut.',
      );
    }

    const bolum = await this.departmentRepository.findOne({
      where: { id: createInstructorDto.bolumId },
      relations: ['fakulte'],
    });
    if (!bolum) {
      throw new NotFoundException('Bölüm bulunamadı.');
    }

    const yeni = this.instructorRepository.create({
      ...createInstructorDto,
      roller: createInstructorDto.roller ?? ['OGRETIM_UYESI'],
      aktif: createInstructorDto.aktif ?? true,
      bolum,
    });
    const kayit = await this.instructorRepository.save(yeni);

    return {
      mesaj: 'Öğretim üyesi başarıyla eklendi.',
      veri: kayit,
    };
  }

  async findAll(query: InstructorQueryDto) {
    const {
      page = 1,
      limit = 25,
      search,
      bolumId,
      fakulteId,
      rol,
      aktif,
    } = query;

    const qb = this.instructorRepository
      .createQueryBuilder('ogretimUyesi')
      .leftJoinAndSelect('ogretimUyesi.bolum', 'bolum')
      .leftJoinAndSelect('bolum.fakulte', 'fakulte');

    if (bolumId) {
      qb.andWhere('ogretimUyesi.bolumId = :bolumId', { bolumId });
    }
    if (fakulteId) {
      qb.andWhere('bolum.fakulteId = :fakulteId', { fakulteId });
    }
    if (rol) {
      qb.andWhere('JSON_CONTAINS(ogretimUyesi.roller, :rolJson)', {
        rolJson: JSON.stringify([rol]),
      });
    }
    if (aktif !== undefined) {
      qb.andWhere('ogretimUyesi.aktif = :aktif', {
        aktif: aktif === 'true',
      });
    }
    if (search) {
      qb.andWhere(
        '(LOWER(ogretimUyesi.ad) LIKE :aranan OR LOWER(ogretimUyesi.email) LIKE :aranan)',
        { aranan: `%${search.toLowerCase()}%` },
      );
    }

    qb.orderBy('ogretimUyesi.ad', 'ASC');

    const sonuc = await paginate<Instructor>(qb, page, limit);
    return {
      ...sonuc,
      mesaj: 'Öğretim üyeleri listelendi.',
    };
  }

  async findOne(id: string) {
    const ogretimUyesi = await this.instructorRepository.findOne({
      where: { id },
      relations: [
        'bolum',
        'bolum.fakulte',
        'gozetmenlikler',
        'gozetmenlikler.sinav',
        'musaitDegiller',
        'musaitDegilKurallari',
      ],
    });
    if (!ogretimUyesi) {
      throw new NotFoundException('Öğretim üyesi bulunamadı.');
    }
    return ogretimUyesi;
  }

  async update(id: string, updateInstructorDto: UpdateInstructorDto) {
    const ogretimUyesi = await this.instructorRepository.findOne({
      where: { id },
    });
    if (!ogretimUyesi) {
      throw new NotFoundException('Öğretim üyesi bulunamadı.');
    }

    if (
      updateInstructorDto.email &&
      updateInstructorDto.email !== ogretimUyesi.email
    ) {
      const emailCheck = await this.instructorRepository.findOne({
        where: { email: updateInstructorDto.email },
      });
      if (emailCheck) {
        throw new ConflictException(
          'Bu e-posta adresi başka bir öğretim üyesi tarafından kullanılıyor.',
        );
      }
    }

    if (updateInstructorDto.bolumId) {
      const bolum = await this.departmentRepository.findOne({
        where: { id: updateInstructorDto.bolumId },
      });
      if (!bolum) {
        throw new NotFoundException('Bölüm bulunamadı.');
      }
      ogretimUyesi.bolum = bolum;
      ogretimUyesi.bolumId = bolum.id;
    }

    Object.assign(ogretimUyesi, updateInstructorDto);
    const guncel = await this.instructorRepository.save(ogretimUyesi);

    return {
      mesaj: 'Öğretim üyesi güncellendi.',
      veri: guncel,
    };
  }

  async remove(id: string) {
    const ogretimUyesi = await this.instructorRepository.findOne({
      where: { id },
    });
    if (!ogretimUyesi) {
      throw new NotFoundException('Öğretim üyesi bulunamadı.');
    }
    await this.instructorRepository.remove(ogretimUyesi);
    return { mesaj: 'Öğretim üyesi silindi.' };
  }

  async import(dto: ImportInstructorsDto) {
    const olusturulan = [];
    const uyarilar = [];
    
    for (const kayit of dto.kayitlar) {
      try {
        const bolum = await this.departmentRepository.findOne({
          where: { id: kayit.bolumId },
        });
        if (!bolum) {
          uyarilar.push(`Öğretim üyesi "${kayit.email}" için bölüm bulunamadı, atlandı.`);
          continue;
        }

        const mevcut = await this.instructorRepository.findOne({
          where: { email: kayit.email },
        });
        if (mevcut) {
          uyarilar.push(`E-posta "${kayit.email}" zaten mevcut, atlandı.`);
          continue;
        }
        
        const yeni = this.instructorRepository.create({
          ...kayit,
          roller: kayit.roller ?? ['OGRETIM_UYESI'],
          aktif: kayit.aktif ?? true,
          bolum,
        });
        const kaydedilen = await this.instructorRepository.save(yeni);
        olusturulan.push(kaydedilen);
      } catch (error) {
        const mesaj = error instanceof Error ? error.message : String(error);
        uyarilar.push(`Öğretim üyesi "${kayit.email}" oluşturulamadı: ${mesaj}`);
      }
    }
    
    return {
      mesaj: `${olusturulan.length} öğretim üyesi başarıyla içe aktarıldı.`,
      veri: olusturulan,
      uyarilar,
    };
  }

  async findAvailable(query: AvailableInstructorQueryDto) {
    const timezone =
      this.configService.get('TIMEZONE', { infer: true }) ?? 'Europe/Istanbul';
    const baslangic = DateTime.fromISO(query.baslangic, { zone: timezone });
    const bitis = DateTime.fromISO(query.bitis, { zone: timezone });

    if (!baslangic.isValid || !bitis.isValid || bitis <= baslangic) {
      throw new ConflictException(
        'Başlangıç ve bitiş zamanları geçerli olmalıdır.',
      );
    }

    const qb = this.instructorRepository
      .createQueryBuilder('ogretimUyesi')
      .leftJoinAndSelect('ogretimUyesi.bolum', 'bolum')
      .leftJoinAndSelect('bolum.fakulte', 'fakulte')
      .where('ogretimUyesi.aktif = :aktif', { aktif: true });

    if (query.bolumId) {
      qb.andWhere('ogretimUyesi.bolumId = :bolumId', {
        bolumId: query.bolumId,
      });
    }
    if (query.fakulteId) {
      qb.andWhere('bolum.fakulteId = :fakulteId', {
        fakulteId: query.fakulteId,
      });
    }
    if (query.haricTutId) {
      qb.andWhere('ogretimUyesi.id != :haricTutId', {
        haricTutId: query.haricTutId,
      });
    }

    const adaylar = await qb.orderBy('ogretimUyesi.ad', 'ASC').getMany();
    if (adaylar.length === 0) {
      return { mesaj: 'Uygun gözetmen bulunamadı.', veriler: [] };
    }

    const adayIds = adaylar.map((a) => a.id);

    const sinavlar = await this.examRepository
      .createQueryBuilder('sinav')
      .leftJoinAndSelect('sinav.gozetmenler', 'gozetmen')
      .where(
        '(sinav.ogretimUyesiId IN (:...ids) OR gozetmen.ogretimUyesiId IN (:...ids))',
        { ids: adayIds },
      )
      .andWhere('sinav.tarih IS NOT NULL')
      .andWhere('sinav.baslangic IS NOT NULL')
      .andWhere('sinav.bitis IS NOT NULL')
      .getMany();

    const musaitDegiller = await this.unavailabilityRepository.find({
      where: { ogretimUyesiId: In(adayIds) },
    });

    const kalan = adaylar.filter((aday) => {
      const ilgiliSinavlar = sinavlar.filter(
        (sinav) =>
          sinav.ogretimUyesiId === aday.id ||
          sinav.gozetmenler?.some((g) => g.ogretimUyesiId === aday.id),
      );

      const sinavCakisma = ilgiliSinavlar.some((sinav) => {
        if (!sinav.tarih || !sinav.baslangic || !sinav.bitis) {
          return false;
        }
        const sinavBaslangic = DateTime.fromISO(
          `${sinav.tarih}T${sinav.baslangic}`,
          { zone: timezone },
        );
        const sinavBitis = DateTime.fromISO(`${sinav.tarih}T${sinav.bitis}`, {
          zone: timezone,
        });
        return (
          sinavBaslangic < bitis &&
          sinavBitis > baslangic &&
          sinavBitis > sinavBaslangic
        );
      });
      if (sinavCakisma) {
        return false;
      }

      const kisiMusaitDegil = musaitDegiller.filter(
        (m) => m.ogretimUyesiId === aday.id,
      );
      const engel = kisiMusaitDegil.some((kayit) => {
        const kayitBaslangic = DateTime.fromJSDate(kayit.baslangic, {
          zone: timezone,
        });
        const kayitBitis = DateTime.fromJSDate(kayit.bitis, {
          zone: timezone,
        });
        return kayitBaslangic < bitis && kayitBitis > baslangic;
      });
      if (engel) {
        return false;
      }

      return true;
    });

    return {
      mesaj: 'Uygun gözetmenler listelendi.',
      veriler: kalan,
    };
  }

  async getSchedule(id: string, query: InstructorScheduleQueryDto) {
    const timezone =
      this.configService.get('TIMEZONE', { infer: true }) ?? 'Europe/Istanbul';
    const ogretimUyesi = await this.findOne(id);

    const start = query.start
      ? DateTime.fromISO(query.start, { zone: timezone })
      : DateTime.now().minus({ weeks: 1 }).setZone(timezone);
    const end = query.end
      ? DateTime.fromISO(query.end, { zone: timezone })
      : DateTime.now().plus({ weeks: 6 }).setZone(timezone);

    const sinavlar = await this.examRepository
      .createQueryBuilder('sinav')
      .leftJoinAndSelect('sinav.ders', 'ders')
      .leftJoinAndSelect('sinav.derslik', 'derslik') // Deprecated: kept for backward compatibility
      .leftJoinAndSelect('sinav.derslikler', 'derslikler')
      .leftJoinAndSelect('derslikler.derslik', 'derslikDetay')
      .leftJoinAndSelect('sinav.ogretimUyesi', 'ogretimUyesi')
      .leftJoinAndSelect('sinav.gozetmenler', 'gozetmen')
      .leftJoinAndSelect('gozetmen.gozetmen', 'gozetmenInstructor')
      .where('sinav.tarih IS NOT NULL')
      .andWhere('sinav.baslangic IS NOT NULL')
      .andWhere('sinav.bitis IS NOT NULL')
      .andWhere(
        '(sinav.ogretimUyesiId = :id OR gozetmen.ogretimUyesiId = :id)',
        { id },
      )
      .getMany();

    const filtreliSinavlar = sinavlar.filter((sinav) => {
      if (!sinav.tarih || !sinav.baslangic || !sinav.bitis) {
        return false;
      }
      const sinavBaslangic = DateTime.fromISO(
        `${sinav.tarih}T${sinav.baslangic}`,
        { zone: timezone },
      );
      const sinavBitis = DateTime.fromISO(`${sinav.tarih}T${sinav.bitis}`, {
        zone: timezone,
      });
      return sinavBitis > start && sinavBaslangic < end;
    });

    const musaitDegiller = await this.unavailabilityRepository.find({
      where: { ogretimUyesiId: id },
      order: { baslangic: 'ASC' },
    });

    const kurallar = await this.recurringRepository.find({
      where: { ogretimUyesiId: id },
    });

    return {
      ogretimUyesi,
      zamanDilimi: timezone,
      sinavlar: filtreliSinavlar,
      musaitDegiller,
      kurallar,
    };
  }

  async exportScheduleIcs(id: string, query: InstructorScheduleQueryDto) {
    const timezone =
      this.configService.get('TIMEZONE', { infer: true }) ?? 'Europe/Istanbul';
    const ogretimUyesi = await this.findOne(id);
    const program = await this.getSchedule(id, query);

    const events: EventAttributes[] = program.sinavlar.map((sinav) => {
      const baslangic = DateTime.fromISO(`${sinav.tarih}T${sinav.baslangic}`, {
        zone: timezone,
      });
      const bitis = DateTime.fromISO(`${sinav.tarih}T${sinav.bitis}`, {
        zone: timezone,
      });
      return {
        start: [
          baslangic.year,
          baslangic.month,
          baslangic.day,
          baslangic.hour,
          baslangic.minute,
        ] as const,
        end: [bitis.year, bitis.month, bitis.day, bitis.hour, bitis.minute] as const,
        title: `${sinav.ders?.kod ?? 'Sınav'} • ${sinav.derslik?.ad ?? ''}`,
        description: `${sinav.ders?.ad ?? ''} (${sinav.sinif}. Sınıf)`,
        location: sinav.derslik?.ad ?? '',
        productId: 'sinav-programi',
      } satisfies EventAttributes;
    });

    const { error, value } = createEvents(events);
    if (error || !value) {
      throw new ConflictException('Takvim dosyası oluşturulamadı.');
    }

    const dosyaAdi = `gozetmen-${ogretimUyesi.ad
      .toLowerCase()
      .replace(/\s+/g, '-')}.ics`;
    return { ics: value, dosyaAdi };
  }
}
