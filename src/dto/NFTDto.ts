import { IsNotEmpty, IsString } from 'class-validator';

export class NftDto {
  @IsNotEmpty()
  @IsString()
  owner: string;
  @IsNotEmpty()
  @IsString()
  metadata: string;
}
