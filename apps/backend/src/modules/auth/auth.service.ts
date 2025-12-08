import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { EnvConfig } from '../../config/env.validation';
import { User } from '../../database/entities/user.entity';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvConfig, true>,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email.toLowerCase());
    if (!user || !user.aktif) {
      throw new UnauthorizedException('E-posta veya şifre hatalı.');
    }
    const isPasswordValid = await argon2.verify(user.sifreHash, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('E-posta veya şifre hatalı.');
    }
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.sifre);
    const payload = await this.issueTokens(user);
    return {
      mesaj: 'Giriş başarılı.',
      ...payload,
    };
  }

  async profile(userId: string) {
    const user = await this.usersService.findById(userId);
    return this.usersService.toSafeUser(user);
  }

  private async issueTokens(user: User) {
    const basePayload: Omit<JwtPayload, 'tokenType'> = {
      sub: user.id,
      email: user.email,
      rol: user.rol,
      bolumId: user.ogretimUyesi?.bolumId ?? null,
      fakulteId: user.ogretimUyesi?.bolum?.fakulteId ?? null,
    };

    const accessToken = await this.jwtService.signAsync(
      { ...basePayload, tokenType: 'access' as const },
      {
        expiresIn: this.configService.get('JWT_EXPIRES_IN', { infer: true }),
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { ...basePayload, tokenType: 'refresh' as const },
      {
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', {
          infer: true,
        }),
      },
    );

    return {
      accessToken,
      refreshToken,
      kullanici: this.usersService.toSafeUser(user),
    };
  }

  async refresh(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get('JWT_SECRET', { infer: true }),
      });
      if (payload.tokenType !== 'refresh') {
        throw new UnauthorizedException('Geçersiz token türü.');
      }
      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.aktif) {
        throw new UnauthorizedException('Kullanıcı aktif değil.');
      }
      const result = await this.issueTokens(user);
      return {
        mesaj: 'Token yenilendi.',
        ...result,
      };
    } catch {
      throw new UnauthorizedException('Token doğrulanamadı.');
    }
  }
}
