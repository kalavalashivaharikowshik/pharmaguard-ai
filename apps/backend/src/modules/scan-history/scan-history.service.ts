import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ScanHistoryService {

  constructor(
    private prisma: PrismaService,
  ) {}

  async create(data: {

    userId: string;

    batchId?: string;

    batchNumber: string;

    qrCode: string;

    verified: boolean;

    result: string;

  }) {

    return this.prisma.scanHistory.create({

      data,

    });

  }

  async getUserHistory(
    userId: string,
  ) {

    return this.prisma.scanHistory.findMany({

      where: {

        userId,

      },

      include: {

        batch: {

          include: {

            manufacturer: true,

          },

        },

      },

      orderBy: {

        scannedAt: 'desc',

      },

    });

  }

  async getNetworkHistory() {

    return this.prisma.scanHistory.findMany({

      include: {

        user: true,

        batch: {

          include: {

            manufacturer: true,

          },

        },

      },

      orderBy: {

        scannedAt: 'desc',

      },

    });

  }

}