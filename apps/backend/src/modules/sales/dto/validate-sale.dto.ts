import { IsString } from 'class-validator';

export class ValidateSaleDto {
  @IsString()
  qrCode!: string;
}