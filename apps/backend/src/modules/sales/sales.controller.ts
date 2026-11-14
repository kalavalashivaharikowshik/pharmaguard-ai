import {
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CurrentUser } from '../../common/decorators/current-user.decorator';

import { SalesService } from './sales.service';

import { ValidateSaleDto } from './dto/validate-sale.dto';

@Controller('sales')
export class SalesController {

  constructor(
    private salesService: SalesService,
  ) {}

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  validateSale(

    @Body()
    dto: ValidateSaleDto,

    @CurrentUser()
    user: any,

  ) {

    return this.salesService.validateSale(

      dto,

      user.userId,

    );

  }

}