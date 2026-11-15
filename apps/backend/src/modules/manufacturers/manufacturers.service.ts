import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateManufacturerDto, UpdateManufacturerDto } from './dto/create-manufacturer.dto';

@Injectable()
export class ManufacturersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateManufacturerDto) {
    const existing = await this.prisma.manufacturer.findUnique({
      where: { licenseNumber: dto.licenseNumber },
    });
    if (existing) {
      throw new BadRequestException('License number already exists');
    }
    return this.prisma.manufacturer.create({ data: dto });
  }

  findAll() {
    return this.prisma.manufacturer.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { batches: true, users: true } } },
    });
  }

  async findOne(id: string) {
    const m = await this.prisma.manufacturer.findUnique({
      where: { id },
      include: {
        _count: { select: { batches: true, users: true } },
        users: { select: { id: true, fullName: true, email: true, status: true } },
        batches: {
          select: { id: true, batchNumber: true, drugName: true, status: true, expiryDate: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!m) throw new NotFoundException('Manufacturer not found');
    return m;
  }

  async update(id: string, dto: UpdateManufacturerDto) {
    await this.findOne(id);
    return this.prisma.manufacturer.update({ where: { id }, data: dto });
  }

  /** Only manufacturers without batches or users can be deleted (keeps the audit trail intact). */
  async remove(id: string) {
    const m = await this.findOne(id);
    if (m._count.batches > 0 || m._count.users > 0) {
      throw new BadRequestException('Manufacturer has batches or users and cannot be deleted.');
    }
    await this.prisma.manufacturer.delete({ where: { id } });
    return { deleted: true };
  }
}
