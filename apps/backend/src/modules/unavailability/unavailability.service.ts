import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { stringify } from 'csv-stringify/sync';
import { DateTime } from 'luxon';
import { CreateUnavailabilityDto } from './dto/create-unavailability.dto';
import { UpdateUnavailabilityDto } from './dto/update-unavailability.dto';
import { UnavailabilityQueryDto } from './dto/unavailability-query.dto';
import { InstructorUnavailability } from '../../database/entities/instructor-unavailability.entity';
import { Instructor } from '../../database/entities/instructor.entity';
import { Department } from '../../database/entities/department.entity';
import { Exam } from '../../database/entities/exam.entity';
import { ExamInvigilator } from '../../database/entities/exam-invigilator.entity';
import { ImportUnavailabilityDto } from './dto/import-unavailability.dto';
import { paginate } from '../../common/utils/paginate';
import {
  DEFAULT_TIMEZONE,
  durationsOverlap,
} from '../../common/utils/date-time';
import { EnvConfig } from '../../config/env.validation';
import type { PaginatedResult } from '../../common/interfaces/paginated-result';

@Injectable()
export class UnavailabilityService {
  constructor(
    @InjectRepository(InstructorUnavailability)
    private readonly unavailabilityRepository: Repository<InstructorUnavailability>,
    @InjectRepository(Instructor)
    private readonly instructorRepository: Repository<Instructor>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
    @InjectRepository(ExamInvigilator)
    private readonly examInvigilatorRepository: Repository<ExamInvigilator>,
    private readonly configService: ConfigService<EnvConfig, true>,
  ) {}

  async create(dto: CreateUnavailabilityDto) {
    const result = await this.persist(dto);
    return {
      mesaj: 'Müsait değil kaydı oluşturuldu.',
      veri: result.kayit,
      uyarilar: result.uyarilar,
    };
  }

  async findAll(
    query: UnavailabilityQueryDto,
  ): Promise<
    PaginatedResult<InstructorUnavailability> & { mesaj: string }
  > {
    const {
      page = 1,
      limit = 25,
      search,
      ogretimUyesiId,
      bolumId,
      fakulteId,
      baslangicTarihi,
      bitisTarihi,
      overrideEdildi,
    } = query;

    const qb = this.unavailabilityRepository
      .createQueryBuilder('musaitDegil')
      .leftJoinAndSelect('musaitDegil.ogretimUyesi', 'ogretimUyesi')
      .leftJoinAndSelect('ogretimUyesi.bolum', 'bolum')
      .leftJoinAndSelect('bolum.fakulte', 'fakulte');

    if (ogretimUyesiId) {
      qb.andWhere('musaitDegil.ogretimUyesiId = :ogretimUyesiId', {
        ogretimUyesiId,
      });
    }
    if (bolumId) {
      qb.andWhere('bolum.id = :bolumId', { bolumId });
    }
    if (fakulteId) {
      qb.andWhere('fakulte.id = :fakulteId', { fakulteId });
    }
    if (overrideEdildi !== undefined) {
      qb.andWhere('musaitDegil.overrideEdildi = :overrideEdildi', {
        overrideEdildi: overrideEdildi === 'true',
      });
    }
    if (baslangicTarihi) {
      qb.andWhere('musaitDegil.bitis >= :baslangicTarihi', {
        baslangicTarihi,
      });
    }
    if (bitisTarihi) {
      qb.andWhere('musaitDegil.baslangic <= :bitisTarihi', { bitisTarihi });
    }
    if (search) {
      qb.andWhere(
        '(LOWER(ogretimUyesi.ad) LIKE :aranan OR LOWER(musaitDegil.neden) LIKE :aranan)',
        { aranan: `%${search.toLowerCase()}%` },
      );
    }

    qb.orderBy('musaitDegil.baslangic', 'DESC');

    const sonuc = await paginate<InstructorUnavailability>(qb, page, limit);
    return {
      ...sonuc,
      mesaj: 'Müsait değil kayıtları listelendi.',
    };
  }

  async findOne(id: string) {
    const kayit = await this.unavailabilityRepository.findOne({
      where: { id },
      relations: [
        'ogretimUyesi',
        'ogretimUyesi.bolum',
        'ogretimUyesi.bolum.fakulte',
      ],
    });
    if (!kayit) {
      throw new NotFoundException('Müsait değil kaydı bulunamadı.');
    }
    return kayit;
  }

