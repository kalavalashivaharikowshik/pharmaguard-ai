import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../prisma/prisma.service';

import {
  UserRole,
  UserStatus,
  NotificationType,
  NotificationPriority,
} from '@prisma/client';

import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private auditService: AuditService,
  ) {}

  findByEmail(
    email: string,
  ) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  create(
    data: any,
  ) {
    return this.prisma.user.create({
      data,
    });
  }

  findById(
    id: string,
  ) {
    return this.prisma.user.findUnique({
      where: { id },

      include: {
        manufacturer: true,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        organizationName: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getProfile(
    userId: string,
  ) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        organizationName: true,
        phone: true,
        createdAt: true,
      },
    });
  }

  async createUser(
    data: any,
  ) {
    const user =
      await this.prisma.user.create({
        data,
      });

    // Audit Log
    await this.auditService.log({
      userId: user.id,
      action: 'USER_CREATED',
      entity: 'USER',
      entityId: user.id,
      description: `Created user ${user.email}.`,
      metadata: {
        role: user.role,
      },
    });

    const admins =
      await this.prisma.user.findMany({
        where: {
          role: 'SUPER_ADMIN',
        },
      });

    // Notify Super Admins
    for (const admin of admins) {
      await this.notificationsService.createNotification({
        userId: admin.id,
        title: 'New User Created',
        message: `${user.fullName} has been added as ${user.role}.`,
        type: NotificationType.USER,
        priority: NotificationPriority.LOW,
        actionUrl: '/users',
        metadata: {
          userId: user.id,
          role: user.role,
        },
      });
    }

    // Notify the new user
    await this.notificationsService.createNotification({
      userId: user.id,
      title: 'Welcome to PharmaGuard AI',
      message: `Your ${user.role} account has been created successfully.`,
      type: NotificationType.USER,
      priority: NotificationPriority.LOW,
      actionUrl: '/',
      metadata: {
        changedAt: new Date(),
        initiatedBy: user.id,
      },
    });

    return user;
  }

  async updateRole(
    userId: string,
    role: UserRole,
  ) {
    const user =
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          role,
        },
      });

    // Audit Log
    await this.auditService.log({
      userId: user.id,
      action: 'ROLE_CHANGED',
      entity: 'USER',
      entityId: user.id,
      description: `${user.email} role changed.`,
      metadata: {
        newRole: user.role,
      },
    });

    return user;
  }

  async updateStatus(
    userId: string,
    status: UserStatus,
  ) {
    const user =
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          status,
        },
      });

    // Audit Log
    await this.auditService.log({
      userId: user.id,
      action: 'USER_STATUS_CHANGED',
      entity: 'USER',
      entityId: user.id,
      description: `${user.email} status updated.`,
      metadata: {
        status: user.status,
      },
    });

    // Notify updated user
    await this.notificationsService.createNotification({
      userId: user.id,
      title: 'Account Status Updated',
      message: `Your account status has been changed to ${status}.`,
      type: NotificationType.USER,
      priority: NotificationPriority.HIGH,
      actionUrl: '/settings',
      metadata: {
        status,
      },
    });

    // Notify Super Admins
    const admins =
      await this.prisma.user.findMany({
        where: {
          role: 'SUPER_ADMIN',
        },
      });

    for (const admin of admins) {
      if (admin.id === user.id) {
        continue;
      }

      await this.notificationsService.createNotification({
        userId: admin.id,
        title: 'User Status Changed',
        message: `${user.fullName}'s account status changed to ${status}.`,
        type: NotificationType.USER,
        priority: NotificationPriority.MEDIUM,
        actionUrl: '/users',
        metadata: {
          userId: user.id,
          status,
        },
      });
    }

    return user;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user) {
      throw new BadRequestException(
        'User not found',
      );
    }

    const valid =
      await bcrypt.compare(
        currentPassword,
        user.password,
      );

    if (!valid) {
      throw new BadRequestException(
        'Current password incorrect',
      );
    }

    const hashed =
      await bcrypt.hash(
        newPassword,
        10,
      );

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashed,
      },
    });

    // Audit Log
    await this.auditService.log({
      userId: user.id,
      action: 'PASSWORD_CHANGED',
      entity: 'USER',
      entityId: user.id,
      description: `${user.email} changed password.`,
    });

    // Create security notification
    await this.notificationsService.createNotification({
      userId,
      title: 'Password Changed',
      message:
        'Your password was changed successfully. If this was not you, contact your administrator immediately.',
      type: NotificationType.SECURITY,
      priority: NotificationPriority.LOW,
      actionUrl: '/settings',
      metadata: {},
    });

    return {
      message:
        'Password updated successfully',
    };
  }
}