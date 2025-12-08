import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from '../../database/entities/user.entity';
import { Instructor } from '../../database/entities/instructor.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { paginate } from '../../common/utils/paginate';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Instructor)
    private readonly instructorRepository: Repository<Instructor>,
  ) {}

  async findByEmail(email: string) {
    const normalized = email.toLowerCase();
    return this.userRepository.findOne({
      where: { email: normalized },
      relations: [
        'ogretimUyesi',
        'ogretimUyesi.bolum',
        'ogretimUyesi.bolum.fakulte',
      ],
    });
  }

  async findById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: [
        'ogretimUyesi',
        'ogretimUyesi.bolum',
        'ogretimUyesi.bolum.fakulte',
      ],
    });
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }
    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(
        'Bu e-posta adresi ile kayıtlı kullanıcı mevcut.',
      );
    }

    const user = this.userRepository.create({
      email: dto.email.toLowerCase(),
      rol: dto.rol,
      aktif: dto.aktif ?? true,
      sifreHash: await argon2.hash(dto.sifre),
    });

    if (dto.ogretimUyesiId) {
      const instructor = await this.instructorRepository.findOne({
        where: { id: dto.ogretimUyesiId },
      });
      if (!instructor) {
        throw new NotFoundException('Öğretim üyesi bulunamadı.');
      }
      user.ogretimUyesi = instructor;
      user.ogretimUyesiId = instructor.id;
    }

    const saved = await this.userRepository.save(user);
    const fullUser = await this.findById(saved.id);
    return {
      mesaj: 'Kullanıcı oluşturuldu.',
      veri: this.toSafeUser(fullUser),
    };
  }

  async list(query: UserQueryDto) {
    const { page = 1, limit = 25, rol, aktif, search } = query;

    const qb = this.userRepository
      .createQueryBuilder('kullanici')
      .leftJoinAndSelect('kullanici.ogretimUyesi', 'ogretimUyesi')
      .leftJoinAndSelect('ogretimUyesi.bolum', 'bolum')
      .leftJoinAndSelect('bolum.fakulte', 'fakulte');

    if (rol) {
      qb.andWhere('kullanici.rol = :rol', { rol });
    }
    if (aktif !== undefined) {
      qb.andWhere('kullanici.aktif = :aktif', { aktif: aktif === 'true' });
    }
    if (search) {
      qb.andWhere(
        '(LOWER(kullanici.email) LIKE :aranan OR LOWER(ogretimUyesi.ad) LIKE :aranan)',
        { aranan: `%${search.toLowerCase()}%` },
      );
    }

    qb.orderBy('kullanici.email', 'ASC');
    const sonuc = await paginate<User>(qb, page, limit);
    return {
      ...sonuc,
      mesaj: 'Kullanıcılar listelendi.',
      veriler: sonuc.veriler.map((user) => this.toSafeUser(user)),
    };
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }

    if (typeof dto.email === 'string' && dto.email !== user.email) {
      const existing = await this.findByEmail(dto.email);
      if (existing && existing.id !== user.id) {
        throw new ConflictException(
          'Bu e-posta adresi başka bir kullanıcıya ait.',
        );
      }
      user.email = dto.email.toLowerCase();
    }

    if (dto.rol) {
      user.rol = dto.rol;
    }

    if (dto.aktif !== undefined) {
      user.aktif = dto.aktif;
    }

    if (dto.sifre) {
      user.sifreHash = await argon2.hash(dto.sifre);
    }

    if (dto.ogretimUyesiId !== undefined) {
      if (!dto.ogretimUyesiId) {
        user.ogretimUyesi = null;
        user.ogretimUyesiId = null;
      } else {
        const instructor = await this.instructorRepository.findOne({
          where: { id: dto.ogretimUyesiId },
        });
        if (!instructor) {
          throw new NotFoundException('Öğretim üyesi bulunamadı.');
        }
        user.ogretimUyesi = instructor;
        user.ogretimUyesiId = instructor.id;
      }
    }

    await this.userRepository.save(user);
    return {
      mesaj: 'Kullanıcı güncellendi.',
      veri: this.toSafeUser(await this.findById(user.id)),
    };
  }

  async remove(id: string) {
    const user = await this.findById(id);
    await this.userRepository.remove(user);
    return { mesaj: 'Kullanıcı silindi.' };
  }

  toSafeUser(user?: User | null) {
    if (!user) return null;
    const sanitized: Partial<User> = { ...user };
    delete sanitized.sifreHash;
    return sanitized;
  }
}
