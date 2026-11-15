import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateBatchDto, UpdateBatchDto } from './dto/create-batch.dto';
import { QrService } from './qr/qr.service';
import { AuditService } from '../audit/audit.service';
import { BlockchainService } from '../blockchain/blockchain.service';

import { NotificationsService } from '../notifications/notifications.service';

import {
  NotificationType,
  NotificationPriority,
} from '@prisma/client';

@Injectable()
export class BatchesService {
  constructor(
    private prisma: PrismaService,
    private qrService: QrService,
    private blockchainService: BlockchainService,
    private notificationsService: NotificationsService,
    private auditService: AuditService,
  ) {}

  async create(
    dto: CreateBatchDto,
    userId: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });


    if (!user?.manufacturerId) {
      throw new BadRequestException(
        'Manufacturer not linked',
      );
    }

    const existing =
      await this.prisma.batch.findUnique({
        where: {
          batchNumber: dto.batchNumber,
        },
      });

    if (existing) {
      throw new BadRequestException(
        'Batch number already exists',
      );
    }

    // Create batch first
    const batch =
      await this.prisma.batch.create({
        data: {
          drugName: dto.drugName,
          batchNumber: dto.batchNumber,
          manufactureDate: new Date(
            dto.manufactureDate,
          ),
          expiryDate: new Date(
            dto.expiryDate,
          ),
          quantity: dto.quantity,
          manufacturerId:
            user.manufacturerId,
          category: dto.category,
          description: dto.description,
          storageConditions: dto.storageConditions,
        },
      });

    // Audit Log
    await this.auditService.log({
      userId: user.id,
      action: 'BATCH_CREATED',
      entity: 'BATCH',
      entityId: batch.id,
      description: `Created batch ${batch.batchNumber}.`,
      metadata: {
        batchNumber: batch.batchNumber,
        productName: batch.drugName,
        manufacturerId: batch.manufacturerId,
        quantity: batch.quantity,
      },
    });

    // Create initial inventory
    await this.prisma.inventory.create({
      data: {
        batchId: batch.id,
        ownerUserId: user.id,
        quantity: batch.quantity,
      },
    });

    // Generate QR
    const qr =
      await this.qrService.generateBatchQR(
        batch.id,
        batch.batchNumber,
      );

    // Save QR identity
    const updatedBatch =
      await this.prisma.batch.update({
        where: {
          id: batch.id,
        },
        data: {
          qrCode: qr.qrIdentity,
        },
      });

    // ----------------------------------
    // Blockchain Registration
    // ----------------------------------

    const blockchainHash =
      await this.blockchainService.generateBatchHash(
        updatedBatch,
      );

    const blockchainResult =
      await this.blockchainService.registerBatch(
        updatedBatch.batchNumber,
        blockchainHash,
      );

    // Audit Log
    await this.auditService.log({
      userId: user.id,
      action: 'BLOCKCHAIN_REGISTERED',
      entity: 'BATCH',
      entityId: updatedBatch.id,
      description: `Registered batch ${updatedBatch.batchNumber} on blockchain.`,
    });

    await this.prisma.batch.update({
      where: {
        id: updatedBatch.id,
      },
      data: {
        blockchainHash,
        transactionHash:
          blockchainResult.txHash,
      },
    });

    await this.notificationsService.createNotification({
      userId: user.id,
      title: 'New Batch Created',
      message: `${updatedBatch.batchNumber} has been created successfully.`,
      type: NotificationType.INVENTORY,
      priority: NotificationPriority.MEDIUM,
      actionUrl: '/inventory',
      metadata: {
        batchId: updatedBatch.id,
        batchNumber:
          updatedBatch.batchNumber,
      },
    });

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

    for (const admin of admins) {
      await this.notificationsService.createNotification({
        userId: admin.id,
        title: 'New Batch Created',
        message: `${updatedBatch.batchNumber} was created by ${user.fullName}.`,
        type: NotificationType.INVENTORY,
        priority: NotificationPriority.MEDIUM,
        actionUrl: '/inventory',
        metadata: {
          batchId: updatedBatch.id,
          batchNumber:
            updatedBatch.batchNumber,
        },
      });
    }

    return this.prisma.batch.findUnique({
      where: {
        id: updatedBatch.id,
      },
    });
  }

  async findAll(userId?: string, role?: string) {
    // Manufacturers see their own batches; oversight roles see everything.
    let where = {};
    if (role === 'MANUFACTURER' && userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { manufacturerId: true } });
      where = { manufacturerId: user?.manufacturerId ?? '__none__' };
    }
    return this.prisma.batch.findMany({
      where,
      include: {
        manufacturer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(
    id: string,
    dto: UpdateBatchDto,
    userId: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const batch = await this.prisma.batch.findUnique({ where: { id } });
    if (!batch) {
      throw new BadRequestException('Batch not found');
    }
    if (!user?.manufacturerId || user.manufacturerId !== batch.manufacturerId) {
      throw new BadRequestException('You can only update your own batches.');
    }

    const updated = await this.prisma.batch.update({
      where: { id },
      data: {
        category: dto.category ?? undefined,
        description: dto.description ?? undefined,
        storageConditions: dto.storageConditions ?? undefined,
      },
      include: { manufacturer: true },
    });

    await this.auditService.log({
      userId,
      action: 'BATCH_UPDATED',
      entity: 'BATCH',
      entityId: id,
      description: `Updated batch ${batch.batchNumber}.`,
      metadata: { changes: dto },
    });

    const audience = await this.prisma.user.findMany({
      where: {
        OR: [
          { role: { in: ['SUPER_ADMIN', 'REGULATOR'] } },
          { manufacturerId: batch.manufacturerId },
        ],
        status: 'ACTIVE',
      },
      select: { id: true },
    });
    for (const u of audience) {
      await this.notificationsService.createNotification({
        userId: u.id,
        title: 'Batch Updated',
        message: `Details for ${batch.drugName} (${batch.batchNumber}) were updated.`,
        type: 'INVENTORY',
        priority: 'LOW',
        actionUrl: '/batches',
        metadata: { batchId: id, batchNumber: batch.batchNumber },
      });
    }

    return updated;
  }

  findOne(id: string) {
    return this.prisma.batch.findUnique({
      where: {
        id,
      },
      include: {
        manufacturer: true,
      },
    });
  }
  async verify(
    qrCode: string,
  ) {
    const batch =
      await this.prisma.batch.findFirst({
        where: {
          qrCode,
        },
        include: {
          manufacturer: true,
          recalls: {
            where: {
              status: 'ACTIVE',
            },
          },
        },
      });

    if (!batch) {
      return {
        authentic: false,
        message: 'Batch not found',
      };
    }

    // Check active recalls first
    const activeRecall =
      batch.recalls[0];

    if (activeRecall) {
      return {
        authentic: true,
        drugName: batch.drugName,
        batchNumber: batch.batchNumber,
        manufacturer: batch.manufacturer.name,
        qrCode: batch.qrCode,
        status: 'RECALLED',
        severity: activeRecall.severity,
        recallReason: activeRecall.reason,
        message:
          'DO NOT DISPENSE - Product Recalled',
      };
    }

    // Check expiry
    const expired =
      batch.expiryDate <
      new Date();

    if (expired) {
      return {
        authentic: true,
        drugName: batch.drugName,
        batchNumber: batch.batchNumber,
        manufacturer: batch.manufacturer.name,
        qrCode: batch.qrCode,
        status: 'EXPIRED',
        message:
          'EXPIRED - Do Not Dispense',
      };
    }

    // Audit Log
    await this.auditService.log({
      action: 'BLOCKCHAIN_VERIFIED',
      entity: 'BATCH',
      entityId: batch.id,
      description: `Verified blockchain integrity for ${batch.batchNumber}.`,
    });

    // Safe medicine
    return {
      authentic: true,
      drugName: batch.drugName,
      batchNumber: batch.batchNumber,
      manufacturer: batch.manufacturer.name,
      qrCode: batch.qrCode,
      status: batch.status,
      blockchainHash: batch.blockchainHash,
      transactionHash: batch.transactionHash,
      message: 'Medicine Verified',
    };
  }
}