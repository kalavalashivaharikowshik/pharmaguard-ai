import {
  Injectable,
  Logger,
} from '@nestjs/common';

import {
  initializeApp,
  cert,
  getApps,
} from 'firebase-admin/app';

import {
  getMessaging,
} from 'firebase-admin/messaging';

import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseService {

  private readonly logger =
    new Logger(FirebaseService.name);

  constructor() {

    if (getApps().length) {
      return;
    }

    const keyPath = path.join(
      process.cwd(),
      'firebase',
      'serviceAccountKey.json',
    );

    if (!fs.existsSync(keyPath)) {

      this.logger.warn(
        'Firebase serviceAccountKey.json not found. Push notifications are disabled.',
      );

      return;

    }

    const serviceAccount = JSON.parse(
      fs.readFileSync(
        keyPath,
        'utf8',
      ),
    );

    initializeApp({

      credential: cert(serviceAccount),

    });

    this.logger.log(
      'Firebase initialized successfully.',
    );

  }

  getMessaging() {

    return getMessaging();

  }

}