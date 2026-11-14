import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateTransferDto } from './dto/create-transfer.dto';

import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

import {
  NotificationType,
  NotificationPriority,
} from '@prisma/client';

@Injectable()
export class TransfersService {
  constructor(
    private prisma: PrismaService,

    private notificationsService: NotificationsService,
    private auditService: AuditService,
  ) {}

  async create(
    dto: CreateTransferDto,
    currentUserId: string,
  ) {

    const batch =
      await this.prisma.batch.findUnique({
        where: {
          id: dto.batchId,
        },
      });

    if (!batch) {
      throw new BadRequestException(
        'Batch not found',
      );
    }

    const sender =
    await this.prisma.user.findUnique({
      where: {
        id: currentUserId,
      },
    });

  const receiver =
    await this.prisma.user.findUnique({
      where: {
        id: dto.toUserId,
      },
    });

  if (!sender || !receiver) {
    throw new BadRequestException(
      'Invalid users.',
    );
  }

  if (
    sender.role === 'MANUFACTURER' &&
    receiver.role !== 'DISTRIBUTOR'
  ) {
    throw new BadRequestException(
      'Manufacturers can only transfer inventory to Distributors.',
    );
  }

  if (
    sender.role === 'DISTRIBUTOR' &&
    receiver.role !== 'PHARMACY'
  ) {
    throw new BadRequestException(
      'Distributors can only transfer inventory to Pharmacies.',
    );
  }
 
    if (
      batch.status !== 'ACTIVE'
    ) {

      throw new BadRequestException(
        'Only active batches can be transferred.',
      );

    }
    // Find sender inventory

    const senderInventory =
      await this.prisma.inventory.findFirst({
        where: {
          batchId: dto.batchId,
          ownerUserId: currentUserId,
        },
      });

    if (!senderInventory) {
      throw new BadRequestException(
        'Inventory not found',
      );
    }

    // Check quantity

    if (
      senderInventory.quantity <
      dto.quantity
    ) {
      throw new BadRequestException(
        'Insufficient inventory',
      );
    }

    // Create transfer record

    const transfer =
      await this.prisma.batchTransfer.create({
        data: {
          batchId: dto.batchId,
          fromUserId: currentUserId,
          toUserId: dto.toUserId,
          quantity: dto.quantity,
          status: 'COMPLETED',
        },
      });

    // Reduce sender inventory

    await this.prisma.inventory.update({
      where: {
        id: senderInventory.id,
      },
      data: {
        quantity: {
          decrement: dto.quantity,
        },
      },
    });

    // Find receiver inventory

    const receiverInventory =
      await this.prisma.inventory.findFirst({
        where: {
          batchId: dto.batchId,
          ownerUserId: dto.toUserId,
        },
      });

    // Update receiver inventory

    if (receiverInventory) {
      await this.prisma.inventory.update({
        where: {
          id: receiverInventory.id,
        },
        data: {
          quantity: {
            increment: dto.quantity,
          },
        },
      });
    } else {
      await this.prisma.inventory.create({
        data: {
          batchId: dto.batchId,
          ownerUserId: dto.toUserId,
          quantity: dto.quantity,
        },
      });
    }

    await this.notificationsService.createNotification({

      userId: dto.toUserId,

      title: 'Inventory Received',

      message: `${dto.quantity} units of batch ${batch.batchNumber} have been transferred to your inventory.`,

      type: NotificationType.TRANSFER,

      priority: NotificationPriority.HIGH,

      actionUrl: '/inventory',

      metadata: {

        batchId: batch.id,

        batchNumber: batch.batchNumber,

        transferId: transfer.id,

        quantity: dto.quantity,

      },

    });

    await this.notificationsService.createNotification({

      userId: currentUserId,

      title: 'Inventory Sent',

      message: `${dto.quantity} units of batch ${batch.batchNumber} were transferred successfully.`,

      type: NotificationType.TRANSFER,

      priority: NotificationPriority.MEDIUM,

      actionUrl: '/transfers',

      metadata: {

        batchId: batch.id,

        batchNumber: batch.batchNumber,

        transferId: transfer.id,

        quantity: dto.quantity,

        receiverId: dto.toUserId,

      },

    });

    const admins =
      await this.prisma.user.findMany({

        where: {

          role: 'SUPER_ADMIN',

        },

      });

    for (const admin of admins) {

      await this.notificationsService.createNotification({

        userId: admin.id,

        title: 'Transfer Completed',

        message: `${dto.quantity} units of batch ${batch.batchNumber} were transferred.`,

        type: NotificationType.TRANSFER,

        priority: NotificationPriority.MEDIUM,

        actionUrl: '/transfers',

        metadata: {

          batchId: batch.id,

          transferId: transfer.id,

          senderId: currentUserId,

          receiverId: dto.toUserId,

        },

      });

    }

    await this.auditService.log({

    userId: currentUserId,

    action: 'TRANSFER_COMPLETED',

    entity: 'BATCH_TRANSFER',

    entityId: transfer.id,

    description: `${sender.fullName} transferred ${dto.quantity} units of batch ${batch.batchNumber} to ${receiver.fullName}.`,

    metadata: {

      batchId: batch.id,

      batchNumber: batch.batchNumber,

      quantity: dto.quantity,

      senderId: currentUserId,

      receiverId: dto.toUserId,

    },

  });

    return transfer;
  }

  async findAll(

    userId: string,

    role: string,

  ) {

    if (

      role === 'SUPER_ADMIN' ||

      role === 'REGULATOR'

    ) {

      return this.prisma.batchTransfer.findMany({

        include: {

          batch: true,

          fromUser: true,

          toUser: true,

        },

        orderBy: {

          createdAt: 'desc',

        },

      });

    }

    return this.prisma.batchTransfer.findMany({

      where: {

        OR: [

          {

            fromUserId: userId,

          },

          {

            toUserId: userId,

          },

        ],

      },

      include: {

        batch: true,

        fromUser: true,

        toUser: true,

      },

      orderBy: {

        createdAt: 'desc',

      },

    });

  }

  async getTransferUsers(

    currentUserId: string,

  ) {

    const currentUser =
      await this.prisma.user.findUnique({

        where: {

          id: currentUserId,

        },

      });

    if (!currentUser) {
      return [];
    }

    let allowedRoles: string[] = [];

    switch (currentUser.role) {

      case 'MANUFACTURER':

        allowedRoles = [
          'DISTRIBUTOR',
        ];

        break;

      case 'DISTRIBUTOR':

        allowedRoles = [
          'PHARMACY',
        ];

        break;

      default:

        return [];

    }

    return this.prisma.user.findMany({

      where: {

        role: {

          in: allowedRoles as any,

        },

        status: 'ACTIVE',

      },

      select: {

        id: true,

        fullName: true,

        role: true,

      },

      orderBy: {

        fullName: 'asc',

      },

    });

  }

  findOne(id: string) {
    return this.prisma.batchTransfer.findUnique({
      where: { id },

      include: {
        batch: true,
        fromUser: true,
        toUser: true,
      },
    });
  }
}