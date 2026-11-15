import { Injectable } from '@nestjs/common';
import { NotificationPriority, ViolationType } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

/** Records compliance violations (blocked sales, tampering, overdue recalls). */
@Injectable()
export class ViolationsService {
  constructor(private prisma: PrismaService) {}

  record(data: {
    type: ViolationType;
    description: string;
    severity?: NotificationPriority;
    batchId?: string | null;
    userId?: string | null;
    metadata?: any;
  }) {
    return this.prisma.violation.create({
      data: {
        type: data.type,
        description: data.description,
        severity: data.severity ?? 'HIGH',
        batchId: data.batchId ?? null,
        userId: data.userId ?? null,
        metadata: data.metadata,
      },
    });
  }
}
