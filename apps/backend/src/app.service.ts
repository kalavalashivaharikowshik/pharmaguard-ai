import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {

  getHello(): string {

    return 'PharmaGuard API is running';

  }

}