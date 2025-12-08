import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { ImportFacultiesDto } from './dto/import-faculties.dto';
import { Faculty } from '../../database/entities/faculty.entity';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { paginate } from '../../common/utils/paginate';

@Injectable()
export class FacultiesService {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
  ) {}

  async create(createFacultyDto: CreateFacultyDto) {
    const mevcut = await this.facultyRepository.findOne({
      where: { kod: createFacultyDto.kod },
    });
    if (mevcut) {
      throw new ConflictException('Bu kod ile kayıtlı başka bir fakülte var.');
    }

    const yeni = this.facultyRepository.create(createFacultyDto);
    const kayit = await this.facultyRepository.save(yeni);
    return {
      mesaj: 'Fakülte başarıyla oluşturuldu.',
      veri: kayit,
    };
  }

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 25, search } = query;

    const qb = this.facultyRepository
      .createQueryBuilder('fakulte')
      .leftJoinAndSelect('fakulte.bolumler', 'bolum')
      .loadRelationCountAndMap('fakulte.bolumSayisi', 'fakulte.bolumler');

    if (search) {
      qb.where(
        'LOWER(fakulte.ad) LIKE :aranan OR LOWER(fakulte.kod) LIKE :aranan',
        {
          aranan: `%${search.toLowerCase()}%`,
        },
      );
    }

    qb.orderBy('fakulte.ad', 'ASC');

    const sonuc = await paginate<Faculty>(qb, page, limit);
    return {
      ...sonuc,
      mesaj: 'Fakülteler başarıyla listelendi.',
    };
  }

  async findOne(id: string) {
    const fakulte = await this.facultyRepository.findOne({
      where: { id },
      relations: ['bolumler'],
      order: { bolumler: { ad: 'ASC' } },
    });

    if (!fakulte) {
      throw new NotFoundException('Fakülte bulunamadı.');
    }

    return fakulte;
  }

  async update(id: string, updateFacultyDto: UpdateFacultyDto) {
    const fakulte = await this.facultyRepository.findOne({ where: { id } });
    if (!fakulte) {
      throw new NotFoundException('Fakülte bulunamadı.');
    }

    if (updateFacultyDto.kod && updateFacultyDto.kod !== fakulte.kod) {
      const kodKontrol = await this.facultyRepository.findOne({
        where: { kod: updateFacultyDto.kod },
      });
      if (kodKontrol) {
        throw new ConflictException(
          'Bu kod ile kayıtlı başka bir fakülte zaten mevcut.',
        );
      }
    }

    Object.assign(fakulte, updateFacultyDto);
    const guncel = await this.facultyRepository.save(fakulte);
    return {
      mesaj: 'Fakülte bilgileri güncellendi.',
      veri: guncel,
    };
  }

  async remove(id: string) {
    const fakulte = await this.facultyRepository.findOne({ where: { id } });
    if (!fakulte) {
      throw new NotFoundException('Fakülte bulunamadı.');
    }

    await this.facultyRepository.remove(fakulte);
    return {
      mesaj: 'Fakülte silindi.',
    };
  }

  async import(dto: ImportFacultiesDto) {
    const olusturulan = [];
    const uyarilar = [];
    
    for (const kayit of dto.kayitlar) {
      try {
        const mevcut = await this.facultyRepository.findOne({
          where: { kod: kayit.kod },
        });
        if (mevcut) {
          uyarilar.push(`Fakülte kod "${kayit.kod}" zaten mevcut, atlandı.`);
          continue;
        }
        
        const yeni = this.facultyRepository.create(kayit);
        const kaydedilen = await this.facultyRepository.save(yeni);
        olusturulan.push(kaydedilen);
      } catch (error) {
        const mesaj = error instanceof Error ? error.message : String(error);
        uyarilar.push(`Fakülte "${kayit.kod}" oluşturulamadı: ${mesaj}`);
      }
    }
    
    return {
      mesaj: `${olusturulan.length} fakülte başarıyla içe aktarıldı.`,
      veri: olusturulan,
      uyarilar,
    };
  }
}
