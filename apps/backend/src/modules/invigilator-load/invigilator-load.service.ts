import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { DateTime } from 'luxon';
import { ExamInvigilator } from '../../database/entities/exam-invigilator.entity';
import { Instructor } from '../../database/entities/instructor.entity';
import { InvigilatorLoadQueryDto } from './dto/invigilator-load-query.dto';
import {
  DEFAULT_TIMEZONE,
  durationsOverlap,
} from '../../common/utils/date-time';
import { EnvConfig } from '../../config/env.validation';

interface AssignmentWithMeta extends ExamInvigilator {
  _baslangic: DateTime;
  _bitis: DateTime;
  _sureDakika: number;
}

@Injectable()
export class InvigilatorLoadService {
  constructor(
    @InjectRepository(ExamInvigilator)
    private readonly invigilatorRepository: Repository<ExamInvigilator>,
    @InjectRepository(Instructor)
    private readonly instructorRepository: Repository<Instructor>,
    private readonly configService: ConfigService<EnvConfig, true>,
  ) {}

  async listLoads(query: InvigilatorLoadQueryDto) {
    const assignments = await this.fetchAssignments(query);

    const map = new Map<
      string,
      {
        ogretimUyesiId: string;
        ad: string;
        email: string;
        bolum: string;
        fakulte: string;
        toplamDakika: number;
        sinavSayisi: number;
      }
    >();

    for (const assg of assignments) {
      const key = assg.gozetmen.id;
      if (!map.has(key)) {
        map.set(key, {
          ogretimUyesiId: assg.gozetmen.id,
          ad: assg.gozetmen.ad,
          email: assg.gozetmen.email,
          bolum: assg.gozetmen.bolum?.ad ?? '',
          fakulte: assg.gozetmen.bolum?.fakulte?.ad ?? '',
          toplamDakika: 0,
          sinavSayisi: 0,
        });
      }
      const item = map.get(key)!;
      item.toplamDakika += assg._sureDakika;
      item.sinavSayisi += 1;
    }

    const liste = Array.from(map.values())
      .map((item) => ({
        ...item,
        toplamSaat: Number((item.toplamDakika / 60).toFixed(2)),
      }))
      .sort((a, b) => b.toplamDakika - a.toplamDakika);

    return {
      mesaj: 'Gözetmen yükleri listelendi.',
      veriler: liste,
    };
  }

  async detail(instructorId: string, query: InvigilatorLoadQueryDto) {
    const instructor = await this.instructorRepository.findOne({
      where: { id: instructorId },
      relations: ['bolum', 'bolum.fakulte'],
    });
    if (!instructor) {
      throw new NotFoundException('Öğretim üyesi bulunamadı.');
    }

    const assignments = await this.fetchAssignments(query);
    const filtered = assignments.filter(
      (assg) => assg.gozetmen.id === instructorId,
    );

    const toplamDakika = filtered.reduce(
      (sum, assg) => sum + assg._sureDakika,
      0,
    );
    const zamanDilimi =
      this.configService.get('TIMEZONE', { infer: true }) ?? DEFAULT_TIMEZONE;

    const cakismalar: string[] = [];
    for (let i = 0; i < filtered.length; i += 1) {
      for (let j = i + 1; j < filtered.length; j += 1) {
        if (
          durationsOverlap(
            filtered[i]._baslangic,
            filtered[i]._bitis,
            filtered[j]._baslangic,
            filtered[j]._bitis,
          )
        ) {
          cakismalar.push(
            `${filtered[i].sinav.ders?.kod ?? ''} ${filtered[i].sinav.baslangic} - ${filtered[j].sinav.ders?.kod ?? ''} ${filtered[j].sinav.baslangic}`,
          );
        }
      }
    }

    return {
      ogretimUyesi: instructor,
      toplamDakika,
      toplamSaat: Number((toplamDakika / 60).toFixed(2)),
      sinavSayisi: filtered.length,
      cakismalar,
      zamanDilimi,
      sinavlar: filtered.map((assg) => {
        // Derslik bilgisini al (yeni derslikler array'i veya eski derslik)
        const derslikler = assg.sinav.derslikler?.map((er) => er.derslik?.ad).filter(Boolean) ?? [];
        const derslikAdi = derslikler.length > 0 
          ? derslikler.join(', ') 
          : (assg.sinav.derslik?.ad ?? '—');
        
        return {
          sinavId: assg.sinav.id,
          tarih: assg.sinav.tarih,
          baslangic: assg.sinav.baslangic,
          bitis: assg.sinav.bitis,
          ders: assg.sinav.ders?.ad,
          dersKod: assg.sinav.ders?.kod,
          bolum: assg.sinav.ders?.bolum?.ad,
          derslik: derslikAdi,
          sureDakika: assg._sureDakika,
          gozetmenRol: assg.rol,
          ortakGrupEtiketi: assg.sinav.ortakGrup
            ? `${assg.sinav.ortakGrup.ad}`
            : undefined,
        };
      }),
    };
  }

