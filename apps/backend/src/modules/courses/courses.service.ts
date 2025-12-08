import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ImportCoursesDto } from './dto/import-courses.dto';
import { Course } from '../../database/entities/course.entity';
import { Department } from '../../database/entities/department.entity';
import { CourseQueryDto } from './dto/course-query.dto';
import { paginate } from '../../common/utils/paginate';
import type { Donem } from '@sinav/shared';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async create(createCourseDto: CreateCourseDto) {
    console.log('🔍 BACKEND - create çağrıldı');
    console.log('🔍 BACKEND - Gelen DTO:', JSON.stringify(createCourseDto, null, 2));
    console.log('🔍 BACKEND - DTO ogrenciKapasitesi:', createCourseDto.ogrenciKapasitesi);
    console.log('🔍 BACKEND - DTO ogrenciKapasitesi type:', typeof createCourseDto.ogrenciKapasitesi);
    console.log('🔍 BACKEND - DTO ogrenciKapasitesi undefined?', createCourseDto.ogrenciKapasitesi === undefined);
    console.log('🔍 BACKEND - DTO ogrenciKapasitesi null?', createCourseDto.ogrenciKapasitesi === null);

    const bolum = await this.departmentRepository.findOne({
      where: { id: createCourseDto.bolumId },
    });
    if (!bolum) {
      throw new NotFoundException('Bölüm bulunamadı.');
    }

    const mevcut = await this.courseRepository.findOne({
      where: { kod: createCourseDto.kod, bolumId: bolum.id },
    });
    if (mevcut) {
      throw new ConflictException(
        'Bu bölümde aynı kod ile kayıtlı ders zaten mevcut.',
      );
    }

    // ogrenciKapasitesi'ni açıkça kontrol et ve ekle
    const courseData: any = {
      kod: createCourseDto.kod,
      ad: createCourseDto.ad,
      sinif: createCourseDto.sinif,
      donem: createCourseDto.donem as Donem,
      bolum,
    };
    
    console.log('🔍 BACKEND - İlk courseData:', JSON.stringify(courseData, null, 2));
    
    // Kredi varsa ekle
    if (createCourseDto.kredi !== undefined && createCourseDto.kredi !== null) {
      courseData.kredi = createCourseDto.kredi;
      console.log('✅ BACKEND - Kredi eklendi:', createCourseDto.kredi);
    } else {
      console.log('❌ BACKEND - Kredi eklenmedi:', { kredi: createCourseDto.kredi });
    }
    
    // Öğrenci kapasitesi varsa ekle
    console.log('🔍 BACKEND - Öğrenci kapasitesi kontrolü:', {
      ogrenciKapasitesi: createCourseDto.ogrenciKapasitesi,
      undefined: createCourseDto.ogrenciKapasitesi === undefined,
      null: createCourseDto.ogrenciKapasitesi === null,
    });

    if (createCourseDto.ogrenciKapasitesi !== undefined && createCourseDto.ogrenciKapasitesi !== null) {
      courseData.ogrenciKapasitesi = createCourseDto.ogrenciKapasitesi;
      console.log('✅ BACKEND - Öğrenci kapasitesi eklendi:', createCourseDto.ogrenciKapasitesi);
    } else {
      console.log('❌ BACKEND - Öğrenci kapasitesi eklenmedi:', {
        ogrenciKapasitesi: createCourseDto.ogrenciKapasitesi,
        undefined: createCourseDto.ogrenciKapasitesi === undefined,
        null: createCourseDto.ogrenciKapasitesi === null,
      });
    }
    
    console.log('🔍 BACKEND - Final courseData:', JSON.stringify(courseData, null, 2));
    console.log('🔍 BACKEND - Final courseData.ogrenciKapasitesi:', courseData.ogrenciKapasitesi);
    
    const yeni = this.courseRepository.create(courseData);
    console.log('🔍 BACKEND - Repository.create sonrası yeni entity:', JSON.stringify(yeni, null, 2));
    
    const kayit = await this.courseRepository.save(yeni);
    console.log('🔍 BACKEND - Repository.save sonrası kayıt:', JSON.stringify(kayit, null, 2));
    console.log('🔍 BACKEND - Kayıt ogrenciKapasitesi:', (kayit as any).ogrenciKapasitesi);
    
    return {
      mesaj: 'Ders başarıyla oluşturuldu.',
      veri: kayit,
    };
  }

  async findAll(query: CourseQueryDto) {
    const {
      page = 1,
      limit = 25,
      search,
      bolumId,
      fakulteId,
      donem,
      sinif,
    } = query;

    const qb = this.courseRepository
      .createQueryBuilder('ders')
      .leftJoinAndSelect('ders.bolum', 'bolum')
      .leftJoinAndSelect('bolum.fakulte', 'fakulte')
      .loadRelationCountAndMap('ders.sinavSayisi', 'ders.sinavlar');

    if (bolumId) {
      qb.andWhere('ders.bolumId = :bolumId', { bolumId });
    }

    if (fakulteId) {
      qb.andWhere('bolum.fakulteId = :fakulteId', { fakulteId });
    }

    if (donem) {
      qb.andWhere('ders.donem = :donem', { donem });
    }

    if (sinif) {
      qb.andWhere('ders.sinif = :sinif', { sinif });
    }

    if (search) {
      qb.andWhere(
        '(LOWER(ders.ad) LIKE :aranan OR LOWER(ders.kod) LIKE :aranan)',
        { aranan: `%${search.toLowerCase()}%` },
      );
    }

    qb.orderBy('ders.kod', 'ASC');

    const sonuc = await paginate<Course>(qb, page, limit);
    return {
      ...sonuc,
      mesaj: 'Dersler listelendi.',
    };
  }

  async findOne(id: string) {
    const ders = await this.courseRepository.findOne({
      where: { id },
      relations: ['bolum', 'bolum.fakulte', 'sinavlar'],
      order: {
        sinavlar: { tarih: 'ASC' },
      },
    });

    if (!ders) {
      throw new NotFoundException('Ders bulunamadı.');
    }
    return ders;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    console.log('🔍 BACKEND - update çağrıldı');
    console.log('🔍 BACKEND - ID:', id);
    console.log('🔍 BACKEND - Gelen DTO:', JSON.stringify(updateCourseDto, null, 2));
    console.log('🔍 BACKEND - DTO ogrenciKapasitesi:', updateCourseDto.ogrenciKapasitesi);
    console.log('🔍 BACKEND - DTO ogrenciKapasitesi type:', typeof updateCourseDto.ogrenciKapasitesi);
    console.log('🔍 BACKEND - DTO ogrenciKapasitesi undefined?', updateCourseDto.ogrenciKapasitesi === undefined);
    console.log('🔍 BACKEND - DTO ogrenciKapasitesi null?', updateCourseDto.ogrenciKapasitesi === null);

    const ders = await this.courseRepository.findOne({ where: { id } });
    if (!ders) {
      throw new NotFoundException('Ders bulunamadı.');
    }

    console.log('🔍 BACKEND - Mevcut ders ogrenciKapasitesi:', ders.ogrenciKapasitesi);

    if (updateCourseDto.bolumId) {
      const bolum = await this.departmentRepository.findOne({
        where: { id: updateCourseDto.bolumId },
      });
      if (!bolum) {
        throw new NotFoundException('Bölüm bulunamadı.');
      }
      ders.bolum = bolum;
      ders.bolumId = bolum.id;
    }

    if (updateCourseDto.kod) {
      const kontrol = await this.courseRepository.findOne({
        where: {
          kod: updateCourseDto.kod,
          bolumId: ders.bolumId,
        },
      });
      if (kontrol && kontrol.id !== ders.id) {
        throw new ConflictException(
          'Bu bölümde aynı kod ile kayıtlı ders zaten mevcut.',
        );
      }
    }

    // Tüm alanları güncelle
    if (updateCourseDto.kod !== undefined) ders.kod = updateCourseDto.kod;
    if (updateCourseDto.ad !== undefined) ders.ad = updateCourseDto.ad;
    if (updateCourseDto.sinif !== undefined) ders.sinif = updateCourseDto.sinif;
    if (updateCourseDto.donem !== undefined) ders.donem = updateCourseDto.donem;
    
    if (updateCourseDto.kredi !== undefined) {
      ders.kredi = updateCourseDto.kredi > 0 ? updateCourseDto.kredi : null;
      console.log('✅ BACKEND - Kredi güncellendi:', ders.kredi);
    }
    
    console.log('🔍 BACKEND - Öğrenci kapasitesi güncelleme kontrolü:', {
      ogrenciKapasitesi: updateCourseDto.ogrenciKapasitesi,
      undefined: updateCourseDto.ogrenciKapasitesi === undefined,
      null: updateCourseDto.ogrenciKapasitesi === null,
      greaterThanZero: updateCourseDto.ogrenciKapasitesi !== undefined && updateCourseDto.ogrenciKapasitesi !== null && updateCourseDto.ogrenciKapasitesi > 0,
    });

    if (updateCourseDto.ogrenciKapasitesi !== undefined) {
      // Pozitif sayı ise kaydet, değilse null yap
      ders.ogrenciKapasitesi = updateCourseDto.ogrenciKapasitesi !== null && updateCourseDto.ogrenciKapasitesi > 0 
        ? updateCourseDto.ogrenciKapasitesi 
        : null;
      console.log('✅ BACKEND - Öğrenci kapasitesi güncellendi:', ders.ogrenciKapasitesi);
    } else {
      console.log('❌ BACKEND - Öğrenci kapasitesi undefined, güncellenmedi');
    }
    
    console.log('🔍 BACKEND - Güncelleme öncesi ders.ogrenciKapasitesi:', ders.ogrenciKapasitesi);
    
    const guncel = await this.courseRepository.save(ders);
    console.log('🔍 BACKEND - Güncelleme sonrası kayıt:', JSON.stringify(guncel, null, 2));
    console.log('🔍 BACKEND - Güncelleme sonrası kayıt ogrenciKapasitesi:', guncel.ogrenciKapasitesi);
    
    return {
      mesaj: 'Ders güncellendi.',
      veri: guncel,
    };
  }

  async remove(id: string) {
    const ders = await this.courseRepository.findOne({ where: { id } });
    if (!ders) {
      throw new NotFoundException('Ders bulunamadı.');
    }
    await this.courseRepository.remove(ders);
    return { mesaj: 'Ders silindi.' };
  }

  async import(dto: ImportCoursesDto) {
    console.log('🔍 BACKEND - import çağrıldı');
    console.log('🔍 BACKEND - Gelen DTO:', JSON.stringify(dto, null, 2));
    console.log('🔍 BACKEND - DTO kayitlar:', dto.kayitlar);
    console.log('🔍 BACKEND - DTO kayitlar length:', dto.kayitlar?.length);
    if (dto.kayitlar && dto.kayitlar.length > 0) {
      console.log('🔍 BACKEND - İlk kayıt:', JSON.stringify(dto.kayitlar[0], null, 2));
      console.log('🔍 BACKEND - İlk kayıt keys:', Object.keys(dto.kayitlar[0]));
      console.log('🔍 BACKEND - İlk kayıt kod:', dto.kayitlar[0].kod);
      console.log('🔍 BACKEND - İlk kayıt ad:', dto.kayitlar[0].ad);
      console.log('🔍 BACKEND - İlk kayıt bolumKod:', dto.kayitlar[0].bolumKod);
    }
    
    const olusturulan = [];
    const uyarilar = [];
    
    for (const kayit of dto.kayitlar) {
      try {
        console.log('🔍 BACKEND - İşlenen kayıt:', JSON.stringify(kayit, null, 2));
        console.log('🔍 BACKEND - Kayıt kod:', kayit.kod);
        console.log('🔍 BACKEND - Kayıt ad:', kayit.ad);
        console.log('🔍 BACKEND - Kayıt bolumKod:', kayit.bolumKod);
        
        let bolum = null;

        // Önce bolumId varsa onu kullan (eski format)
        if (kayit.bolumId) {
          bolum = await this.departmentRepository.findOne({
            where: { id: kayit.bolumId },
          });
        }
        
        // BolumId yoksa bolumKod ile ara
        if (!bolum && kayit.bolumKod) {
          console.log('🔍 BACKEND - bolumKod ile arama yapılıyor:', kayit.bolumKod);
          bolum = await this.departmentRepository.findOne({
            where: { kod: kayit.bolumKod },
          });
          console.log('🔍 BACKEND - bolumKod ile bulunan bölüm:', bolum ? JSON.stringify(bolum) : 'bulunamadı');
        }
        
        // Hala bulunamadıysa bolumAd ile ara
        if (!bolum && kayit.bolumAd) {
          console.log('🔍 BACKEND - bolumAd ile arama yapılıyor:', kayit.bolumAd);
          bolum = await this.departmentRepository.findOne({
            where: { ad: kayit.bolumAd },
          });
          console.log('🔍 BACKEND - bolumAd ile bulunan bölüm:', bolum ? JSON.stringify(bolum) : 'bulunamadı');
        }

        if (!bolum) {
          const bolumBilgisi = kayit.bolumKod || kayit.bolumAd || kayit.bolumId || 'bilinmiyor';
          const dersKod = kayit.kod || 'undefined';
          console.error('🔍 BACKEND ERROR - Bölüm bulunamadı!', {
            dersKod,
            bolumKod: kayit.bolumKod,
            bolumAd: kayit.bolumAd,
            bolumId: kayit.bolumId,
            kayit: JSON.stringify(kayit, null, 2)
          });
          uyarilar.push(`Ders "${dersKod}" için bölüm bulunamadı (${bolumBilgisi}), atlandı.`);
          continue;
        }
        
        console.log('🔍 BACKEND - Bölüm bulundu:', JSON.stringify(bolum, null, 2));

        const mevcut = await this.courseRepository.findOne({
          where: { kod: kayit.kod, bolumId: bolum.id },
        });
        if (mevcut) {
          uyarilar.push(`Ders kod "${kayit.kod}" zaten mevcut, atlandı.`);
          continue;
        }
        
        // ogrenciKapasitesi'ni açıkça kontrol et ve ekle
        const courseData: any = {
          kod: kayit.kod,
          ad: kayit.ad,
          sinif: kayit.sinif,
          donem: kayit.donem as Donem,
          bolum,
        };
        
        // Kredi varsa ekle
        if (kayit.kredi !== undefined && kayit.kredi !== null) {
          courseData.kredi = kayit.kredi;
        }
        
        // Öğrenci kapasitesi varsa ekle
        if (kayit.ogrenciKapasitesi !== undefined && kayit.ogrenciKapasitesi !== null) {
          courseData.ogrenciKapasitesi = kayit.ogrenciKapasitesi;
        }
        
        const yeni = this.courseRepository.create(courseData);
        const kaydedilen = await this.courseRepository.save(yeni);
        olusturulan.push(kaydedilen);
      } catch (error) {
        const mesaj = error instanceof Error ? error.message : String(error);
        uyarilar.push(`Ders "${kayit.kod}" oluşturulamadı: ${mesaj}`);
      }
    }
    
    return {
      mesaj: `${olusturulan.length} ders başarıyla içe aktarıldı.`,
      veri: olusturulan,
      uyarilar,
    };
  }
}
