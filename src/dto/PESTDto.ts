import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PestDto {
  @IsNotEmpty()
  @IsString({ each: true })
  locations: string[];
}