  private async fetchAssignments(
    query: InvigilatorLoadQueryDto,
  ): Promise<AssignmentWithMeta[]> {
    const { fakulteId, bolumId, donem, baslangicTarihi, bitisTarihi } = query;

    const timezone =
      this.configService.get('TIMEZONE', { infer: true }) ?? DEFAULT_TIMEZONE;

    const assignments = await this.invigilatorRepository
      .createQueryBuilder('gorev')
      .leftJoinAndSelect('gorev.sinav', 'sinav')
      .leftJoinAndSelect('sinav.ders', 'ders')
      .leftJoinAndSelect('ders.bolum', 'bolum')
      .leftJoinAndSelect('bolum.fakulte', 'fakulte')
      .leftJoinAndSelect('sinav.derslik', 'derslik') // Deprecated: kept for backward compatibility
      .leftJoinAndSelect('sinav.derslikler', 'derslikler')
      .leftJoinAndSelect('derslikler.derslik', 'dersliklerDerslik')
      .leftJoinAndSelect('gorev.gozetmen', 'gozetmen')
      .leftJoinAndSelect('sinav.ortakGrup', 'ortakGrup')
      .where('sinav.tur = :tur', { tur: 'sinav' })
      .andWhere('sinav.tarih IS NOT NULL')
      .andWhere('sinav.baslangic IS NOT NULL')
      .andWhere('sinav.bitis IS NOT NULL')
      .andWhere('sinav.durum != :durum', { durum: 'planlanmadi' })
      .getMany();

    const unique = new Map<string, AssignmentWithMeta>();
    for (const assg of assignments) {
      if (!assg.sinav.tarih || !assg.sinav.baslangic || !assg.sinav.bitis) {
        continue;
      }
      if (donem && assg.sinav.donem !== donem) continue;
      if (fakulteId && assg.sinav.ders?.bolum?.fakulteId !== fakulteId)
        continue;
      if (bolumId && assg.sinav.ders?.bolumId !== bolumId) continue;

      const baslangic = DateTime.fromISO(
        `${assg.sinav.tarih}T${assg.sinav.baslangic}`,
        { zone: timezone },
      );
      const bitis = DateTime.fromISO(
        `${assg.sinav.tarih}T${assg.sinav.bitis}`,
        {
          zone: timezone,
        },
      );
      if (!baslangic.isValid || !bitis.isValid || bitis <= baslangic) {
        continue;
      }

      if (baslangicTarihi) {
        const filterStart = DateTime.fromISO(baslangicTarihi, {
          zone: timezone,
        });
        if (bitis < filterStart) continue;
      }
      if (bitisTarihi) {
        const filterEnd = DateTime.fromISO(bitisTarihi, { zone: timezone });
        if (baslangic > filterEnd) continue;
      }

      const examKey = assg.sinav.ortakGrupId
        ? assg.sinav.ortakGrupId
        : `${assg.sinav.dersId ?? ''}-${assg.sinav.tarih}-${assg.sinav.baslangic}`;
      const uniqueKey = `${assg.gozetmen.id}-${examKey}`;
      if (unique.has(uniqueKey)) {
        continue;
      }

      const sureDakika = bitis.diff(baslangic, 'minutes').minutes;
      unique.set(
        uniqueKey,
        Object.assign(assg, {
          _baslangic: baslangic,
          _bitis: bitis,
          _sureDakika: sureDakika,
        }),
      );
    }

    return Array.from(unique.values());
  }
}
