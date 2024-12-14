import { Body, Controller, Post } from '@nestjs/common';
import { AppService, UpdateStatus } from './app.service';
import { NftDto } from './dto/NFTDto';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@common/config';
import { PestDto } from './dto/PESTDto';

@Controller('agridot')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService<AppConfig>,
  ) {}

  @Post('guide')
  async getGuide(@Body() nft: NftDto): Promise<{ status: UpdateStatus }> {
    const collection = this.configService.get('GUIDE_COLLECTION');
    const status = await this.appService.mintNFT(nft, collection);
    return { status };
  }

  @Post('pest')
  async getPest(@Body() nft: NftDto): Promise<{ status: UpdateStatus }> {
    const collection = this.configService.get('PEST_COLLECTION');
    const status = await this.appService.mintNFT(nft, collection);
    return { status };
  }

  @Post('nearby/pests')
  getNearbyPest(@Body() pest: PestDto) {
    return this.appService.getNearbyPests(pest);
  }

  @Post('like')
  like(): string {
    return 'Liked!';
  }
}
