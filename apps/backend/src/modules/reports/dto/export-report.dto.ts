import {
  IsIn,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class ExportReportDto {

  @IsIn([
    'inventory',
    'transfers',
    'recalls',
  ])
  type!: 'inventory' | 'transfers' | 'recalls';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

}