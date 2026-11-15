import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
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

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  storageConditions?: string;
}
/**
 * Only descriptive fields can change after creation. Batch number, drug name,
 * dates and quantity are part of the blockchain fingerprint, so editing them
 * would (correctly) be detected as tampering.
 */
export class UpdateBatchDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  storageConditions?: string;
}
