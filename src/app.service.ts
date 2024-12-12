import { Injectable } from '@nestjs/common';
import { NftDto } from './dto/NFTDto';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@common/config';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { PestDto } from './dto/PESTDto';
import { getClient } from '@kodadot1/uniquery';
import { PinataService } from './helpers/pinata';
import {
  calculateDistance,
  decryptMessage,
  decryptPestArray,
  encryptMessage,
  encryptPests,
} from './helpers/util';

export enum UpdateStatus {
  Success = 'Success',
  Failed = 'Failed',
  FailedNoId = 'FailedNoId',
}

@Injectable()
export class AppService {
  constructor(private configService: ConfigService<AppConfig>) {}

  async mintNFT(nft: NftDto, collectionId: number): Promise<UpdateStatus> {
    const { owner, metadata } = nft;

    let updateStatus: UpdateStatus;
    const collectionID = collectionId;

    const AgriDotWallet = this.configService.get('WALLET_MNEMONIC');
    const wallet = new Keyring({ type: 'sr25519' });
    const substrateSigner = wallet.addFromUri(AgriDotWallet);
    let usedMetadata;

    //Decrypt the metadata
    const originalMetadata = decryptMessage(metadata);
    if (collectionId == this.configService.get('PEST_COLLECTION')) {
      //Encrypt the metadata with agridot encryption phrase
      const meta = await fetch(
        originalMetadata.replace(
          'ipfs://',
          'https://apricot-accurate-leech-751.mypinata.cloud/ipfs/',
        ),
      );
      const origMeta = await meta.json();

      const description = origMeta.description;
      const img = origMeta.image;
      const name = origMeta.name;
      const type = origMeta.type;

      const { encryptedName, encryptedDesc, encryptedImg, encryptedType } =
        encryptMessage(name, description, img, type);

      const body = JSON.stringify({
        name: encryptedName,
        description: encryptedDesc,
        image: encryptedImg,
        animation_url: '',
        attributes: [],
        external_url: 'agridot-web3',
        type: encryptedType,
      });
      const pinataService = new PinataService(
        this.configService.get('PINATA_JWT'),
        this.configService.get('GATEWAY_URL'),
      );

      const encrypMeta = await pinataService.uploadJSON(body);

      usedMetadata = 'ipfs://' + encrypMeta.ipfsHash;
    } else {
      usedMetadata = originalMetadata;
    }

    const wsProvider = new WsProvider('wss://asset-hub-paseo-rpc.dwellir.com');
    const api = await ApiPromise.create({ provider: wsProvider });

    let nextItemId = 0;
    try {
      const items = await api.query.nfts.item.entries(collectionID.toString());
      const formattedItems: [string[], any][] = items.map(([key, value]) => {
        const itemId = key.args.map((arg) => arg.toHuman() as string);
        const itemDetails = value.toHuman();
        return [itemId, itemDetails];
      });
      // Ensure the next item id does not already exist
      while (
        formattedItems.some((item) => item[0][1] === nextItemId.toString())
      ) {
        nextItemId += 1;
      }
    } catch (error) {
      console.log('Error getting NFT id', error);
      return UpdateStatus.Failed;
    }

    const create = api.tx.nfts.mint(collectionID, nextItemId, owner, null);
    const assignMetadata = api.tx.nfts.setMetadata(
      collectionID,
      nextItemId,
      usedMetadata,
    );

    const calls: SubmittableExtrinsic<'promise'>[] = [create, assignMetadata];
    console.log(nextItemId);
    const batchAllTx = api.tx.utility.batchAll(calls);

    await new Promise((resolve, reject) => {
      batchAllTx.signAndSend(
        substrateSigner,
        async ({ status, dispatchError }) => {
          if (status.isFinalized) {
            if (dispatchError) {
              if (dispatchError.isModule) {
                const decoded = api.registry.findMetaError(
                  dispatchError.asModule,
                );
                const { docs, name, section } = decoded;
                reject(new Error(`${section}.${name}: ${docs.join(' ')}`));
              } else {
                reject(new Error(dispatchError.toString()));
              }
            } else {
              console.log('NFT minted');
              resolve((updateStatus = UpdateStatus.Success));
            }
          }
        },
      );
    });
    if (updateStatus === UpdateStatus.Success) {
      return UpdateStatus.Success;
    }
    return UpdateStatus.Failed;
  }

  async getNearbyPests(pests: PestDto): Promise<any> {
    const { locations, threshold } = pests;

    const client = getClient('ahk' as any);
    const query = client.itemListByCollectionId(
      this.configService.get('PEST_COLLECTION'),
    );
    try {
      const result = await client.fetch<any>(query);
      console.log(result.data?.items);
      const pestArray = [];
      //Go through items, and save them into an array
      for (let i = 0; i < result.data?.items.length; i++) {
        const item = result.data?.items[i];
        const itemMetadata = item.metadata;
        pestArray.push(JSON.parse(itemMetadata));
      }

      //Decrypt the metadata in pestArray
      for (let i = 0; i < pestArray.length; i++) {
        const pest = pestArray[i];
        const fetched = await fetch(
          pest.replace(
            'ipfs://',
            'https://apricot-accurate-leech-751.mypinata.cloud/ipfs/',
          ),
        );
        const fetchedPest = await fetched.json();

        const { originalDesc, originalName, originalType, originalImage } =
          decryptPestArray(fetchedPest);

        pestArray[i].description = originalDesc;
        pestArray[i].name = originalName;
        pestArray[i].type = originalType;
        pestArray[i].image = originalImage;
      }
      //Go through pestArray and compare the distance between the pests and the locations. Also create new array with pests that are within the threshold
      const nearbyPests: { [key: string]: any[] } = {};

      for (let i = 0; i < locations.length; i++) {
        const location = locations[i];
        for (let j = 0; j < pestArray.length; j++) {
          const pest = pestArray[j];
          const pestLocation = pest.description
            .match(/\[Location\](.*?)\[Description\]/)?.[1]
            ?.trim();
          const locationSplit = location.split(' ');
          const lat1 = parseFloat(locationSplit[0]);
          const lon1 = parseFloat(locationSplit[1]);
          const pestSplit = pestLocation.split(' ');
          const lat2 = parseFloat(pestSplit[0]);
          const lon2 = parseFloat(pestSplit[1]);
          const distance = calculateDistance(lat1, lon1, lat2, lon2);
          if (distance <= threshold) {
            //The structure of nearby pests should be following: {location1: [pest1, pest2, ...], location2: [pest1, pest2, ...], ...}
            //Remove Location from the description and only keep [Description] tag
            pest.description = pest.description.replace(
              /\[Location\](.*?)\[Description\]/,
              '[Description]',
            );

            pest.description = distance.toString() + pest.description;
            if (location in nearbyPests) {
              nearbyPests[location].push(pest);
            } else {
              nearbyPests[location] = [pest];
            }
          }
        }
      }
      //Encrypt nearbyPests
      for (const location in nearbyPests) {
        for (let i = 0; i < nearbyPests[location].length; i++) {
          const pest = nearbyPests[location][i];
          const { encryptedName, encryptedDesc, encryptedImg, encryptedType } =
            encryptPests(pest);
          pest.description = encryptedDesc;
          pest.name = encryptedName;
          pest.type = encryptedType;
          pest.image = encryptedImg;
        }
      }
      return nearbyPests;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
