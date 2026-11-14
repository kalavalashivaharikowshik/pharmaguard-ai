import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {

  constructor(
    private prisma: PrismaService,
  ) {}

  async getDashboardAnalytics(year?: number) {

    const selectedYear =
      year ?? new Date().getFullYear();

    const start =
      new Date(selectedYear, 0, 1);

    const end =
      new Date(selectedYear + 1, 0, 1);

    const [

      totalInventory,

      totalTransfers,

      totalRecalls,

      totalManufacturers,

      activeBatches,

      revokedBatches,

    ] = await Promise.all([

      this.prisma.inventory.aggregate({

        _sum: {

          quantity: true,

        },

      }),

      this.prisma.batchTransfer.count({

        where: {

          createdAt: {

            gte: start,

            lt: end,

          },

        },

      }),

      this.prisma.recall.count({

        where: {

          createdAt: {

            gte: start,

            lt: end,

          },

        },

      }),

      this.prisma.manufacturer.count(),

      this.prisma.batch.count({

        where: {

          status: 'ACTIVE',

        },

      }),

      this.prisma.batch.count({

        where: {

          status: 'REVOKED',

        },

      }),

    ]);

    const inventoryTrend = await this.monthlyInventory(selectedYear);

    const transferTrend = await this.monthlyTransfers(selectedYear);

    const recallTrend = await this.monthlyRecalls(selectedYear);

    const manufacturerStats =
      await this.manufacturerStatistics();

    const recallDistribution =
      await this.recallDistribution();

    return {

      summary: {

        inventory:

          totalInventory._sum.quantity ?? 0,

        transfers:

          totalTransfers,

        recalls:

          totalRecalls,

        manufacturers:

          totalManufacturers,

        activeBatches,

        revokedBatches,

      },

      inventoryTrend,

      transferTrend,

      recallTrend,

      manufacturerStats,

      recallDistribution,

    };

  }

  private async monthlyInventory(

    year: number,

  ) {

    const result: {

      month: number;

      quantity: number;

    }[] = [];

    for (

      let month = 0;

      month < 12;

      month++

    ) {

      const start =
        new Date(year, month, 1);

      const end =
        new Date(year, month + 1, 1);

      const inventory =
        await this.prisma.inventory.aggregate({

          where: {

            createdAt: {

              gte: start,

              lt: end,

            },

          },

          _sum: {

            quantity: true,

          },

        });

      result.push({

        month: month + 1,

        quantity:

          inventory._sum.quantity ?? 0,

      });

    }

    return result;

  }

  private async monthlyTransfers(

    year: number,

  ) {

    const result: {

      month: number;

      transfers: number;

    }[] = [];

    for (

      let month = 0;

      month < 12;

      month++

    ) {

      const start =
        new Date(year, month, 1);

      const end =
        new Date(year, month + 1, 1);

      const count =
        await this.prisma.batchTransfer.count({

          where: {

            createdAt: {

              gte: start,

              lt: end,

            },

          },

        });

      result.push({

        month: month + 1,

        transfers: count,

      });

    }

    return result;

  }

  private async monthlyRecalls(

    year: number,

  ) {

    const result: {

      month: number;

      recalls: number;

    }[] = [];

    for (

      let month = 0;

      month < 12;

      month++

    ) {

      const start =
        new Date(year, month, 1);

      const end =
        new Date(year, month + 1, 1);

      const count =
        await this.prisma.recall.count({

          where: {

            createdAt: {

              gte: start,

              lt: end,

            },

          },

        });

      result.push({

        month: month + 1,

        recalls: count,

      });

    }

    return result;

  }

  private async manufacturerStatistics() {

    const manufacturers =
      await this.prisma.manufacturer.findMany({

        include: {

          batches: true,

        },

      });

    return manufacturers.map(

      manufacturer => ({

        id: manufacturer.id,

        name: manufacturer.name,

        batches:

          manufacturer.batches.length,

      }),

    );

  }

  private async recallDistribution() {

    const [

      low,

      medium,

      high,

      critical,

    ] = await Promise.all([

      this.prisma.recall.count({

        where: {

          severity: 'LOW',

        },

      }),

      this.prisma.recall.count({

        where: {

          severity: 'MEDIUM',

        },

      }),

      this.prisma.recall.count({

        where: {

          severity: 'HIGH',

        },

      }),

      this.prisma.recall.count({

        where: {

          severity: 'CRITICAL',

        },

      }),

    ]);

    return {

      LOW: low,

      MEDIUM: medium,

      HIGH: high,

      CRITICAL: critical,

    };

  }

}