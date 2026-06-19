import {
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateManufacturerDto {
  @IsString()
  name: string;

  @IsString()
  licenseNumber: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;
}