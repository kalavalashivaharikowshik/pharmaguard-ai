import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DisposalService } from './disposal.service';
import { UpdateDisposalDto } from './dto/update-disposal.dto';

@ApiTags('Disposal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('disposals')
export class DisposalController {
  constructor(private disposal: DisposalService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.disposal.findAll(user.userId, user.role);
  }

  @Get('summary')
  summary(@CurrentUser() user: any) {
    return this.disposal.summary(user.userId, user.role);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDisposalDto, @CurrentUser() user: any) {
    return this.disposal.update(id, dto, user.userId, user.role);
  }
}
