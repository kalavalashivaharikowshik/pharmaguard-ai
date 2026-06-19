import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ManufacturersModule } from './modules/manufacturers/manufacturers.module';
import { BatchesModule } from './modules/batches/batches.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    AuthModule,
    UsersModule,
    ManufacturersModule,
    BatchesModule,
  ],
})
export class AppModule {}