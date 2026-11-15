import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ScanService } from './scan.service';

class ScanDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  code!: string;
}

@ApiTags('Scan')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('scan')
export class ScanController {
  constructor(private scan: ScanService) {}

  /** Mobile scanner: full safety verdict for a QR code or batch number. */
  @Post()
  verify(@Body() dto: ScanDto, @CurrentUser() user: any) {
    return this.scan.scan(dto.code, user.userId);
  }
}