  async update(id: string, dto: UpdateUnavailabilityDto) {
    const kayit = await this.unavailabilityRepository.findOne({
      where: { id },
    });
    if (!kayit) {
      throw new NotFoundException('Müsait değil kaydı bulunamadı.');
    }

    const mergedDto: CreateUnavailabilityDto = {
      ogretimUyesiId: dto.ogretimUyesiId ?? kayit.ogretimUyesiId,
      baslangic: dto.baslangic ?? kayit.baslangic.toISOString(),
      bitis: dto.bitis ?? kayit.bitis.toISOString(),
      neden: dto.neden ?? kayit.neden,
      kaynak: dto.kaynak ?? kayit.kaynak,
      zorla: dto.zorla ?? false,
    };

    const result = await this.persist(mergedDto, id);
    return {
      mesaj: 'Müsait değil kaydı güncellendi.',
      veri: result.kayit,
      uyarilar: result.uyarilar,
    };
  }

  async remove(id: string) {
    const kayit = await this.unavailabilityRepository.findOne({
      where: { id },
    });
    if (!kayit) {
      throw new NotFoundException('Müsait değil kaydı bulunamadı.');
    }
    await this.unavailabilityRepository.remove(kayit);
    return { mesaj: 'Müsait değil kaydı silindi.' };
  }

  async import(dto: ImportUnavailabilityDto) {
    const olusturulan = [];
    const uyarilar = [];
    for (const kayit of dto.kayitlar) {
      try {
        const sonuc = await this.persist(kayit);
        olusturulan.push(sonuc.kayit);
        if (sonuc.uyarilar.length) {
          uyarilar.push(...sonuc.uyarilar);
        }
      } catch (error) {
        const mesaj =
          error instanceof Error ? error.message : String(error);
        uyarilar.push(
          `Öğretim üyesi ${kayit.ogretimUyesiId} kaydı oluşturulamadı: ${mesaj}`,
        );
      }
    }
    return {
      mesaj: `${olusturulan.length} kayıt oluşturuldu.`,
      veri: olusturulan,
      uyarilar,
    };
  }

  async bulkDelete(ids: string[]) {
    if (!ids?.length) {
      throw new BadRequestException('Silinecek kayıt bulunamadı.');
    }
    await this.unavailabilityRepository.delete(ids);
    return { mesaj: 'Kayıtlar silindi.' };
  }

  async exportCsv(query: UnavailabilityQueryDto) {
    const list = await this.findAll({ ...query, page: 1, limit: 10000 });
    const rows = list.veriler.map((item) => [
      item.ogretimUyesi?.ad ?? '',
      item.ogretimUyesi?.email ?? '',
      item.baslangic instanceof Date
        ? item.baslangic.toISOString()
        : new Date(item.baslangic).toISOString(),
      item.bitis instanceof Date
        ? item.bitis.toISOString()
        : new Date(item.bitis).toISOString(),
      item.neden,
      item.kaynak,
      item.overrideEdildi ? 'Evet' : 'Hayır',
    ]);
    const header = [
      'Öğretim Üyesi',
      'E-posta',
      'Başlangıç',
      'Bitiş',
      'Neden',
      'Kaynak',
      'Override',
    ];
    return stringify([header, ...rows], { delimiter: ';' });
  }

