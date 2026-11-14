import {
  IsEnum,
  IsString,
} from 'class-validator';

import {
  RecallSeverity,
} from '@prisma/client';

export class CreateRecallDto {
  @IsString()
  recallNumber!: string;

  @IsString()
  reason!: string;

  @IsEnum(RecallSeverity)
  severity!: RecallSeverity;

  @IsString()
  batchId!: string;
}