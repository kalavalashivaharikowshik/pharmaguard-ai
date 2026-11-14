import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import {
  UserRole,
} from '@prisma/client';

export class CreateRegistrationDto {

  @IsString()
  organizationName!: string;

  @IsString()
  contactPerson!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  licenseNumber!: string;

  @IsEnum(UserRole)
  role!: UserRole;

}