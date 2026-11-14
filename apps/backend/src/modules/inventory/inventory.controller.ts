import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

import { RolesGuard } from '../../common/guards/roles.guard';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(
    private inventoryService: InventoryService,
  ) {}

  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMyInventory(
    @CurrentUser()
    user: any,
  ) {
    return this.inventoryService.getMyInventory(
      user.userId,
    );
  }

  @Get('batch/:batchId')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  getBatchInventory(
    @Param('batchId')
    batchId: string,
  ) {
    return this.inventoryService.getBatchInventory(
      batchId,
    );
  }

  @Get('network')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    UserRole.REGULATOR,
    UserRole.SUPER_ADMIN,
  )
  getNetworkInventory() {
    return this.inventoryService.getNetworkInventory();
  }
}