import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum DisposalUpdateStatus {
  RETURNED = 'RETURNED',
  DESTROYED = 'DESTROYED',
}

export class UpdateDisposalDto {
  @IsEnum(DisposalUpdateStatus)
  status!: DisposalUpdateStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  /** Free-text evidence such as a disposal certificate number or photo URL. */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  evidence?: string;
}
