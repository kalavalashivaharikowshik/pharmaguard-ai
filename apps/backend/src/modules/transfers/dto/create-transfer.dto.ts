import {
  IsInt,
  IsString,
  Min,
} from 'class-validator';

export class CreateTransferDto {
  @IsString()
  batchId!: string;

  @IsString()
  toUserId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}