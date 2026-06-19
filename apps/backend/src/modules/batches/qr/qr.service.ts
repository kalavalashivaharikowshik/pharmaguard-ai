import { Injectable } from '@nestjs/common';

import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class QrService {
  async generateBatchQR(
    batchId: string,
    batchNumber: string,
  ) {
    const qrIdentity =
      `PG-${batchNumber}`;

    const folderPath =
      path.join(
        process.cwd(),
        'uploads',
        'qr-codes',
      );

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, {
        recursive: true,
      });
    }

    const fileName =
      `${batchId}.png`;

    const filePath =
      path.join(
        folderPath,
        fileName,
      );

    await QRCode.toFile(
      filePath,
      qrIdentity,
    );

    return {
      qrIdentity,
      qrCodePath: fileName,
    };
  }
}