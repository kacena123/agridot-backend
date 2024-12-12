import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService, UpdateStatus } from './app.service';
import { ConfigService } from '@nestjs/config';
import { NftDto } from './dto/NFTDto';
import { PestDto } from './dto/PESTDto';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            mintNFT: jest.fn(),
            getNearbyPests: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('getGuide', () => {
    it('should call mintNFT with the correct arguments and return status', async () => {
      const nft: NftDto = { owner: '1', metadata: 's' };
      const mockStatus: UpdateStatus = UpdateStatus.Success;

      jest.spyOn(configService, 'get').mockReturnValue('GUIDE_COLLECTION_ID');
      jest.spyOn(appService, 'mintNFT').mockResolvedValue(mockStatus);

      const result = await appController.getGuide(nft);

      expect(configService.get).toHaveBeenCalledWith('GUIDE_COLLECTION');
      expect(appService.mintNFT).toHaveBeenCalledWith(
        nft,
        'GUIDE_COLLECTION_ID',
      );
      expect(result).toEqual({ status: mockStatus });
    });
  });

  describe('getPest', () => {
    it('should call mintNFT with the correct arguments and return status', async () => {
      const nft: NftDto = { owner: '1', metadata: 's' };
      const mockStatus: UpdateStatus = UpdateStatus.Success;

      jest.spyOn(configService, 'get').mockReturnValue('PEST_COLLECTION_ID');
      jest.spyOn(appService, 'mintNFT').mockResolvedValue(mockStatus);

      const result = await appController.getPest(nft);

      expect(configService.get).toHaveBeenCalledWith('PEST_COLLECTION');
      expect(appService.mintNFT).toHaveBeenCalledWith(
        nft,
        'PEST_COLLECTION_ID',
      );
      expect(result).toEqual({ status: mockStatus });
    });
  });

  describe('getNearbyPest', () => {
    it('should call getNearbyPests with the correct arguments and return the result', async () => {
      const pest: PestDto = { locations: ['0 0'], threshold: 0 };
      const mockNearbyPests = {};

      jest
        .spyOn(appService, 'getNearbyPests')
        .mockResolvedValue(mockNearbyPests);

      const result = await appController.getNearbyPest(pest);

      expect(appService.getNearbyPests).toHaveBeenCalledWith(pest);
      expect(result).toEqual(mockNearbyPests);
    });
  });

  describe('like', () => {
    it('should return "Liked!"', () => {
      const result = appController.like();
      expect(result).toBe('Liked!');
    });
  });
});
