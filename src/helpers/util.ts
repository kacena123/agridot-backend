import { AppConfig } from '@common/config';
import { ConfigService } from '@nestjs/config';

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const toRadians = (degree: number) => degree * (Math.PI / 180);
  console.log(lat1, lon1, lat2, lon2);
  // Convert latitude and longitude from degrees to radians
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

//Encryption with agridotkey
export function encryptMessage(
  name: string,
  description: string,
  img: string,
  type: string,
) {
  const configService = new ConfigService<AppConfig>();
  const agridotkey = configService.get('ENCRYPTION_PHRASE');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const CryptoJS = require('crypto-js');

  const encryptedDesc = CryptoJS.AES.encrypt(
    description,
    agridotkey,
  ).toString();
  const encryptedImg = CryptoJS.AES.encrypt(img, agridotkey).toString();
  const encryptedName = CryptoJS.AES.encrypt(name, agridotkey).toString();
  const encryptedType = CryptoJS.AES.encrypt(type, agridotkey).toString();

  return { encryptedName, encryptedDesc, encryptedImg, encryptedType };
}

//Decryption with decryption phrase
export function decryptMessage(message: string) {
  const configService = new ConfigService<AppConfig>();
  const key = configService.get('DECRYPTION_PHRASE');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const CryptoJS = require('crypto-js');
  const bytes = CryptoJS.AES.decrypt(message, key);
  const originalMessage = bytes.toString(CryptoJS.enc.Utf8);
  return originalMessage;
}

export function decryptPestArray(fetchedPest: any) {
  const configService = new ConfigService<AppConfig>();
  const key = configService.get('ENCRYPTION_PHRASE');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const CryptoJS = require('crypto-js');
  const bytesDesc = CryptoJS.AES.decrypt(fetchedPest.description, key);
  const originalDesc = bytesDesc.toString(CryptoJS.enc.Utf8);
  const bytesName = CryptoJS.AES.decrypt(fetchedPest.name, key);
  const originalName = bytesName.toString(CryptoJS.enc.Utf8);
  const bytesImage = CryptoJS.AES.decrypt(fetchedPest.image, key);
  const originalImage = bytesImage.toString(CryptoJS.enc.Utf8);

  return { originalDesc, originalName, originalImage };
}

export function encryptPests(pest: any) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const CryptoJS = require('crypto-js');
  const configService = new ConfigService<AppConfig>();
  const agridotkey = configService.get('DECRYPTION_PHRASE');
  const bytesDesc = CryptoJS.AES.encrypt(
    pest.description,
    agridotkey,
  ).toString();
  const bytesName = CryptoJS.AES.encrypt(pest.name, agridotkey).toString();
  const bytesDate = CryptoJS.AES.encrypt(pest.date, agridotkey).toString();
  const bytesImage = CryptoJS.AES.encrypt(pest.image, agridotkey).toString();

  return {
    encryptedName: bytesName,
    encryptedDesc: bytesDesc,
    encryptedImg: bytesImage,
    encryptedDate: bytesDate,
  };
}
