import { Injectable } from '@nestjs/common';

import type { Response } from 'express';

import { createObjectCsvStringifier } from 'csv-writer';

import { PrismaService } from '../../prisma/prisma.service';

import { ExportReportDto } from './dto/export-report.dto';

@Injectable()

export class ReportsService {

  constructor(

    private prisma: PrismaService,

  ) {}

  async exportCsv(

    dto: ExportReportDto,

    res: Response,

  ) {

    switch (dto.type) {

      case 'inventory':

        return this.exportInventoryCsv(dto, res);

      case 'transfers':

        return this.exportTransfersCsv(dto, res);

      case 'recalls':

        return this.exportRecallsCsv(dto, res);

      default:

        return res.status(400).send('Invalid report type');

    }

  }

  async exportExcel(

    dto: ExportReportDto,

    res: Response,

  ) {

    return res.send(

      'Excel export coming next.',

    );

  }

  async exportPdf(

    dto: ExportReportDto,

    res: Response,

  ) {

    return res.send(

      'PDF export coming next.',

    );

  }

  private async exportInventoryCsv(

    dto: ExportReportDto,

    res: Response,

    ) {

    const inventories =

        await this.prisma.inventory.findMany({

        include: {

            batch: {

            include: {

                manufacturer: true,

            },

            },

        },

        orderBy: {

            createdAt: 'desc',

        },

        });

    const csv =

        createObjectCsvStringifier({

        header: [

            {

            id: 'drug',

            title: 'Drug',

            },

            {

            id: 'batch',

            title: 'Batch',

            },

            {

            id: 'manufacturer',

            title: 'Manufacturer',

            },

            {

            id: 'quantity',

            title: 'Quantity',

            },

            {

            id: 'status',

            title: 'Status',

            },

            {

            id: 'expiry',

            title: 'Expiry',

            },

        ],

        });

    const records =

        inventories.map(i => ({

        drug:

            i.batch.drugName,

        batch:

            i.batch.batchNumber,

        manufacturer:

            i.batch.manufacturer.name,

        quantity:

            i.quantity,

        status:

            i.batch.status,

        expiry:

            i.batch.expiryDate.toISOString(),

        }));

    const output =

        csv.getHeaderString()

        +

        csv.stringifyRecords(records);

    res.header(

        'Content-Type',

        'text/csv',

    );

    res.attachment(

        'inventory-report.csv',

    );

    return res.send(output);

    }

  private async exportTransfersCsv(

    dto: ExportReportDto,

    res: Response,

    ) {

    const transfers =

        await this.prisma.batchTransfer.findMany({

        include: {

            batch: true,

            fromUser: true,

            toUser: true,

        },

        orderBy: {

            createdAt: 'desc',

        },

        });

    const csv =

        createObjectCsvStringifier({

        header: [

            {

            id: 'batch',

            title: 'Batch',

            },

            {

            id: 'drug',

            title: 'Drug',

            },

            {

            id: 'sender',

            title: 'Sender',

            },

            {

            id: 'receiver',

            title: 'Receiver',

            },

            {

            id: 'quantity',

            title: 'Quantity',

            },

            {

            id: 'status',

            title: 'Status',

            },

            {

            id: 'date',

            title: 'Date',

            },

        ],

        });

    const records =

        transfers.map(t => ({

        batch:

            t.batch.batchNumber,

        drug:

            t.batch.drugName,

        sender:

            t.fromUser.fullName,

        receiver:

            t.toUser.fullName,

        quantity:

            t.quantity,

        status:

            t.status,

        date:

            t.createdAt.toISOString(),

        }));

    const output =

        csv.getHeaderString()

        +

        csv.stringifyRecords(records);

    res.header(

        'Content-Type',

        'text/csv',

    );

    res.attachment(

        'transfer-report.csv',

    );

    return res.send(output);

    }

  private async exportRecallsCsv(

    dto: ExportReportDto,

    res: Response,

    ) {

    const recalls =

        await this.prisma.recall.findMany({

        include: {

            batch: {

            include: {

                manufacturer: true,

            },

            },

        },

        orderBy: {

            createdAt: 'desc',

        },

        });

    const csv =

        createObjectCsvStringifier({

        header: [

            {

            id: 'recall',

            title: 'Recall Number',

            },

            {

            id: 'drug',

            title: 'Drug',

            },

            {

            id: 'batch',

            title: 'Batch',

            },

            {

            id: 'manufacturer',

            title: 'Manufacturer',

            },

            {

            id: 'severity',

            title: 'Severity',

            },

            {

            id: 'status',

            title: 'Status',

            },

            {

            id: 'reason',

            title: 'Reason',

            },

            {

            id: 'date',

            title: 'Created',

            },

        ],

        });

    const records =

        recalls.map(r => ({

        recall:

            r.recallNumber,

        drug:

            r.batch.drugName,

        batch:

            r.batch.batchNumber,

        manufacturer:

            r.batch.manufacturer.name,

        severity:

            r.severity,

        status:

            r.status,

        reason:

            r.reason,

        date:

            r.createdAt.toISOString(),

        }));

    const output =

        csv.getHeaderString()

        +

        csv.stringifyRecords(records);

    res.header(

        'Content-Type',

        'text/csv',

    );

    res.attachment(

        'recall-report.csv',

    );

    return res.send(output);

    }

}