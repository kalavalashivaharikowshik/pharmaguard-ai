import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { EmailService }
from '../email/email.service';

import { v4 as uuid } from 'uuid';

import {
  RegistrationStatus,
  UserRole,
  UserStatus,
  NotificationType,
} from '@prisma/client';

import { NotificationsService }
from '../notifications/notifications.service';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateRegistrationDto } from './dto/create-registration.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class RegistrationService {

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
    private auditService: AuditService,
  ) {}

  async approve(
    registrationId: string,
  ) {

    const registration =
      await this.prisma.registration.findUnique({
        

        where: {

          id: registrationId,

        },

      });

    if (!registration) {

      throw new BadRequestException(
        'Registration not found.',
      );

    }

    if (
      registration.status !==
      RegistrationStatus.PENDING
    ) {

      throw new BadRequestException(
        'Registration already processed.',
      );

    }
    const existingUser =
      await this.prisma.user.findUnique({

        where: {
          email: registration.email,
        },

      });

    if (existingUser) {

      throw new BadRequestException(
        'User already exists.',
      );

    }



    const user =
      await this.prisma.user.create({

        data: {

          fullName:
            registration.contactPerson,

          email:
            registration.email,

          password: '',

          organizationName:
            registration.organizationName,

          phone:
            registration.phone,

          role:
            registration.role as UserRole,

          status:
            UserStatus.ACTIVE,

        },

      });

      const token =
        uuid();

      const expiresAt =
        new Date();

      expiresAt.setHours(
        expiresAt.getHours() + 24,
      );

      await this.prisma.activationToken.create({

        data: {

          token,

          userId: user.id,

          expiresAt,

        },

      });

    await this.emailService.sendActivationEmail(

      user.email,

      token,

    );

    await this.auditService.log({

    userId: user.id,

    action: 'REGISTRATION_APPROVED',

    entity: 'REGISTRATION',

    entityId: registration.id,

    description:
      `${registration.organizationName} approved.`,

  });

    await this.prisma.registration.update({

      where: {

        id: registration.id,

      },

      data: {

        status:
          RegistrationStatus.APPROVED,

      },

    });

    await this.notificationsService.createNotification({

      userId: user.id,

      title: 'Registration Approved',

      message:
        'Your account has been approved. Please activate your account to create your password.',

      type:
        NotificationType.USER,

      priority:
        'HIGH',

      actionUrl:
        '/activate',

    });

    return {

      message:
        'Registration approved. Activation email sent.',

    };

  }

  async reject(
    registrationId: string,
    reason: string,
  ) {

    const registration =
      await this.prisma.registration.findUnique({

        where: {

          id: registrationId,

        },

      });

    if (!registration) {

      throw new BadRequestException(
        'Registration not found.',
      );

    }

    if (
      registration.status !==
      RegistrationStatus.PENDING
    ) {

      throw new BadRequestException(
        'Registration already processed.',
      );

    }

    const rejectedRegistration =
    await this.prisma.registration.update({

      where: {

        id: registrationId,

      },

      data: {

        status: RegistrationStatus.REJECTED,

        reviewNotes: reason,

      },

    });

  await this.auditService.log({

    action: 'REGISTRATION_REJECTED',

    entity: 'REGISTRATION',

    entityId: rejectedRegistration.id,

    description:
      `${rejectedRegistration.organizationName} rejected.`,

    metadata: {

      reason,

    },

    });

    return rejectedRegistration;

  }

  async register(
    dto: CreateRegistrationDto,
  ) {

    const exists =
      await this.prisma.registration.findUnique({

        where: {

          email: dto.email,

        },

      });

    if (exists) {

      throw new BadRequestException(
        'Registration already exists.',
      );

    }

    const registration =
    await this.prisma.registration.create({

      data: {

        ...dto,

        status: RegistrationStatus.PENDING,

      },

    });

  await this.auditService.log({

    action: 'REGISTRATION_CREATED',

    entity: 'REGISTRATION',

    entityId: registration.id,

    description:
      `${registration.organizationName} submitted a registration.`,

    metadata: {

      role: registration.role,

      email: registration.email,

    },

    });

    return registration;
  }

  async findAll() {

    return this.prisma.registration.findMany({

      orderBy: {

        createdAt: 'desc',

      },

    });

  }

  findOne(
    id: string,
  ) {

    return this.prisma.registration.findUnique({

      where: {

        id,

      },

    });

  }

  async uploadDocument(

    registrationId: string,

    file: Express.Multer.File,

    documentType: any,

  ){

    return this.prisma.registrationDocument.create({

      data: {

        registrationId,

        fileName:
          file.originalname,

        fileUrl:
          `/uploads/registrations/${file.filename}`,

        documentType,
      },

    });

  }

  async getDocuments(
    registrationId: string,
  ) {

    return this.prisma.registrationDocument.findMany({

      where: {

        registrationId,

      },

      orderBy: {

        uploadedAt: 'desc',

      },

    });

  }

}