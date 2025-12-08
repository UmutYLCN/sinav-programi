import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ImportRoomsDto } from './dto/import-rooms.dto';
import { Room } from '../../database/entities/room.entity';
import { RoomQueryDto } from './dto/room-query.dto';
import { paginate } from '../../common/utils/paginate';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async create(createRoomDto: CreateRoomDto) {
    const ayniAd = await this.roomRepository.findOne({
      where: {
        ad: createRoomDto.ad,
      },
    });
    if (ayniAd) {
      throw new ConflictException(
        'Aynı ad ile kayıtlı başka bir derslik var.',
      );
    }

    const derslik = this.roomRepository.create(createRoomDto);
    const kayit = await this.roomRepository.save(derslik);
    return {
      mesaj: 'Derslik başarıyla eklendi.',
      veri: kayit,
    };
  }

  async findAll(query: RoomQueryDto) {
    const {
      page = 1,
      limit = 25,
      search,
      tip,
      minKapasite,
      maxKapasite,
      bina,
    } = query;

    const qb = this.roomRepository
      .createQueryBuilder('derslik')
      .loadRelationCountAndMap('derslik.sinavSayisi', 'derslik.sinavlar');

    if (tip) {
      qb.andWhere('derslik.tip = :tip', { tip });
    }

    if (minKapasite !== undefined) {
      qb.andWhere('derslik.kapasite >= :minKapasite', { minKapasite });
    }

    if (maxKapasite !== undefined) {
      qb.andWhere('derslik.kapasite <= :maxKapasite', { maxKapasite });
    }

    if (bina) {
      qb.andWhere('LOWER(derslik.bina) LIKE :bina', {
        bina: `%${bina.toLowerCase()}%`,
      });
    }

    if (search) {
      qb.andWhere(
        '(LOWER(derslik.ad) LIKE :aranan OR LOWER(derslik.bina) LIKE :aranan)',
        { aranan: `%${search.toLowerCase()}%` },
      );
    }

    qb.orderBy('derslik.ad', 'ASC');

    const sonuc = await paginate<Room>(qb, page, limit);
    return {
      ...sonuc,
      mesaj: 'Derslikler listelendi.',
    };
  }

  async findOne(id: string) {
    const derslik = await this.roomRepository.findOne({
      where: { id },
      relations: ['sinavlar', 'sinavlar.ders'],
    });
    if (!derslik) {
      throw new NotFoundException('Derslik bulunamadı.');
    }
    return derslik;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto) {
    const derslik = await this.roomRepository.findOne({
      where: { id },
    });
    if (!derslik) {
      throw new NotFoundException('Derslik bulunamadı.');
    }

    if (updateRoomDto.ad) {
      const ayniAd = await this.roomRepository.findOne({
        where: {
          ad: updateRoomDto.ad,
        },
      });
      if (ayniAd && ayniAd.id !== derslik.id) {
        throw new ConflictException(
          'Aynı ad ile kayıtlı başka bir derslik var.',
        );
      }
    }

    Object.assign(derslik, updateRoomDto);
    const guncel = await this.roomRepository.save(derslik);
    return {
      mesaj: 'Derslik güncellendi.',
      veri: guncel,
    };
  }

  async remove(id: string) {
    const derslik = await this.roomRepository.findOne({
      where: { id },
    });
    if (!derslik) {
      throw new NotFoundException('Derslik bulunamadı.');
    }
    await this.roomRepository.remove(derslik);
    return { mesaj: 'Derslik silindi.' };
  }

  async import(dto: ImportRoomsDto) {
    const olusturulan = [];
    const uyarilar = [];
    
    console.log('🔍 BACKEND IMPORT - Toplam kayıt sayısı:', dto.kayitlar.length);
    console.log('🔍 BACKEND IMPORT - İlk kayıt:', JSON.stringify(dto.kayitlar[0], null, 2));
    
    for (const kayit of dto.kayitlar) {
      try {
        console.log(`🔍 BACKEND IMPORT - İşleniyor: ${kayit.ad}, tip: ${kayit.tip}, tip type: ${typeof kayit.tip}`);
        
        // Tip kontrolü
        const gecerliTipler = ['amfi', 'laboratuvar', 'sinif', 'toplanti', 'diger'];
        if (!gecerliTipler.includes(kayit.tip)) {
          uyarilar.push(`Derslik "${kayit.ad}" için geçersiz tip: "${kayit.tip}". Geçerli tipler: ${gecerliTipler.join(', ')}`);
          continue;
        }
        
        const mevcut = await this.roomRepository.findOne({
          where: { ad: kayit.ad },
        });
        if (mevcut) {
          uyarilar.push(`Derslik "${kayit.ad}" zaten mevcut, atlandı.`);
          continue;
        }
        
        const yeni = this.roomRepository.create(kayit);
        const kaydedilen = await this.roomRepository.save(yeni);
        olusturulan.push(kaydedilen);
        console.log(`🔍 BACKEND IMPORT - Başarılı: ${kayit.ad}`);
      } catch (error) {
        const mesaj = error instanceof Error ? error.message : String(error);
        console.error(`🔍 BACKEND IMPORT - Hata: ${kayit.ad}`, error);
        uyarilar.push(`Derslik "${kayit.ad}" oluşturulamadı: ${mesaj}`);
      }
    }
    
    console.log(`🔍 BACKEND IMPORT - Sonuç: ${olusturulan.length} başarılı, ${uyarilar.length} uyarı`);
    
    return {
      mesaj: `${olusturulan.length} derslik başarıyla içe aktarıldı.`,
      veri: olusturulan,
      uyarilar,
    };
  }
}
