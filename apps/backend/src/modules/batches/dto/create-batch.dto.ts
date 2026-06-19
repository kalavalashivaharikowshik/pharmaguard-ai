import {
  IsDateString,
  IsInt,
  IsString,
  Min,
} from 'class-validator';

export class CreateBatchDto {
  @IsString()
  drugName!: string;

  @IsString()
  batchNumber!: string;

  @IsDateString()
  manufactureDate!: string;

  @IsDateString()
  expiryDate!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}