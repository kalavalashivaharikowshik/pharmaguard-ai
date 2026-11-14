import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';

import { LoginDto } from './dto/login.dto';

import { v4 as uuid } from 'uuid';

import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';

import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private emailService: EmailService,
    private auditService: AuditService,
  ) {}

  async getMe(
    userId: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          phone: true,
          organizationName: true,
          manufacturerId: true,
          status: true,
          isVerified: true,
          createdAt: true,
        },
      });

    if (!user) {
      throw new BadRequestException(
        'User not found.',
      );
    }

    return user;
  }

  async activateAccount(
    token: string,
    password: string,
  ) {
    const activation =
      await this.prisma.activationToken.findUnique({
        where: {
          token,
        },
        include: {
          user: true,
        },
      });

    if (!activation) {
      throw new BadRequestException(
        'Invalid activation token.',
      );
    }

    if (activation.used) {
      throw new BadRequestException(
        'Activation token already used.',
      );
    }

    if (
      activation.expiresAt <
      new Date()
    ) {
      throw new BadRequestException(
        'Activation token expired.',
      );
    }

    const hashed =
      await bcrypt.hash(
        password,
        10,
      );

    await this.prisma.user.update({
      where: {
        id: activation.userId,
      },
      data: {
        password: hashed,
        status: 'ACTIVE',
      },
    });

    await this.prisma.activationToken.updateMany({
      where: {
        userId: activation.userId,
        used: false,
      },
      data: {
        used: true,
      },
    });

    await this.auditService.log({
      userId: activation.userId,
      action: 'ACCOUNT_ACTIVATED',
      entity: 'USER',
      entityId: activation.userId,
      description:
        `${activation.user.email} activated account.`,
    });

    return {
      message:
        'Account activated successfully.',
    };
  }

  async forgotPassword(
    email: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (!user) {
      return {
        message:
          'If the account exists, a password reset email has been sent.',
      };
    }

    const token =
      uuid();

    const expiresAt =
      new Date();

    expiresAt.setHours(
      expiresAt.getHours() + 1,
    );

    await this.prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    await this.emailService.sendPasswordResetEmail(
      user.email,
      token,
    );

    await this.auditService.log({
      userId: user.id,
      action: 'PASSWORD_RESET_REQUEST',
      entity: 'USER',
      entityId: user.id,
      description:
        `${user.email} requested password reset.`,
    });

    return {
      message:
        'If the account exists, a password reset email has been sent.',
    };
  }

  async resetPassword(
    token: string,
    password: string,
  ) {
    const reset =
      await this.prisma.passwordResetToken.findUnique({
        where: {
          token,
        },
        include: {
          user: true,
        },
      });

    if (!reset) {
      throw new BadRequestException(
        'Invalid reset token.',
      );
    }

    if (reset.used) {
      throw new BadRequestException(
        'Reset token already used.',
      );
    }

    if (
      reset.expiresAt <
      new Date()
    ) {
      throw new BadRequestException(
        'Reset token expired.',
      );
    }

    const hashed =
      await bcrypt.hash(
        password,
        10,
      );

    await this.prisma.user.update({
      where: {
        id: reset.userId,
      },
      data: {
        password: hashed,
      },
    });

    await this.prisma.passwordResetToken.update({
      where: {
        id: reset.id,
      },
      data: {
        used: true,
      },
    });

    await this.auditService.log({
      userId: reset.userId,
      action: 'PASSWORD_RESET',
      entity: 'USER',
      entityId: reset.userId,
      description:
        `${reset.user.email} reset password.`,
    });

    return {
      message:
        'Password updated successfully.',
    };
  }

  async login(
    dto: LoginDto,
  ) {
    const user =
      await this.usersService.findByEmail(
        dto.email,
      );

    if (!user) {
      throw new BadRequestException(
        'Invalid credentials',
      );
    }

    if (
      user.status ===
      'SUSPENDED'
    ) {
      throw new BadRequestException(
        'Your account has been suspended. Please contact the administrator.',
      );
    }

    if (
      user.status ===
      'INACTIVE'
    ) {
      throw new BadRequestException(
        'Your account is inactive.',
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

    await this.auditService.log({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      entity: 'USER',
      entityId: user.id,
      description:
        `${user.fullName} logged in.`,
    });

    return {
    accessToken,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      organizationName: user.organizationName,
      phone: user.phone,
      manufacturerId: user.manufacturerId,
      status: user.status,
      isVerified: user.isVerified,
    },
  };
  }
}