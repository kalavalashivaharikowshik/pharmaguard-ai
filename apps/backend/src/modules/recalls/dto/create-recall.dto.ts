import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  RecallSeverity,
  RecallStatus,
} from '@prisma/client';

export class CreateRecallDto {
  /** Optional: generated automatically (RCL-YYYY-XXXX) when omitted. */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  recallNumber?: string;

  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  reason!: string;

  @IsEnum(RecallSeverity)
  severity!: RecallSeverity;

  @IsString()
  batchId!: string;
}

export class UpdateRecallDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  reason?: string;

  @IsOptional()
  @IsEnum(RecallSeverity)
  severity?: RecallSeverity;

  @IsOptional()
  @IsEnum(RecallStatus)
  status?: RecallStatus;
}
