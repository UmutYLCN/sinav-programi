import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { In, Repository } from 'typeorm';
import { DateTime } from 'luxon';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { Exam } from '../../database/entities/exam.entity';
import { Course } from '../../database/entities/course.entity';
import { Room } from '../../database/entities/room.entity';
import { Instructor } from '../../database/entities/instructor.entity';
import { ExamGroup } from '../../database/entities/exam-group.entity';
import { ExamInvigilator } from '../../database/entities/exam-invigilator.entity';
import { ExamRoom } from '../../database/entities/exam-room.entity';
import { InstructorUnavailability } from '../../database/entities/instructor-unavailability.entity';
import { ExamQueryDto } from './dto/exam-query.dto';
import { AutoAssignInvigilatorsDto } from './dto/auto-assign-invigilators.dto';
import { paginate } from '../../common/utils/paginate';
import {
  combineDateAndTime,
  DEFAULT_TIMEZONE,
  durationsOverlap,
} from '../../common/utils/date-time';
import { EnvConfig } from '../../config/env.validation';
import type { ExamConflict } from '@sinav/shared';

type ConflictBadge = ExamConflict;

@Injectable()
export class ExamsService {
  constructor(
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Instructor)
    private readonly instructorRepository: Repository<Instructor>,
    @InjectRepository(ExamGroup)
    private readonly examGroupRepository: Repository<ExamGroup>,
    @InjectRepository(ExamInvigilator)
    private readonly examInvigilatorRepository: Repository<ExamInvigilator>,
    @InjectRepository(ExamRoom)
    private readonly examRoomRepository: Repository<ExamRoom>,
    @InjectRepository(InstructorUnavailability)
    private readonly unavailabilityRepository: Repository<InstructorUnavailability>,
    private readonly configService: ConfigService<EnvConfig, true>,
  ) { }

  async create(createExamDto: CreateExamDto) {
    const course = await this.courseRepository.findOne({
      where: { id: createExamDto.dersId },
      relations: ['bolum', 'bolum.fakulte'],
    });
    if (!course) {
      throw new NotFoundException('Ders bulunamadı.');
    }

    const exam = new Exam();
    exam.ders = course;
    exam.dersId = course.id;
    exam.donem = (createExamDto.donem ?? course.donem) as Exam['donem'];
    exam.sinif = createExamDto.sinif ?? course.sinif;
    exam.tur = (createExamDto.tur ?? 'sinav') as Exam['tur'];
    exam.durum = (createExamDto.durum ?? 'planlanmadi') as Exam['durum'];
    exam.notlar = createExamDto.notlar ?? null;
    exam.cakismaOnayli = createExamDto.cakismaOnayli ?? false;

    await this.applyCommonRelations(exam, createExamDto);
    await this.applyTypeSpecificFields(exam, createExamDto);

    // Get room IDs before checking conflicts
    const derslikIds = createExamDto.derslikIds ?? (createExamDto.derslikId ? [createExamDto.derslikId] : []);

    // Temporarily set derslikId for conflict checking if we have rooms
    if (derslikIds.length > 0 && !exam.derslikId) {
      exam.derslikId = derslikIds[0]; // Set first room ID for compatibility
    }

    const conflicts = await this.collectConflicts(
      exam,
      createExamDto.gozetmenIds,
      undefined,
      derslikIds, // Pass room IDs explicitly
    );

    // Eğer kontrollü çakışma onayı yoksa, kritik çakışmaları engelle
    if (!exam.cakismaOnayli) {
      const kritik = conflicts.find((c) => c.seviye === 'kritik');
      if (kritik) {
        throw new ConflictException(
          `Çakışma tespit edildi: ${kritik.mesaj}. Lütfen saat/oda/gözetmen seçimlerini güncelleyin veya kontrollü çakışma onayını işaretleyin.`,
        );
      }
    }

    const savedExam = await this.examRepository.save(exam);
    await this.syncInvigilators(savedExam, createExamDto.gozetmenIds ?? []);
    await this.syncRooms(savedExam, derslikIds);

    const detay = await this.findOne(savedExam.id);
    return {
      mesaj: 'Sınav başarıyla oluşturuldu.',
      veri: detay,
      uyarilar: conflicts,
    };
  }

  async findAll(query: ExamQueryDto) {
    try {
      const {
        page = 1,
        limit = 25,
        search,
        bolumId,
        fakulteId,
        dersId,
        derslikId,
        ogretimUyesiId,
        gozetmenId,
        donem,
        durum,
        tur,
        baslangicTarihi,
        bitisTarihi,
      } = query;

      // Sınavları listele - otomatik oluşturma kaldırıldı, sadece manuel oluşturulan sınavlar görünecek
      const qb = this.examRepository
        .createQueryBuilder('sinav')
        .innerJoinAndSelect('sinav.ders', 'ders') // ders is required, so use innerJoin
        .leftJoinAndSelect('ders.bolum', 'bolum')
        .leftJoinAndSelect('bolum.fakulte', 'fakulte')
        .leftJoinAndSelect('sinav.derslik', 'derslik') // Deprecated: kept for backward compatibility
        .leftJoinAndSelect('sinav.derslikler', 'derslikler')
        .leftJoinAndSelect('derslikler.derslik', 'derslikDetay')
        .leftJoinAndSelect('sinav.ogretimUyesi', 'ogretimUyesi')
        .leftJoinAndSelect('sinav.gozetmenler', 'gozetmen')
        .leftJoinAndSelect('gozetmen.gozetmen', 'gozetmenDetay')
        .leftJoinAndSelect('sinav.ortakGrup', 'ortakGrup');

      if (bolumId) {
        qb.andWhere('ders.bolumId = :bolumId', { bolumId });
      }
      if (fakulteId) {
        qb.andWhere('bolum.fakulteId = :fakulteId', { fakulteId });
      }
      if (dersId) qb.andWhere('sinav.dersId = :dersId', { dersId });
      if (derslikId) qb.andWhere('sinav.derslikId = :derslikId', { derslikId });
      if (ogretimUyesiId)
        qb.andWhere('sinav.ogretimUyesiId = :ogretimUyesiId', { ogretimUyesiId });
      if (gozetmenId) {
        qb.andWhere('gozetmen.ogretimUyesiId = :gozetmenId', { gozetmenId });
      }
      if (donem) qb.andWhere('sinav.donem = :donem', { donem });
      if (durum) qb.andWhere('sinav.durum = :durum', { durum });
      if (tur) {
        qb.andWhere('sinav.tur = :tur', { tur });
      } else {
        // Eğer tur filtresi yoksa, varsayılan olarak 'sinav' türündeki sınavları göster
        qb.andWhere('sinav.tur = :turValue', { turValue: 'sinav' });
      }

      if (baslangicTarihi) {
        qb.andWhere('(sinav.tarih IS NULL OR sinav.tarih >= :baslangicTarihi)', {
          baslangicTarihi,
        });
      }
      if (bitisTarihi) {
        qb.andWhere('(sinav.tarih IS NULL OR sinav.tarih <= :bitisTarihi)', {
          bitisTarihi,
        });
      }

      if (search) {
        // Use simpler approach - search in course and room names
        // Note: ders is required, so it should always exist
        qb.andWhere(
          '(LOWER(ders.ad) LIKE :aranan OR LOWER(ders.kod) LIKE :aranan OR LOWER(derslik.ad) LIKE :aranan)',
          { aranan: `%${search.toLowerCase()}%` },
        );
      }

      // MySQL doesn't support NULLS LAST, so we order by date first, then by time
      // NULL dates will appear first, but we can handle this in the frontend if needed
      // ders is always present due to innerJoin, so we can safely order by ders.kod
      qb.orderBy('sinav.tarih', 'ASC')
        .addOrderBy('sinav.baslangic', 'ASC')
        .addOrderBy('ders.kod', 'ASC');

      const sonuc = await paginate<Exam>(qb, page, limit);
      return {
        ...sonuc,
        mesaj: 'Sınavlar listelendi.',
      };
    } catch (error) {
      console.error('Exams findAll error:', error);
      throw new BadRequestException(
        `Sınavlar listelenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
      );
    }
  }

  async findOne(id: string) {
    const sinav = await this.examRepository.findOne({
      where: { id },
      relations: [
        'ders',
        'ders.bolum',
        'ders.bolum.fakulte',
        'derslik', // Deprecated: kept for backward compatibility
        'derslikler',
        'derslikler.derslik',
        'ogretimUyesi',
        'ortakGrup',
        'gozetmenler',
        'gozetmenler.gozetmen',
      ],
    });

    if (!sinav) {
      throw new NotFoundException('Sınav bulunamadı.');
    }

    const conflicts = await this.collectConflicts(sinav);

    return { ...sinav, cakismalar: conflicts };
  }

  async update(id: string, updateExamDto: UpdateExamDto) {
    const sinav = await this.examRepository.findOne({
      where: { id },
      relations: ['ders', 'ders.bolum', 'ders.bolum.fakulte', 'gozetmenler', 'derslikler', 'derslikler.derslik'],
    });
    if (!sinav) {
      throw new NotFoundException('Sınav bulunamadı.');
    }

    await this.applyCommonRelations(sinav, updateExamDto);
    await this.applyTypeSpecificFields(sinav, updateExamDto);

    // Update cakismaOnayli if provided
    if (updateExamDto.cakismaOnayli !== undefined) {
      sinav.cakismaOnayli = updateExamDto.cakismaOnayli;
    }

    const gozetmenIds =
      updateExamDto.gozetmenIds ??
      sinav.gozetmenler?.map((g) => g.ogretimUyesiId) ??
      [];

    // Get room IDs for conflict checking
    const derslikIds = updateExamDto.derslikIds ??
      (sinav.derslikler && sinav.derslikler.length > 0
        ? sinav.derslikler.map((dr) => dr.derslikId).filter(Boolean)
        : sinav.derslikId
          ? [sinav.derslikId]
          : []);

    // Otomatik durum güncellemesi: Eğer tarih, saat, derslik ve gözetmen girildiyse durumu "taslak" yap
    if (sinav.tur === 'sinav' && sinav.durum === 'planlanmadi') {
      const hasTarih = sinav.tarih !== null && sinav.tarih !== undefined;
      const hasSaat = sinav.baslangic !== null && sinav.baslangic !== undefined &&
        sinav.bitis !== null && sinav.bitis !== undefined;
      const hasDerslik = derslikIds.length > 0;
      const hasGozetmen = gozetmenIds.length > 0;

      if (hasTarih && hasSaat && hasDerslik && hasGozetmen) {
        sinav.durum = 'taslak';
      }
    }

    const conflicts = await this.collectConflicts(sinav, gozetmenIds, sinav.id, derslikIds);

    // Eğer kontrollü çakışma onayı yoksa, kritik çakışmaları engelle
    if (!sinav.cakismaOnayli) {
      const kritik = conflicts.find((c) => c.seviye === 'kritik');
      if (kritik) {
        throw new ConflictException(
          `Çakışma tespit edildi: ${kritik.mesaj}. Lütfen saat/oda/gözetmen seçimlerini güncelleyin veya kontrollü çakışma onayını işaretleyin.`,
        );
      }
    }

    const guncel = await this.examRepository.save(sinav);
    await this.syncInvigilators(guncel, gozetmenIds);

    // Use the derslikIds already defined above
    await this.syncRooms(guncel, derslikIds);

    const detay = await this.findOne(guncel.id);
    return {
      mesaj: 'Sınav güncellendi.',
      veri: detay,
      uyarilar: conflicts,
    };
  }

  async remove(id: string) {
    const sinav = await this.examRepository.findOne({ where: { id } });
    if (!sinav) {
      throw new NotFoundException('Sınav bulunamadı.');
    }

    await this.examRepository.remove(sinav);
    return { mesaj: 'Sınav silindi.' };
  }

  private async applyCommonRelations(
    sinav: Exam,
    dto: Partial<CreateExamDto | UpdateExamDto>,
  ) {
    // ogretimUyesiId artık zorunlu - CreateExamDto'da her zaman olmalı
    if (dto.ogretimUyesiId !== undefined) {
      const ogretimUyesi = await this.instructorRepository.findOne({
        where: { id: dto.ogretimUyesiId },
      });
      if (!ogretimUyesi) {
        throw new NotFoundException('Öğretim üyesi bulunamadı.');
      }
      sinav.ogretimUyesi = ogretimUyesi;
      sinav.ogretimUyesiId = ogretimUyesi.id;
    } else if (!sinav.ogretimUyesiId) {
      // Eğer yeni kayıt oluşturuluyorsa ve ogretimUyesiId yoksa hata ver
      throw new BadRequestException('Sorumlu öğretim üyesi zorunludur.');
    }

    if (dto.ortakGrupId) {
      const grup = await this.examGroupRepository.findOne({
        where: { id: dto.ortakGrupId },
      });
      if (!grup) {
        throw new NotFoundException('Ortak sınav grubu bulunamadı.');
      }
      sinav.ortakGrup = grup;
      sinav.ortakGrupId = grup.id;
    } else if (dto.ortakGrupId === null) {
      sinav.ortakGrup = null;
      sinav.ortakGrupId = null;
    }

    if (dto.durum) {
      sinav.durum = dto.durum as Exam['durum'];
    }

    if (dto.donem) {
      sinav.donem = dto.donem as Exam['donem'];
    }

    if (dto.sinif !== undefined) {
      sinav.sinif = dto.sinif ?? sinav.sinif;
    }

    if (dto.notlar !== undefined) {
      sinav.notlar = dto.notlar ?? null;
    }
  }

  private async applyTypeSpecificFields(
    sinav: Exam,
    dto: Partial<CreateExamDto | UpdateExamDto>,
  ) {
    if (dto.tur) {
      sinav.tur = dto.tur as Exam['tur'];
    }

    if (sinav.tur === 'sinav') {
      const tarih = dto.tarih ?? sinav.tarih ?? null;
      const baslangic = dto.baslangic ?? sinav.baslangic ?? null;
      const bitis = dto.bitis ?? sinav.bitis ?? null;

      const sureBelirlendi = Boolean(tarih && baslangic && bitis);
      const planlanmamis = sinav.durum === 'planlanmadi';

      if (!planlanmamis && !sureBelirlendi) {
        throw new BadRequestException(
          'Sınav türündeki kayıtlar için tarih, başlangıç ve bitiş saatleri zorunludur. Planlanmamış sınavlar için durumunu "planlanmadı" bırakın.',
        );
      }

      if (sureBelirlendi) {
        sinav.tarih = tarih;
        sinav.baslangic = baslangic;
        sinav.bitis = bitis;
      } else {
        sinav.tarih = null;
        sinav.baslangic = null;
        sinav.bitis = null;
      }

      if (dto.derslikId) {
        sinav.derslikId = dto.derslikId;
      }

      if (dto.derslikId === null || (!sinav.derslikId && !sureBelirlendi)) {
        sinav.derslik = null;
        sinav.derslikId = null;
      }

      if (sinav.derslikId && sureBelirlendi) {
        const derslik = await this.roomRepository.findOne({
          where: { id: sinav.derslikId },
        });
        if (!derslik) {
          throw new NotFoundException('Derslik bulunamadı.');
        }
        sinav.derslik = derslik;
      }

      if (sureBelirlendi) {
        sinav.teslimLinki = null;
        sinav.teslimTarihi = null;
      }
    } else {
      // Ödev / Proje
      sinav.tarih = null;
      sinav.baslangic = null;
      sinav.bitis = null;
      sinav.derslik = null;
      sinav.derslikId = null;
      sinav.gozetmenler = [];

      if (dto.teslimTarihi !== undefined) {
        sinav.teslimTarihi = dto.teslimTarihi ?? null;
      }
      if (dto.teslimLinki !== undefined) {
        sinav.teslimLinki = dto.teslimLinki ?? null;
      }
    }

    if (sinav.derslikId === null) {
      sinav.derslik = null;
    }
  }

  private async collectConflicts(
    sinav: Exam,
    gozetmenIds: string[] = [],
    examIdToExclude?: string,
    explicitRoomIds?: string[], // Explicitly pass room IDs for new exams
  ): Promise<ConflictBadge[]> {
    if (
      sinav.tur !== 'sinav' ||
      !sinav.tarih ||
      !sinav.baslangic ||
      !sinav.bitis
    ) {
      return [];
    }

    const timezone =
      this.configService.get('TIMEZONE', { infer: true }) ?? DEFAULT_TIMEZONE;
    const start = combineDateAndTime(sinav.tarih, sinav.baslangic, timezone);
    const end = combineDateAndTime(sinav.tarih, sinav.bitis, timezone);
    if (end <= start) {
      throw new BadRequestException(
        'Bitiş saati başlangıç saatinden sonra olmalıdır.',
      );
    }

    const sameDayExams = await this.examRepository.find({
      where: {
        tarih: sinav.tarih,
      },
      relations: ['ders', 'ders.bolum', 'derslik', 'derslikler', 'derslikler.derslik', 'ogretimUyesi', 'gozetmenler'],
    });

    const filtered = sameDayExams.filter(
      (item) =>
        item.id !== examIdToExclude &&
        item.id !== sinav.id &&
        item.baslangic &&
        item.bitis &&
        durationsOverlap(
          combineDateAndTime(item.tarih!, item.baslangic, timezone),
          combineDateAndTime(item.tarih!, item.bitis, timezone),
          start,
          end,
        ),
    );

    const conflicts: ConflictBadge[] = [];

    // Get all room IDs for this exam (from explicit parameter, old derslikId, or new derslikler)
    const examRoomIds = new Set<string>();
    if (explicitRoomIds && explicitRoomIds.length > 0) {
      explicitRoomIds.forEach((id) => examRoomIds.add(id));
    }
    if (sinav.derslikId) {
      examRoomIds.add(sinav.derslikId);
    }
    if (sinav.derslikler && sinav.derslikler.length > 0) {
      sinav.derslikler.forEach((dr) => {
        if (dr.derslikId) examRoomIds.add(dr.derslikId);
      });
    }

    // Check conflicts for each room
    for (const roomId of examRoomIds) {
      const odaCakisan = filtered.find(
        (item) => {
          // Check old derslikId
          if (item.derslikId === roomId) return true;
          // Check new derslikler
          if (item.derslikler && item.derslikler.length > 0) {
            return item.derslikler.some((dr) => dr.derslikId === roomId);
          }
          return false;
        },
      );
      if (odaCakisan && !odaCakisan.cakismaOnayli) {
        // Get room name - try to find from database if not in relations
        let roomName = 'Bilinmeyen';
        if (sinav.derslikler && sinav.derslikler.length > 0) {
          const examRoom = sinav.derslikler.find((dr) => dr.derslikId === roomId);
          roomName = examRoom?.derslik?.ad ?? roomName;
        }
        if (roomName === 'Bilinmeyen' && sinav.derslik?.id === roomId) {
          roomName = sinav.derslik.ad;
        }
        if (roomName === 'Bilinmeyen') {
          // Try to get from database
          const room = await this.roomRepository.findOne({ where: { id: roomId } });
          roomName = room?.ad ?? 'Bilinmeyen';
        }

        // Get conflicting exam details
        const conflictingCourse = odaCakisan.ders?.kod ?? odaCakisan.ders?.ad ?? 'Bilinmeyen Ders';
        const conflictingTime = odaCakisan.baslangic && odaCakisan.bitis
          ? `${odaCakisan.baslangic.slice(0, 5)} - ${odaCakisan.bitis.slice(0, 5)}`
          : 'Belirsiz';

        conflicts.push({
          tur: 'derslik',
          seviye: 'kritik',
          mesaj: `Derslik ${roomName} seçilen saat aralığında "${conflictingCourse}" dersi için başka bir sınava (${conflictingTime}) atanmış.`,
          ilgiliId: roomId,
        });
      }
    }

    // Check for same class conflicts (same class, same time, different course)
    // This checks if the same class has exams for different courses at the same time
    if (examRoomIds.size > 0) {
      const ayniSinifCakisan = filtered.find(
        (item) => {
          // Same class check - must be same class, different course, same time
          if (item.sinif === sinav.sinif && item.dersId !== sinav.dersId) {
            // Check if same room is used
            const itemRoomIds = new Set<string>();
            if (item.derslikId) itemRoomIds.add(item.derslikId);
            if (item.derslikler && item.derslikler.length > 0) {
              item.derslikler.forEach((dr) => {
                if (dr.derslikId) itemRoomIds.add(dr.derslikId);
              });
            }

            // Check if any room overlaps
            for (const roomId of examRoomIds) {
              if (itemRoomIds.has(roomId)) {
                return true;
              }
            }
          }
          return false;
        },
      );
      if (ayniSinifCakisan && !ayniSinifCakisan.cakismaOnayli && !sinav.cakismaOnayli) {
        conflicts.push({
          tur: 'derslik',
          seviye: 'kritik',
          mesaj: `Aynı sınıf (${sinav.sinif}) aynı saatte farklı bir ders (${ayniSinifCakisan.ders?.kod ?? 'Bilinmeyen'}) için başka bir sınava atanmış.`,
          ilgiliId: sinav.dersId,
        });
      }
    }

    if (sinav.ogretimUyesiId) {
      const hocaCakisan = filtered.find(
        (item) => item.ogretimUyesiId === sinav.ogretimUyesiId && !item.cakismaOnayli,
      );
      if (hocaCakisan) {
        conflicts.push({
          tur: 'ogretim-uyesi',
          seviye: 'kritik',
          mesaj: `Öğretim üyesi seçilen saat aralığında başka bir sınava atanmış.`,
          ilgiliId: sinav.ogretimUyesiId,
        });
      }
    }

    if (gozetmenIds.length) {
      for (const gozetmenId of gozetmenIds) {
        const gozetmenCakisan = filtered.find((item) =>
          item.gozetmenler?.some((g) => g.ogretimUyesiId === gozetmenId) && !item.cakismaOnayli,
        );
        if (gozetmenCakisan) {
          conflicts.push({
            tur: 'gozetmen',
            seviye: 'kritik',
            mesaj: `Gözetmen seçilen saat aralığında başka bir sınava atanmış.`,
            ilgiliId: gozetmenId,
          });
        }
      }
    }

    const kisiList = [sinav.ogretimUyesiId, ...(gozetmenIds ?? [])].filter(
      Boolean,
    ) as string[];

    const unavailability = kisiList.length
      ? await this.unavailabilityRepository.find({
        where: {
          ogretimUyesiId: In(kisiList),
        },
        relations: ['ogretimUyesi'],
      })
      : [];

    for (const kayit of unavailability) {
      const baslangic = DateTime.fromJSDate(kayit.baslangic, {
        zone: timezone,
      });
      const bitis = DateTime.fromJSDate(kayit.bitis, { zone: timezone });

      // Tarih kontrolü: Sadece aynı gün için çakışma kontrolü yap
      // baslangic datetime olduğu için tarih bilgisini buradan alıyoruz
      const unavailabilityDate = baslangic.toISODate();
      const examDate = start.toISODate();

      // Sadece aynı gün için çakışma kontrolü yap
      if (unavailabilityDate === examDate) {
        if (durationsOverlap(start, end, baslangic, bitis)) {
          // Öğretim üyesi bilgisini al (relation yüklü değilse veritabanından çek)
          let kisiAdi = 'Bilinmeyen';
          if (kayit.ogretimUyesi?.ad) {
            kisiAdi = kayit.ogretimUyesi.ad;
          } else {
            const ogretimUyesi = await this.instructorRepository.findOne({
              where: { id: kayit.ogretimUyesiId },
            });
            kisiAdi = ogretimUyesi?.ad ?? 'Bilinmeyen';
          }

          const unavailabilityTime = `${baslangic.toFormat('HH:mm')} - ${bitis.toFormat('HH:mm')}`;

          conflicts.push({
            tur: 'musait-degil',
            seviye: 'kritik',
            mesaj: `${kisiAdi} (${kayit.neden}) belirtilen saatte (${unavailabilityTime}) müsait değil.`,
            ilgiliId: kayit.ogretimUyesiId,
          });
        }
      }
    }

    return conflicts.filter((c, index, arr) => {
      const key = `${c.tur}-${c.ilgiliId}-${c.mesaj}`;
      return (
        arr.findIndex((d) => `${d.tur}-${d.ilgiliId}-${d.mesaj}` === key) ===
        index
      );
    });
  }

  private async syncRooms(exam: Exam, derslikIds: string[]) {
    await this.examRoomRepository.delete({ sinavId: exam.id });

    if (!derslikIds || derslikIds.length === 0) {
      return;
    }

    const rooms = await this.roomRepository.find({
      where: { id: In(derslikIds) },
    });

    const examRooms = rooms.map((room) => {
      const examRoom = new ExamRoom();
      examRoom.sinavId = exam.id;
      examRoom.derslikId = room.id;
      examRoom.derslik = room;
      examRoom.sinav = exam;
      return examRoom;
    });

    await this.examRoomRepository.save(examRooms);
  }

  private async syncInvigilators(exam: Exam, gozetmenIds: string[]) {
    await this.examInvigilatorRepository.delete({ sinavId: exam.id });

    if (!gozetmenIds || gozetmenIds.length === 0) {
      return;
    }

    const instructors = await this.instructorRepository.find({
      where: { id: In(gozetmenIds) },
    });

    const entities = instructors.map((ins, index) =>
      this.examInvigilatorRepository.create({
        sinav: exam,
        sinavId: exam.id,
        gozetmen: ins,
        ogretimUyesiId: ins.id,
        rol: index === 0 ? 'birincil' : 'ikincil',
      }),
    );

    await this.examInvigilatorRepository.save(entities);
  }

  async autoAssignInvigilators(dto: AutoAssignInvigilatorsDto) {
    const timezone =
      this.configService.get('TIMEZONE', { infer: true }) ?? DEFAULT_TIMEZONE;
    const esikDeger = dto.esikDeger ?? 30; // Varsayılan eşik: 30 öğrenci

    // Filtrelere uyan sınavları bul
    const where: any = {
      tur: 'sinav',
    };

    if (dto.donem) {
      where.donem = dto.donem;
    }
    if (dto.durum) {
      where.durum = dto.durum;
    }
    if (dto.bolumId) {
      where.ders = { bolumId: dto.bolumId };
    }

    let exams = await this.examRepository.find({
      where,
      relations: [
        'ders',
        'ders.bolum',
        'gozetmenler',
        'ogretimUyesi',
        'derslikler',
        'derslikler.derslik',
      ],
      order: {
        tarih: 'ASC',
        baslangic: 'ASC',
      },
    });

    // Seçili sınavlar modu ise filtrele
    if (dto.sinavIds && dto.sinavIds.length > 0) {
      exams = exams.filter((exam) => dto.sinavIds!.includes(exam.id));
    }

    // Sadece tarih/saat bilgisi olan sınavları al
    exams = exams.filter(
      (exam) => exam.tarih && exam.baslangic && exam.bitis,
    );

    if (exams.length === 0) {
      return {
        mesaj: 'Atama yapılacak sınav bulunamadı.',
        atananlar: [],
        atanamayanlar: [],
        gozetmenYukleri: {},
      };
    }

    // Seçilen sınavların ID'lerini al
    const examIds = exams.map((e) => e.id);

    // Önce seçilen sınavların mevcut gözetmen atamalarını sil
    await this.examInvigilatorRepository.delete({
      sinavId: In(examIds),
    });

    // Tüm aktif gözetmenleri al
    const allInstructors = await this.instructorRepository.find({
      where: { aktif: true },
      relations: ['bolum'],
    });

    // Gözetmen yüklerini hesapla (günlük bazda)
    const gozetmenYukleri: Record<string, Record<string, number>> = {}; // { instructorId: { date: count } }
    const gozetmenGunlukYukleri: Record<string, Record<string, number>> = {}; // { instructorId: { date: count } }
    const gozetmenToplamYukleri: Record<string, number> = {}; // { instructorId: totalCount }

    // Mevcut gözetmen atamalarını yükle (sadece tarih/saat bilgisi olan sınavlar için)
    // Seçilen sınavların atamalarını hariç tut (çünkü bunları sildik)
    const existingAssignmentsQuery = this.examInvigilatorRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.sinav', 'sinav')
      .leftJoinAndSelect('assignment.gozetmen', 'gozetmen')
      .where('sinav.tarih IS NOT NULL')
      .andWhere('sinav.baslangic IS NOT NULL')
      .andWhere('sinav.bitis IS NOT NULL');

    if (examIds.length > 0) {
      existingAssignmentsQuery.andWhere('sinav.id NOT IN (:...examIds)', { examIds });
    }

    const existingAssignments = await existingAssignmentsQuery.getMany();

    for (const assignment of existingAssignments) {
      const exam = assignment.sinav;
      if (!exam.tarih) continue;

      const instructorId = assignment.ogretimUyesiId;
      if (!gozetmenYukleri[instructorId]) {
        gozetmenYukleri[instructorId] = {};
        gozetmenGunlukYukleri[instructorId] = {};
        gozetmenToplamYukleri[instructorId] = 0;
      }

      if (!gozetmenYukleri[instructorId][exam.tarih]) {
        gozetmenYukleri[instructorId][exam.tarih] = 0;
        gozetmenGunlukYukleri[instructorId][exam.tarih] = 0;
      }

      gozetmenYukleri[instructorId][exam.tarih]++;
      gozetmenGunlukYukleri[instructorId][exam.tarih]++;
      gozetmenToplamYukleri[instructorId] = (gozetmenToplamYukleri[instructorId] ?? 0) + 1;
    }

    // Müsait olmayan kayıtları yükle
    const unavailabilities = await this.unavailabilityRepository.find({
      relations: ['ogretimUyesi'],
    });

    const atananlar: Array<{
      sinavId: string;
      sinavKod: string;
      gozetmenSayisi: number;
      gozetmenler: Array<{ id: string; ad: string; rol: string }>;
    }> = [];

    const atanamayanlar: Array<{
      sinavId: string;
      sinavKod: string;
      sebep: string;
    }> = [];

    // Bu oturumda atanan gözetmenleri takip et (aynı döngüde çakışma kontrolü için)
    const sessionAssignments: Array<{
      examId: string;
      examDate: string;
      examStart: DateTime;
      examEnd: DateTime;
      instructorId: string;
    }> = [];

    // Sınavları tarih ve saat sırasına göre sırala (daha iyi yük dağılımı için)
    exams.sort((a, b) => {
      if (a.tarih !== b.tarih) {
        return a.tarih!.localeCompare(b.tarih!);
      }
      if (a.baslangic !== b.baslangic) {
        return a.baslangic!.localeCompare(b.baslangic!);
      }
      return 0;
    });

    // Her sınav için gözetmen ata
    for (const exam of exams) {
      // Öğrenci kapasitesi ve derslik sayısını belirle
      // NOT: 'exam.sinif' alanı artık formdan gelen öğrenci mevcudiyetini tutuyor
      const ogrenciKapasitesi =
        exam.sinif || // Önce formda girilen (veya ders kapasitesinden gelen) değeri kullan
        exam.ders?.ogrenciKapasitesi ||
        exam.derslikler?.reduce(
          (sum, er) => sum + (er.derslik?.kapasite ?? 0),
          0,
        ) ||
        0;

      // Derslik sayısını belirle (yeni derslikler array'i veya eski derslikId)
      const derslikSayisi = exam.derslikler?.length || (exam.derslikId ? 1 : 0);
      const cokluSinif = derslikSayisi >= 2;

      // Gözetmen sayısı ve sorumlu hoca atama stratejisini belirle
      let gerekliGozetmenSayisi: number;
      let sorumluHocaGözetmenOlsun: boolean;

      // Eğer birden fazla derslik varsa, her dersliğin ortalama öğrenci sayısına bak
      const odaBasinaOgrenci = derslikSayisi > 0 ? ogrenciKapasitesi / derslikSayisi : ogrenciKapasitesi;

      if (odaBasinaOgrenci > esikDeger) {
        // Her sınıf için 2 gözetmen gerekli
        gerekliGozetmenSayisi = Math.max(2, derslikSayisi * 2);

        if (cokluSinif) {
          // Çoklu sınıfta hoca genellikle genel koordinasyon yapar, gözetmen atanmaz
          sorumluHocaGözetmenOlsun = false;
        } else {
          // Tek sınıfta hoca baş gözetmen olabilir
          sorumluHocaGözetmenOlsun = true;
        }
      } else {
        // Her sınıf için 1 gözetmen yeterli
        gerekliGozetmenSayisi = Math.max(1, derslikSayisi);
        sorumluHocaGözetmenOlsun = false;
      }

      // Sınav tarih/saat bilgisi
      const examStart = combineDateAndTime(
        exam.tarih!,
        exam.baslangic!,
        timezone,
      );
      const examEnd = combineDateAndTime(exam.tarih!, exam.bitis!, timezone);
      const examDate = exam.tarih!;

      // Sorumlu hocayı bul
      const sorumluHoca = exam.ogretimUyesiId
        ? allInstructors.find((i) => i.id === exam.ogretimUyesiId)
        : null;

      // Sorumlu hocanın müsait olup olmadığını kontrol et (eğer gözetmen olarak atanacaksa)
      let sorumluHocaMusait = false;
      if (sorumluHocaGözetmenOlsun && sorumluHoca) {
        // Günlük maksimum kontrolü
        const gunlukYuk =
          gozetmenGunlukYukleri[sorumluHoca.id]?.[examDate] ?? 0;
        if (gunlukYuk < 4) {
          // Müsait değil kayıtları kontrol et
          const kisiMusaitDegil = unavailabilities.filter(
            (u) => u.ogretimUyesiId === sorumluHoca.id,
          );
          const engel = kisiMusaitDegil.some((kayit) => {
            const kayitBaslangic = DateTime.fromJSDate(kayit.baslangic, {
              zone: timezone,
            });
            const kayitBitis = DateTime.fromJSDate(kayit.bitis, {
              zone: timezone,
            });
            const kayitTarih = kayitBaslangic.toISODate();
            return (
              kayitTarih === examDate &&
              durationsOverlap(examStart, examEnd, kayitBaslangic, kayitBitis)
            );
          });

          // Mevcut sınav çakışmaları kontrol et
          const ilgiliSinavlar = existingAssignments.filter(
            (a) =>
              a.ogretimUyesiId === sorumluHoca.id &&
              a.sinav.tarih === examDate &&
              a.sinav.baslangic &&
              a.sinav.bitis,
          );
          const sinavCakisma = ilgiliSinavlar.some((a) => {
            const sinavBaslangic = combineDateAndTime(
              a.sinav.tarih!,
              a.sinav.baslangic!,
              timezone,
            );
            const sinavBitis = combineDateAndTime(
              a.sinav.tarih!,
              a.sinav.bitis!,
              timezone,
            );
            return durationsOverlap(examStart, examEnd, sinavBaslangic, sinavBitis);
          });

          // Session çakışma kontrolü
          const sessionConflict = sessionAssignments.some((sa) => {
            return (
              sa.instructorId === sorumluHoca.id &&
              sa.examDate === examDate &&
              durationsOverlap(examStart, examEnd, sa.examStart, sa.examEnd)
            );
          });

          sorumluHocaMusait = !engel && !sinavCakisma && !sessionConflict;
        }
      }

      // Müsait gözetmenleri bul
      const musaitGozetmenler = allInstructors.filter((instructor) => {
        // Sorumlu öğretim üyesi hariç tut (normal gözetmenler için)
        if (instructor.id === exam.ogretimUyesiId) {
          return false;
        }

        // Günlük maksimum kontrolü (4 sınav)
        const gunlukYuk =
          gozetmenGunlukYukleri[instructor.id]?.[examDate] ?? 0;
        if (gunlukYuk >= 4) {
          return false;
        }

        // Müsait değil kayıtları kontrol et
        const kisiMusaitDegil = unavailabilities.filter(
          (u) => u.ogretimUyesiId === instructor.id,
        );
        const engel = kisiMusaitDegil.some((kayit) => {
          const kayitBaslangic = DateTime.fromJSDate(kayit.baslangic, {
            zone: timezone,
          });
          const kayitBitis = DateTime.fromJSDate(kayit.bitis, {
            zone: timezone,
          });
          const kayitTarih = kayitBaslangic.toISODate();
          return (
            kayitTarih === examDate &&
            durationsOverlap(examStart, examEnd, kayitBaslangic, kayitBitis)
          );
        });
        if (engel) {
          return false;
        }

        // Mevcut sınav çakışmaları kontrol et (seçilen sınavlar zaten existingAssignments'ta yok)
        const ilgiliSinavlar = existingAssignments.filter(
          (a) =>
            a.ogretimUyesiId === instructor.id &&
            a.sinav.tarih === examDate &&
            a.sinav.baslangic &&
            a.sinav.bitis,
        );
        const sinavCakisma = ilgiliSinavlar.some((a) => {
          const sinavBaslangic = combineDateAndTime(
            a.sinav.tarih!,
            a.sinav.baslangic!,
            timezone,
          );
          const sinavBitis = combineDateAndTime(
            a.sinav.tarih!,
            a.sinav.bitis!,
            timezone,
          );
          return durationsOverlap(examStart, examEnd, sinavBaslangic, sinavBitis);
        });
        if (sinavCakisma) {
          return false;
        }

        // Aynı döngüde işlenen diğer sınavlarla çakışma kontrolü
        const sessionConflict = sessionAssignments.some((sa) => {
          return (
            sa.instructorId === instructor.id &&
            sa.examDate === examDate &&
            durationsOverlap(examStart, examEnd, sa.examStart, sa.examEnd)
          );
        });
        if (sessionConflict) {
          return false;
        }

        return true;
      });

      // Yüklerine göre sırala (önce günlük yük, sonra toplam yük)
      musaitGozetmenler.sort((a, b) => {
        const aGunlukYuk = gozetmenGunlukYukleri[a.id]?.[examDate] ?? 0;
        const bGunlukYuk = gozetmenGunlukYukleri[b.id]?.[examDate] ?? 0;

        // Önce günlük yüke göre sırala
        if (aGunlukYuk !== bGunlukYuk) {
          return aGunlukYuk - bGunlukYuk;
        }

        // Günlük yükler eşitse, toplam yüke göre sırala
        const aToplamYuk = gozetmenToplamYukleri[a.id] ?? 0;
        const bToplamYuk = gozetmenToplamYukleri[b.id] ?? 0;
        return aToplamYuk - bToplamYuk;
      });

      // Gözetmenleri seç ve ata
      const secilenGozetmenler: Array<{ instructor: Instructor; rol: 'birincil' | 'ikincil' }> = [];

      // Eğer sorumlu hoca gözetmen olarak atanacaksa, onu baş gözetmen olarak ekle
      if (sorumluHocaGözetmenOlsun && sorumluHoca && sorumluHocaMusait) {
        secilenGozetmenler.push({
          instructor: sorumluHoca,
          rol: 'birincil',
        });
      }

      // Kalan gözetmen sayısını hesapla
      const kalanGozetmenSayisi = gerekliGozetmenSayisi - secilenGozetmenler.length;

      // Normal gözetmenleri seç
      if (kalanGozetmenSayisi > 0) {
        const secilenNormalGozetmenler = musaitGozetmenler.slice(0, kalanGozetmenSayisi);

        if (secilenNormalGozetmenler.length < kalanGozetmenSayisi) {
          const sebep = sorumluHocaGözetmenOlsun && sorumluHoca && !sorumluHocaMusait
            ? `Sorumlu hoca müsait olmadığı için yeterli gözetmen bulunamadı. Gerekli: ${gerekliGozetmenSayisi}, Bulunan: ${secilenGozetmenler.length + secilenNormalGozetmenler.length}`
            : `Yeterli müsait gözetmen bulunamadı. Gerekli: ${gerekliGozetmenSayisi}, Bulunan: ${secilenGozetmenler.length + secilenNormalGozetmenler.length}`;

          atanamayanlar.push({
            sinavId: exam.id,
            sinavKod: exam.ders?.kod ?? 'Bilinmeyen',
            sebep,
          });
          continue;
        }

        // Normal gözetmenleri ekle (sorumlu hoca varsa ikincil, yoksa birincil başlar)
        secilenNormalGozetmenler.forEach((instructor, index) => {
          secilenGozetmenler.push({
            instructor,
            rol: secilenGozetmenler.length === 0 && index === 0 ? 'birincil' : 'ikincil',
          });
        });
      }

      // Gözetmenleri ata
      const gozetmenEntities = secilenGozetmenler.map((item) =>
        this.examInvigilatorRepository.create({
          sinav: exam,
          sinavId: exam.id,
          gozetmen: item.instructor,
          ogretimUyesiId: item.instructor.id,
          rol: item.rol,
        }),
      );

      await this.examInvigilatorRepository.save(gozetmenEntities);

      // Yükleri güncelle ve session assignments'a ekle
      for (const item of secilenGozetmenler) {
        const instructor = item.instructor;
        if (!gozetmenGunlukYukleri[instructor.id]) {
          gozetmenGunlukYukleri[instructor.id] = {};
        }
        if (!gozetmenGunlukYukleri[instructor.id][examDate]) {
          gozetmenGunlukYukleri[instructor.id][examDate] = 0;
        }
        gozetmenGunlukYukleri[instructor.id][examDate]++;
        gozetmenToplamYukleri[instructor.id] = (gozetmenToplamYukleri[instructor.id] ?? 0) + 1;

        // Session assignments'a ekle (çakışma kontrolü için)
        sessionAssignments.push({
          examId: exam.id,
          examDate,
          examStart,
          examEnd,
          instructorId: instructor.id,
        });
      }

      // Gözetmenleri dersliklere dağıt (birden fazla derslik varsa)
      const derslikler = exam.derslikler?.map((er) => ({
        id: er.derslikId,
        ad: er.derslik?.ad ?? 'Bilinmeyen',
      })) ?? (exam.derslikId ? [{ id: exam.derslikId, ad: exam.derslik?.ad ?? 'Bilinmeyen' }] : []);

      const gozetmenlerDetayli = secilenGozetmenler.map((item, index) => {
        // Birden fazla derslik varsa, gözetmenleri dersliklere dağıt
        let derslikAdi = '—';
        if (derslikler.length > 0) {
          if (derslikler.length === 1) {
            derslikAdi = derslikler[0].ad;
          } else {
            // Gözetmenleri dersliklere eşit olarak dağıt
            const derslikIndex = index % derslikler.length;
            derslikAdi = derslikler[derslikIndex].ad;
          }
        }

        return {
          id: item.instructor.id,
          ad: item.instructor.ad,
          rol: item.rol,
          derslik: derslikAdi,
        };
      });

      atananlar.push({
        sinavId: exam.id,
        sinavKod: exam.ders?.kod ?? 'Bilinmeyen',
        gozetmenSayisi: secilenGozetmenler.length,
        gozetmenler: gozetmenlerDetayli,
      });
    }

    // Gözetmen yüklerini formatla
    const gozetmenYukleriFormatted: Record<
      string,
      { ad: string; toplamYuk: number; gunlukYukler: Record<string, number> }
    > = {};

    for (const instructor of allInstructors) {
      const toplamYuk = Object.values(
        gozetmenGunlukYukleri[instructor.id] ?? {},
      ).reduce((sum, count) => sum + count, 0);

      gozetmenYukleriFormatted[instructor.id] = {
        ad: instructor.ad,
        toplamYuk,
        gunlukYukler: gozetmenGunlukYukleri[instructor.id] ?? {},
      };
    }

    return {
      mesaj: `${atananlar.length} sınav için gözetmen atandı. ${atanamayanlar.length} sınav için atama yapılamadı.`,
      atananlar,
      atanamayanlar,
      gozetmenYukleri: gozetmenYukleriFormatted,
    };
  }
}

