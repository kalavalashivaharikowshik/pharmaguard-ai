import {
  IsOptional,
  IsString,
} from 'class-validator';

export class AnalyticsFilterDto {

  @IsOptional()
  @IsString()
  year?: string;

}