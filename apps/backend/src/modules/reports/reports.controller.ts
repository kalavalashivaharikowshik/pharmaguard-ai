import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';

import type { Response } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../../common/guards/roles.guard';

import { Roles } from '../../common/decorators/roles.decorator';

import { ReportsService } from './reports.service';

import { ExportReportDto } from './dto/export-report.dto';

@Controller('reports')

@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)

export class ReportsController {

  constructor(

    private reportsService: ReportsService,

  ) {}

  @Get('export/csv')

  @Roles(
    'SUPER_ADMIN',
    'REGULATOR',
  )

  async exportCsv(

    @Query()
    dto: ExportReportDto,

    @Res()
    res: Response,

  ) {

    return this.reportsService.exportCsv(

      dto,

      res,

    );

  }

  @Get('export/excel')

  @Roles(
    'SUPER_ADMIN',
    'REGULATOR',
  )

  async exportExcel(

    @Query()
    dto: ExportReportDto,

    @Res()
    res: Response,

  ) {

    return this.reportsService.exportExcel(

      dto,

      res,

    );

  }

  @Get('export/pdf')

  @Roles(
    'SUPER_ADMIN',
    'REGULATOR',
  )

  async exportPdf(

    @Query()
    dto: ExportReportDto,

    @Res()
    res: Response,

  ) {

    return this.reportsService.exportPdf(

      dto,

      res,

    );

  }

}