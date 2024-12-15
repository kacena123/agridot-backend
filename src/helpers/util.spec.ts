import {
  calculateDistance,
  encryptMessage,
  decryptMessage,
  decryptPestArray,
  encryptPests,
} from './util';
import { ConfigService } from '@nestjs/config';

jest.mock('@nestjs/config');

const mockConfigService = {
  get: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('calculateDistance', () => {
  test('should calculate the correct distance between two points', () => {
    const lat1 = 40.7128;
    const lon1 = -74.006;
    const lat2 = 34.0522;
    const lon2 = -118.2437;

    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    expect(distance).toBeCloseTo(3935.5, 0); // Approximate distance in kilometers
  });
});

describe('encryptMessage', () => {
  test('should encrypt a message correctly', () => {
    mockConfigService.get.mockReturnValue('test_encryption_key');
    jest
      .spyOn(ConfigService.prototype, 'get')
      .mockImplementation(mockConfigService.get);

    const encrypted = encryptMessage('name', 'description', 'img', 'type');
    expect(encrypted.encryptedName).not.toBe('name');
    expect(encrypted.encryptedDesc).not.toBe('description');
    expect(encrypted.encryptedImg).not.toBe('img');
    expect(encrypted.encryptedType).not.toBe('type');
  });
});

describe('decryptMessage', () => {
  test('should decrypt a message correctly', () => {
    mockConfigService.get.mockReturnValue('test_decryption_key');
    jest
      .spyOn(ConfigService.prototype, 'get')
      .mockImplementation(mockConfigService.get);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const CryptoJS = require('crypto-js');
    const encryptedMessage = CryptoJS.AES.encrypt(
      'test_message',
      'test_decryption_key',
    ).toString();
    const decrypted = decryptMessage(encryptedMessage);

    expect(decrypted).toBe('test_message');
  });
});

describe('decryptPestArray', () => {
  test('should decrypt all fields in the pest object correctly', () => {
    mockConfigService.get.mockReturnValue('test_encryption_key');
    jest
      .spyOn(ConfigService.prototype, 'get')
      .mockImplementation(mockConfigService.get);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const CryptoJS = require('crypto-js');
    const pest = {
      description: CryptoJS.AES.encrypt(
        'desc',
        'test_encryption_key',
      ).toString(),
      name: CryptoJS.AES.encrypt('name', 'test_encryption_key').toString(),
      type: CryptoJS.AES.encrypt('type', 'test_encryption_key').toString(),
      image: CryptoJS.AES.encrypt('image', 'test_encryption_key').toString(),
    };

    const decrypted = decryptPestArray(pest);

    expect(decrypted.originalDesc).toBe('desc');
    expect(decrypted.originalName).toBe('name');
    expect(decrypted.originalImage).toBe('image');
  });
});

describe('encryptPests', () => {
  test('should encrypt all fields in the pest object correctly', () => {
    mockConfigService.get.mockReturnValue('test_decryption_key');
    jest
      .spyOn(ConfigService.prototype, 'get')
      .mockImplementation(mockConfigService.get);

    const pest = {
      description: 'desc',
      name: 'name',
      type: 'type',
      image: 'image',
    };

    const encrypted = encryptPests(pest);

    expect(encrypted.encryptedDesc).not.toBe('desc');
    expect(encrypted.encryptedName).not.toBe('name');
    expect(encrypted.encryptedImg).not.toBe('image');
  });
});
