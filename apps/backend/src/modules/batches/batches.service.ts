import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateBatchDto } from './dto/create-batch.dto';
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

    console.log('JWT USER ID:', userId);
    console.log('DB USER:', user);

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

  findAll() {
    return this.prisma.batch.findMany({
      include: {
        manufacturer: true,
      },
    });
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