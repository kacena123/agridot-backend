import axios from 'axios';

const PINATA_API_URL = 'https://api.pinata.cloud';

export class PinataService {
  private jwt: string;
  private gatewayUrl: string;

  constructor(jwt: string, gatewayUrl: string) {
    this.jwt = jwt;
    this.gatewayUrl = gatewayUrl;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.jwt}`,
    };
  }

  async uploadJSON(data: any) {
    try {
      const response = await axios.post(
        `${PINATA_API_URL}/pinning/pinJSONToIPFS`,
        data,
        {
          headers: {
            ...this.headers,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      return {
        success: true,
        ipfsHash: response.data.IpfsHash,
        pinataUrl: `https://${this.gatewayUrl}/ipfs/${response.data.IpfsHash}`,
      };
    } catch (error) {
      console.error('Pinata upload error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upload to Pinata',
      );
    }
  }
}
