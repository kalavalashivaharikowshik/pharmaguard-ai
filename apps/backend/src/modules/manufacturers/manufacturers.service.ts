import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateManufacturerDto } from './dto/create-manufacturer.dto';

@Injectable()
export class ManufacturersService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(
    dto: CreateManufacturerDto,
  ) {
    const existing =
      await this.prisma.manufacturer.findUnique({
        where: {
          licenseNumber:
            dto.licenseNumber,
        },
      });

    if (existing) {
      throw new BadRequestException(
        'License number already exists',
      );
    }

    return this.prisma.manufacturer.create({
      data: dto,
    });
  }

  findAll() {
    return this.prisma.manufacturer.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: string) {
    return this.prisma.manufacturer.findUnique({
      where: { id },
    });
  }
}