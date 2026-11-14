import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async getMyInventory(
    userId: string,
  ) {
    return this.prisma.inventory.findMany({
      where: {
        ownerUserId: userId,
      },

      include: {
        batch: {
          include: {
            manufacturer: true,
          },
        },
      },
    });
  }

  async getBatchInventory(
    batchId: string,
  ) {
    return this.prisma.inventory.findMany({
      where: {
        batchId,
      },

      include: {
        batch: {
          include: {
            manufacturer: true,
          },
        },
      },
    });
  }

  async getNetworkInventory() {
    return this.prisma.inventory.findMany({
      include: {
        batch: {
          include: {
            manufacturer: true,
          },
        },
      },
    });
  }
}