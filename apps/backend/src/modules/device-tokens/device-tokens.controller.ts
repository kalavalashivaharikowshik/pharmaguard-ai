import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CurrentUser } from '../../common/decorators/current-user.decorator';

import { DeviceTokensService } from './device-tokens.service';

import { RegisterDeviceDto } from './dto/register-device.dto';

@Controller('device-tokens')
export class DeviceTokensController {

  constructor(

    private deviceTokensService: DeviceTokensService,

  ) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  register(

    @CurrentUser()
    user: any,

    @Body()
    dto: RegisterDeviceDto,

  ) {

    return this.deviceTokensService.register(

      user.userId,

      dto,

    );

  }

  @Delete(':token')
  @UseGuards(JwtAuthGuard)
  remove(

    @Param('token')
    token: string,

  ) {

    return this.deviceTokensService.remove(token);

  }

}