import { Injectable } from '@nestjs/common';

import {
  NotificationType,
} from '@prisma/client';

import { NotificationsGateway }
from './notifications.gateway';

import { PrismaService } from '../../prisma/prisma.service';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private gateway: NotificationsGateway,
    private firebaseService: FirebaseService,
  ) {}

  private async sendPushNotification(

    userId: string,

    title: string,

    message: string,

    actionUrl?: string,

  ) {

    const devices =

      await this.prisma.deviceToken.findMany({

        where: {

          userId,

        },

      });

    if (!devices.length) {

      return;

    }

    const messaging =
      this.firebaseService.getMessaging();

    for (const device of devices) {

      try {

        await messaging.send({

          token: device.token,

          notification: {

            title,

            body: message,

          },

          data: {

            actionUrl: actionUrl ?? '',

          },

        });

      }

      catch (error) {

        console.error(

          `Failed sending push to ${device.token}`,

          error,

        );

      }

    }

  }

  async createNotification(
    data: {

      userId: string;

      title: string;

      message: string;

      type: NotificationType;

      priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

      actionUrl?: string;

      metadata?: any;

    },

  ) {

    const notification =
    await this.prisma.notification.create({

      data: {

        userId: data.userId,

        title: data.title,

        message: data.message,

        type: data.type,

        priority: data.priority,

        status: 'UNREAD',

        isRead: false,

        actionUrl: data.actionUrl,

        metadata: data.metadata,

      },

    });

  this.gateway.sendNotification(

    data.userId,

    notification,

  );

  await this.sendPushNotification(

    data.userId,

    data.title,

    data.message,

    data.actionUrl,

  );

  return notification;
    }

  async createRecallNotifications(
      recall: any,
    ) {

      const batch =
        await this.prisma.batch.findUnique({

          where: {

            id: recall.batchId,

          },

          include: {

            manufacturer: true,

            inventories: true,

          },

        });

      if (!batch) {
        return;
      }

      // Manufacturer

      const manufacturerUsers =
        await this.prisma.user.findMany({

          where: {

            manufacturerId:
              batch.manufacturerId,

          },

        });

      // Super Admin + Regulator

      const admins =
        await this.prisma.user.findMany({

          where: {

            role: {

              in: [

                'SUPER_ADMIN',

                'REGULATOR',

              ],

            },

          },

        });

      // Inventory owners

      const inventoryOwners =
        await this.prisma.user.findMany({

          where: {

            id: {

              in: batch.inventories.map(

                i => i.ownerUserId,

              ),

            },

          },

        });

      const users = [

        ...manufacturerUsers,

        ...admins,

        ...inventoryOwners,

      ];

      const uniqueUsers =
        [...new Map(

          users.map(

            user => [

              user.id,

              user,

            ],

          ),

        ).values()];

      for (const user of uniqueUsers) {

        await this.createNotification({

          userId: user.id,

          title: 'Drug Recall Issued',

          message: `${batch.drugName} (${batch.batchNumber}) has been recalled due to ${recall.reason}.`,

          type: NotificationType.RECALL,

          priority: 'CRITICAL',

          actionUrl: '/recalls',

          metadata: {

            recallId: recall.id,

            batchId: batch.id,

            batchNumber: batch.batchNumber,

          },

        });

      }

    }

  getUserNotifications(
    userId: string,
  ) {
    return this.prisma.notification.findMany({
      where: {
        userId,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(

    id: string,

    userId: string,

  ) {

    return this.prisma.notification.findFirst({

      where: {

        id,

        userId,

      },

    });

  }

  async getUnreadCount(
    userId: string,
  ) {

    const count =
      await this.prisma.notification.count({

        where: {

          userId,

          isRead: false,

        },

      });

    return {

      unread: count,

    };

  }

  async markAsRead(
    id: string,
    userId: string,
  ) {

    return this.prisma.notification.update({

      where: {

        id,

        userId,

      },

      data: {

        isRead: true,

        status: 'READ',

      },

    });

  }

  async markAllAsRead(
    userId: string,
  ) {

    await this.prisma.notification.updateMany({

      where: {

        userId,

        isRead: false,

      },

      data: {

        isRead: true,

        status: 'READ',

      },

    });

    return {

      message:
        'All notifications marked as read.',

    };

  }

  async deleteNotification(
    id: string,
    userId: string,
  ) {

    return this.prisma.notification.delete({

      where: {

        id,

        userId,

      },

    });

  }
}