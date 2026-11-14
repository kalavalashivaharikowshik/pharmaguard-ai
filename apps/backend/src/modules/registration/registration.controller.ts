import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';


import {
  Param,
  Patch,
} from '@nestjs/common';

import {
  UseGuards,
} from '@nestjs/common';

import {
  UserRole,
} from '@prisma/client';

import {
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor }
from '@nestjs/platform-express';

import {
  diskStorage,
} from 'multer';

import {
  extname,
} from 'path';

import { JwtAuthGuard }
from '../auth/guards/jwt-auth.guard';

import { RolesGuard }
from '../../common/guards/roles.guard';

import { Roles }
from '../../common/decorators/roles.decorator';

import { RegistrationService } from './registration.service';

import { CreateRegistrationDto } from './dto/create-registration.dto';

import { RejectRegistrationDto } from './dto/reject-registration.dto';

@Controller('registration')
export class RegistrationController {

  constructor(
    private registrationService: RegistrationService,
  ) {}

  @Post()
  register(
    @Body()
    dto: CreateRegistrationDto,
  ) {

    return this.registrationService.register(
      dto,
    );

  }

  @Get()
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    UserRole.SUPER_ADMIN,
  )
  findAll() {

    return this.registrationService.findAll();

  }

  @Patch(':id/approve')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    UserRole.SUPER_ADMIN,
  )
  approve(

    @Param('id')
    id: string,

  ) {

    return this.registrationService.approve(
      id,
    );

  }

  @Patch(':id/reject')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    UserRole.SUPER_ADMIN,
  )
  reject(

    @Param('id')
    id: string,

    @Body()
    dto: RejectRegistrationDto,

  ) {

    return this.registrationService.reject(

      id,

      dto.reason,

    );

  }

  @Get(':id')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    UserRole.SUPER_ADMIN,
  )
  findOne(
    @Param('id')
    id: string,
  ) {

    return this.registrationService.findOne(
      id,
    );

  }

  @Post(':id/document')
  @UseInterceptors(
    FileInterceptor(
      'file',
      {
        storage: diskStorage({

          destination:
            './uploads/registrations',

          filename:
            (
              req,
              file,
              cb,
            ) => {

              cb(

                null,

                `${Date.now()}${extname(
                  file.originalname,
                )}`,

              );

            },

        }),
      },
    ),
  )
  uploadDocument(

    @Param('id')
    id: string,

    @UploadedFile()
    file: Express.Multer.File,

    @Body('documentType')
    documentType: string,

  ){

    return this.registrationService
    .uploadDocument(

      id,

      file,

      documentType,

    );

  }

  @Get(':id/documents')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    UserRole.SUPER_ADMIN,
  )
  getDocuments(

    @Param('id')
    id: string,

  ) {

    return this.registrationService.getDocuments(
      id,
    );

  }

}