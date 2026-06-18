import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';

import { LoginDto } from './dto/login.dto';

import { RegisterDto } from './dto/register.dto';

import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser =
      await this.usersService.findByEmail(
        dto.email,
      );

    if (existingUser) {
      throw new BadRequestException(
        'Email already exists',
      );
    }

    const hashedPassword =
      await bcrypt.hash(dto.password, 10);

    const user =
      await this.usersService.create({
        ...dto,
        password: hashedPassword,
      });

    return {
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  // 👇 ADD IT HERE
  async login(dto: LoginDto) {
    const user =
      await this.usersService.findByEmail(
        dto.email,
      );

    if (!user) {
      throw new BadRequestException(
        'Invalid credentials',
      );
    }

    const passwordMatches =
      await bcrypt.compare(
        dto.password,
        user.password,
      );

    if (!passwordMatches) {
      throw new BadRequestException(
        'Invalid credentials',
      );
    }

    const accessToken =
      await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}