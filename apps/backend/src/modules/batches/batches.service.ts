import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateBatchDto } from './dto/create-batch.dto';
import { QrService } from './qr/qr.service';

@Injectable()
export class BatchesService {
  constructor(
    private prisma: PrismaService,
    private qrService: QrService,
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

    // Generate QR
    const qr =
      await this.qrService.generateBatchQR(
        batch.id,
        batch.batchNumber,
      );

    // Save QR identity to database
    const updatedBatch =
      await this.prisma.batch.update({
        where: {
          id: batch.id,
        },
        data: {
          qrCode: qr.qrIdentity,
        },
      });

    return updatedBatch;
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
  async verify(qrCode: string) {
    const batch =
      await this.prisma.batch.findFirst({
        where: {
          qrCode,
        },
        include: {
          manufacturer: true,
        },
      });

    if (!batch) {
      return {
        authentic: false,
        message: 'Batch not found',
      };
    }

    return {
      authentic: true,
      drugName: batch.drugName,
      batchNumber: batch.batchNumber,
      status: batch.status,
      expiryDate: batch.expiryDate,
      manufacturer:
        batch.manufacturer.name,
      qrCode: batch.qrCode,
    };
  }
}
  