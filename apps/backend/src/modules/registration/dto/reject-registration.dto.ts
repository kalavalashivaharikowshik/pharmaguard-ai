import {
  IsString,
} from 'class-validator';

export class RejectRegistrationDto {

  @IsString()
  reason!: string;

}