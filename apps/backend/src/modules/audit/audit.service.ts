import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {

  constructor(
    private prisma: PrismaService,
  ) {}

  async log(data: {

    userId?: string;

    action: string;

    entity: string;

    entityId?: string;

    description: string;

    metadata?: any;

    ipAddress?: string;

  }) {

    return this.prisma.auditLog.create({

      data: {

        userId: data.userId,

        action: data.action,

        entity: data.entity,

        entityId: data.entityId,

        description: data.description,

        metadata: data.metadata,

        ipAddress: data.ipAddress,

      },

    });

  }

  async getLogs() {

    return this.prisma.auditLog.findMany({

      include: {

        user: {

          select: {

            fullName: true,

            email: true,

            role: true,

          },

        },

      },

      orderBy: {

        createdAt: 'desc',

      },

    });

  }

}