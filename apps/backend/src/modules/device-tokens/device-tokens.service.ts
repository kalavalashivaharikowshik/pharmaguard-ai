import {
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { RegisterDeviceDto } from './dto/register-device.dto';

@Injectable()
export class DeviceTokensService {

  constructor(
    private prisma: PrismaService,
  ) {}

  async register(
    userId: string,
    dto: RegisterDeviceDto,
  ) {

    return this.prisma.deviceToken.upsert({

      where: {

        token: dto.token,

      },

      update: {

        platform: dto.platform,

        deviceName: dto.deviceName,

        userId,

      },

      create: {

        token: dto.token,

        platform: dto.platform,

        deviceName: dto.deviceName,

        userId,

      },

    });

  }

  async remove(
    token: string,
  ) {

    return this.prisma.deviceToken.delete({

      where: {

        token,

      },

    });

  }

}