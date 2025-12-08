import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { ImportDepartmentsDto } from './dto/import-departments.dto';
import { Department } from '../../database/entities/department.entity';
import { Faculty } from '../../database/entities/faculty.entity';
import { DepartmentQueryDto } from './dto/department-query.dto';
import { paginate } from '../../common/utils/paginate';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    const fakulte = await this.facultyRepository.findOne({
      where: { id: createDepartmentDto.fakulteId },
    });
    if (!fakulte) {
      throw new NotFoundException('Fakülte bulunamadı.');
    }

    const ayniKod = await this.departmentRepository.findOne({
      where: {
        kod: createDepartmentDto.kod,
        fakulteId: createDepartmentDto.fakulteId,
      },
    });
    if (ayniKod) {
      throw new ConflictException(
        'Bu fakültede aynı kod ile kayıtlı başka bir bölüm var.',
      );
    }

    const yeni = this.departmentRepository.create({
      ...createDepartmentDto,
      fakulte,
    });
    const kayit = await this.departmentRepository.save(yeni);

    return {
      mesaj: 'Bölüm başarıyla oluşturuldu.',
      veri: kayit,
    };
  }

  async findAll(query: DepartmentQueryDto) {
    const { page = 1, limit = 25, search, fakulteId } = query;

    const qb = this.departmentRepository
      .createQueryBuilder('bolum')
      .leftJoinAndSelect('bolum.fakulte', 'fakulte')
      .leftJoin('bolum.dersler', 'ders')
      .addSelect([
        'ders.id',
        'ders.kod',
        'ders.ad',
        'ders.sinif',
        'ders.donem',
        'ders.kredi',
        'ders.bolumId',
        // ogrenci_kapasitesi kolonu veritabanında yoksa hata vermemesi için şimdilik yorum satırı
        // Veritabanına kolon eklendikten sonra bu satırı açın:
        // 'ders.ogrenciKapasitesi',
      ])
      .loadRelationCountAndMap('bolum.dersSayisi', 'bolum.dersler');

    if (fakulteId) {
      qb.where('bolum.fakulteId = :fakulteId', { fakulteId });
    }

    if (search) {
      qb.andWhere(
        '(LOWER(bolum.ad) LIKE :aranan OR LOWER(bolum.kod) LIKE :aranan)',
        { aranan: `%${search.toLowerCase()}%` },
      );
    }

    qb.orderBy('bolum.ad', 'ASC');

    const sonuc = await paginate<Department>(qb, page, limit);
    return {
      ...sonuc,
      mesaj: 'Bölümler başarıyla listelendi.',
    };
  }

  async findOne(id: string) {
    const bolum = await this.departmentRepository
      .createQueryBuilder('bolum')
      .leftJoinAndSelect('bolum.fakulte', 'fakulte')
      .leftJoin('bolum.dersler', 'ders')
      .addSelect([
        'ders.id',
        'ders.kod',
        'ders.ad',
        'ders.sinif',
        'ders.donem',
        'ders.kredi',
        'ders.bolumId',
        // ogrenci_kapasitesi kolonu veritabanında yoksa hata vermemesi için şimdilik yorum satırı
        // Veritabanına kolon eklendikten sonra bu satırı açın:
        // 'ders.ogrenciKapasitesi',
      ])
      .leftJoinAndSelect('bolum.ogretimUyeleri', 'ogretimUyesi')
      .where('bolum.id = :id', { id })
      .orderBy('ders.kod', 'ASC')
      .addOrderBy('ogretimUyesi.ad', 'ASC')
      .getOne();

    if (!bolum) {
      throw new NotFoundException('Bölüm bulunamadı.');
    }

    return bolum;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const bolum = await this.departmentRepository.findOne({ where: { id } });
    if (!bolum) {
      throw new NotFoundException('Bölüm bulunamadı.');
    }

    if (updateDepartmentDto.fakulteId) {
      const fakulte = await this.facultyRepository.findOne({
        where: { id: updateDepartmentDto.fakulteId },
      });
      if (!fakulte) {
        throw new NotFoundException('Fakülte bulunamadı.');
      }
      bolum.fakulte = fakulte;
      bolum.fakulteId = fakulte.id;
    }

    if (updateDepartmentDto.kod) {
      const ayniKod = await this.departmentRepository.findOne({
        where: {
          kod: updateDepartmentDto.kod,
          fakulteId: bolum.fakulteId,
        },
        withDeleted: false,
      });
      if (ayniKod && ayniKod.id !== bolum.id) {
        throw new ConflictException(
          'Bu fakültede aynı kod ile kayıtlı başka bir bölüm var.',
        );
      }
    }

    Object.assign(bolum, updateDepartmentDto);
    const guncel = await this.departmentRepository.save(bolum);
    return {
      mesaj: 'Bölüm bilgileri güncellendi.',
      veri: guncel,
    };
  }

  async remove(id: string) {
    const bolum = await this.departmentRepository.findOne({ 
      where: { id },
      relations: ['dersler', 'ogretimUyeleri'],
    });
    if (!bolum) {
      throw new NotFoundException('Bölüm bulunamadı.');
    }
    
    // Bölüm kullanılıyorsa silmeyi engelle
    const dersSayisi = bolum.dersler?.length || 0;
    const ogretimUyesiSayisi = bolum.ogretimUyeleri?.length || 0;
    
    if (dersSayisi > 0) {
      throw new BadRequestException(
        `Bu bölüm silinemez çünkü ${dersSayisi} ders bu bölüme ait. ` +
        `Önce dersleri silin veya başka bir bölüme taşıyın.`
      );
    }
    
    if (ogretimUyesiSayisi > 0) {
      throw new BadRequestException(
        `Bu bölüm silinemez çünkü ${ogretimUyesiSayisi} öğretim üyesi bu bölüme ait. ` +
        `Önce öğretim üyelerini başka bir bölüme taşıyın.`
      );
    }
    
    await this.departmentRepository.remove(bolum);
    return { mesaj: 'Bölüm silindi.' };
  }

  async import(dto: ImportDepartmentsDto) {
    console.log('Backend - Import DTO:', JSON.stringify(dto, null, 2));
    console.log('Backend - Import DTO kayitlar:', dto.kayitlar);
    console.log('Backend - Import DTO kayitlar length:', dto.kayitlar?.length);
    console.log('Backend - Import DTO kayitlar[0]:', dto.kayitlar?.[0]);
    
    const olusturulan = [];
    const uyarilar = [];
    
    for (const kayit of dto.kayitlar) {
      try {
        // Debug: Gelen kaydı kontrol et
        console.log('Backend - Gelen kayıt (raw):', kayit);
        console.log('Backend - Gelen kayıt (JSON):', JSON.stringify(kayit));
        console.log('Backend - Gelen kayıt type:', typeof kayit);
        console.log('Backend - Gelen kayıt keys:', Object.keys(kayit || {}));
        console.log('Backend - Gelen kayıt ad:', kayit?.ad);
        console.log('Backend - Gelen kayıt kod:', kayit?.kod);
        console.log('Backend - Gelen kayıt fakulteKod:', kayit?.fakulteKod);
        
        // Ad ve kod kontrolü - önce bunu yap
        if (!kayit || typeof kayit !== 'object') {
          uyarilar.push(`Bölüm kaydı geçersiz format, atlandı.`);
          continue;
        }
        
        // Tüm olası şekillerde ad ve kod'u bul
        let adValue = '';
        let kodValue = '';
        
        // Direkt erişim
        if (kayit.ad) adValue = String(kayit.ad).trim();
        if (kayit.kod) kodValue = String(kayit.kod).trim();
        
        // Eğer hala bulunamadıysa, tüm key'leri kontrol et
        if (!adValue || !kodValue) {
          const keys = Object.keys(kayit);
          for (const key of keys) {
            const lowerKey = key.toLowerCase();
            const value = String((kayit as any)[key] || '').trim();
            if (lowerKey === 'ad' && !adValue && value) {
              adValue = value;
            }
            if (lowerKey === 'kod' && !kodValue && value) {
              kodValue = value;
            }
          }
        }
        
        if (!adValue || !kodValue) {
          uyarilar.push(`Bölüm kaydı eksik bilgi içeriyor (ad: ${adValue || 'yok'}, kod: ${kodValue || 'yok'}), atlandı. Keys: ${Object.keys(kayit).join(', ')}`);
          continue;
        }
        
        // Değerleri kaydet
        const cleanKayit: any = {
          ad: adValue,
          kod: kodValue,
        };
        
        // Fakülte bilgilerini bul
        let fakulteKodValue = '';
        let fakulteAdValue = '';
        let fakulteIdValue = '';
        
        // Direkt erişim
        if (kayit.fakulteKod) fakulteKodValue = String(kayit.fakulteKod).trim();
        if (kayit.fakulteAd) fakulteAdValue = String(kayit.fakulteAd).trim();
        if (kayit.fakulteId) fakulteIdValue = String(kayit.fakulteId).trim();
        
        // Eğer hala bulunamadıysa, tüm key'leri kontrol et
        if (!fakulteKodValue) {
          const keys = Object.keys(kayit);
          for (const key of keys) {
            const lowerKey = key.toLowerCase();
            const value = String((kayit as any)[key] || '').trim();
            if ((lowerKey === 'fakultekod' || lowerKey === 'fakultekoc') && value) {
              fakulteKodValue = value;
              break;
            }
          }
        }
        
        let fakulte = null;

        // Önce fakulteId varsa onu kullan (eski format)
        if (fakulteIdValue) {
          fakulte = await this.facultyRepository.findOne({
            where: { id: fakulteIdValue },
          });
        }
        
        // FakulteId yoksa fakulteKod ile ara
        if (!fakulte && fakulteKodValue) {
          console.log(`Backend - Fakülte kod ile aranıyor: "${fakulteKodValue}"`);
          fakulte = await this.facultyRepository.findOne({
            where: { kod: fakulteKodValue },
          });
          console.log(`Backend - Fakülte bulundu mu?`, fakulte ? `Evet: ${fakulte.ad} (kod: ${fakulte.kod})` : 'Hayır');
          if (!fakulte) {
            // Tüm fakülteleri listele (debug için)
            const allFaculties = await this.facultyRepository.find();
            console.log(`Backend - Mevcut fakülteler:`, allFaculties.map(f => ({ id: f.id, ad: f.ad, kod: f.kod })));
          }
        }
        
        // Hala bulunamadıysa fakulteAd ile ara
        if (!fakulte && fakulteAdValue) {
          console.log(`Backend - Fakülte ad ile aranıyor: "${fakulteAdValue}"`);
          fakulte = await this.facultyRepository.findOne({
            where: { ad: fakulteAdValue },
          });
          console.log(`Backend - Fakülte bulundu mu?`, fakulte ? `Evet: ${fakulte.ad} (kod: ${fakulte.kod})` : 'Hayır');
        }

        if (!fakulte) {
          const fakulteBilgisi = fakulteKodValue || fakulteAdValue || fakulteIdValue || 'bilinmiyor';
          console.error(`Backend ERROR - Fakülte bulunamadı!`, {
            kayitKod: kodValue,
            fakulteKod: fakulteKodValue,
            fakulteAd: fakulteAdValue,
            fakulteId: fakulteIdValue
          });
          uyarilar.push(`Bölüm "${kodValue}" için fakülte bulunamadı (${fakulteBilgisi}), atlandı.`);
          continue;
        }

        const mevcut = await this.departmentRepository.findOne({
          where: { kod: kodValue, fakulteId: fakulte.id },
        });
        if (mevcut) {
          uyarilar.push(`Bölüm kod "${kodValue}" (${fakulte.ad}) zaten mevcut, atlandı.`);
          continue;
        }
        
        const yeni = this.departmentRepository.create({
          ad: adValue,
          kod: kodValue,
          fakulte,
          fakulteId: fakulte.id,
        });
        const kaydedilen = await this.departmentRepository.save(yeni);
        olusturulan.push(kaydedilen);
      } catch (error) {
        const mesaj = error instanceof Error ? error.message : String(error);
        uyarilar.push(`Bölüm "${kayit.kod}" oluşturulamadı: ${mesaj}`);
      }
    }
    
    return {
      mesaj: `${olusturulan.length} bölüm başarıyla içe aktarıldı.`,
      veri: olusturulan,
      uyarilar,
    };
  }
}