  private async persist(
    dto: CreateUnavailabilityDto,
    existingId?: string,
  ): Promise<{ kayit: InstructorUnavailability; uyarilar: string[] }> {
    const instructor = await this.instructorRepository.findOne({
      where: { id: dto.ogretimUyesiId },
      relations: ['bolum', 'bolum.fakulte'],
    });
    if (!instructor) {
      throw new NotFoundException('Öğretim üyesi bulunamadı.');
    }

    const timezone =
      this.configService.get('TIMEZONE', { infer: true }) ?? DEFAULT_TIMEZONE;
    const baslangic = DateTime.fromISO(dto.baslangic, { zone: timezone });
    const bitis = DateTime.fromISO(dto.bitis, { zone: timezone });
    if (!baslangic.isValid || !bitis.isValid || bitis <= baslangic) {
      throw new BadRequestException(
        'Başlangıç ve bitiş tarihleri geçerli değil.',
      );
    }

    const conflicts = await this.findExamConflicts(
      instructor.id,
      baslangic,
      bitis,
    );
    if (conflicts.length && !dto.zorla) {
      throw new ConflictException(
        `Bu zaman aralığı öğretim üyesinin sınav programı ile çakışıyor: ${conflicts.join(
          '; ',
        )}. Zorlamak için zorla=true gönderin.`,
      );
    }

    const kayitlar = await this.unavailabilityRepository.find({
      where: {
        ogretimUyesiId: instructor.id,
      },
      order: { baslangic: 'ASC' },
    });

    const mergeTargets = kayitlar.filter((kayit) => {
      if (existingId && kayit.id === existingId) {
        return true;
      }
      const mevcutBaslangic = DateTime.fromJSDate(kayit.baslangic, {
        zone: timezone,
      });
      const mevcutBitis = DateTime.fromJSDate(kayit.bitis, {
        zone: timezone,
      });
      if (!mevcutBaslangic.isValid || !mevcutBitis.isValid) {
        return false;
      }
      return durationsOverlap(
        baslangic,
        bitis,
        mevcutBaslangic as DateTime<true>,
        mevcutBitis as DateTime<true>,
      );
    });

    let finalBaslangic = baslangic;
    let finalBitis = bitis;
    const nedenler = new Set<string>([dto.neden]);

    for (const kayit of mergeTargets) {
      const mevcutBaslangic = DateTime.fromJSDate(kayit.baslangic, {
        zone: timezone,
      });
      const mevcutBitis = DateTime.fromJSDate(kayit.bitis, {
        zone: timezone,
      });
      if (!mevcutBaslangic.isValid || !mevcutBitis.isValid) {
        continue;
      }
      const normalizedBaslangic = mevcutBaslangic as DateTime<true>;
      const normalizedBitis = mevcutBitis as DateTime<true>;
      if (normalizedBaslangic < finalBaslangic) {
        finalBaslangic = normalizedBaslangic;
      }
      if (normalizedBitis > finalBitis) {
        finalBitis = normalizedBitis;
      }
      nedenler.add(kayit.neden);
    }

    const kaydedilecek =
      existingId && mergeTargets.some((k) => k.id === existingId)
        ? mergeTargets.find((k) => k.id === existingId)!
        : this.unavailabilityRepository.create();

    kaydedilecek.ogretimUyesi = instructor;
    kaydedilecek.ogretimUyesiId = instructor.id;
    kaydedilecek.baslangic = finalBaslangic.toJSDate();
    kaydedilecek.bitis = finalBitis.toJSDate();
    kaydedilecek.neden = Array.from(nedenler).join(' / ');
    kaydedilecek.kaynak = dto.kaynak ?? 'manuel';
    kaydedilecek.kaynak =
      kaydedilecek.kaynak === undefined ? 'manuel' : kaydedilecek.kaynak;
    kaydedilecek.overrideEdildi = dto.zorla ?? conflicts.length > 0;

    const silinecek = mergeTargets
      .map((k) => k.id)
      .filter((id) => id && id !== kaydedilecek.id);
    if (silinecek.length) {
      await this.unavailabilityRepository.delete(silinecek);
    }

    const kayit = await this.unavailabilityRepository.save(kaydedilecek);
    const uyarilar = conflicts.length
      ? [
          'Bu kayıt sınav programıyla çakışıyor. Override edildi ve overrideEdildi=true olarak işaretlendi.',
        ]
      : [];
    return { kayit, uyarilar };
  }

  private async findExamConflicts(
    instructorId: string,
    baslangic: DateTime,
    bitis: DateTime,
  ): Promise<string[]> {
    const timezone =
      this.configService.get('TIMEZONE', { infer: true }) ?? DEFAULT_TIMEZONE;

    const exams = await this.examRepository
      .createQueryBuilder('sinav')
      .leftJoinAndSelect('sinav.ders', 'ders')
      .leftJoinAndSelect('sinav.derslik', 'derslik')
      .leftJoinAndSelect('sinav.gozetmenler', 'gozetmen')
      .distinct(true)
      .where('sinav.tur = :tur', { tur: 'sinav' })
      .andWhere('sinav.tarih IS NOT NULL')
      .andWhere('sinav.baslangic IS NOT NULL')
      .andWhere('sinav.bitis IS NOT NULL')
      .andWhere(
        '(sinav.ogretimUyesiId = :id OR gozetmen.ogretimUyesiId = :id)',
        { id: instructorId },
      )
      .getMany();

    const conflicts: string[] = [];
    for (const sinav of exams) {
      if (!sinav.tarih || !sinav.baslangic || !sinav.bitis) continue;
      const sinavBaslangic = DateTime.fromISO(
        `${sinav.tarih}T${sinav.baslangic}`,
        { zone: timezone },
      );
      const sinavBitis = DateTime.fromISO(`${sinav.tarih}T${sinav.bitis}`, {
        zone: timezone,
      });
      if (durationsOverlap(baslangic, bitis, sinavBaslangic, sinavBitis)) {
        conflicts.push(
          `${sinav.ders?.kod ?? 'Sınav'} ${sinav.tarih} ${sinav.baslangic}-${sinav.bitis}`,
        );
      }
    }
    return conflicts;
  }
}
