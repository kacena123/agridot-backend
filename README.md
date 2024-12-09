# AgriDot backend

[AGRIDOT LOGO]

## Description

Following Backend serves for counting the guide likes, creating guides, pest reports and for retrieving nearby pests.

### Required .env
The backend requires following .env setup:
```
# Collection ID that will house minting of pest nfts
PEST_COLLECTION=1
# Collection ID that will house minting of guide nfts
GUIDE_COLLECTION=2
# Wallet mnemonic, that will handle creating NFTs
WALLET_MNEMONIC=word word word word word word word word word word word word
# Secret phrase that serves to encrypt pest reports. This phrase is server use only. So do not expose it to application.
ENCRYPTION_PHRASE=phrase
# Secret phrase to decrypt data in encrypted exchange between application and server.
DECRYPTION_PHRASE=phrase 
# Node endpoint
WSS_ENDPOINT: string;
# Server startup port
PORT: string;
# Pinata JWT token for pest and guide data uploads
PINATA_JWT=string
# Pinata gateway url for pest and guide data uploads
GATEWAY_URL=mypinata.cloud
```

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run dockerized version of BE
To run Backend in Docker container acting on regular port 3000 run following commands:
```
//1. Clone the repository
//2. Build the docker image
docker build -t agridot-be .
//3. Run the docker container and expose port 3000
docker run -p 3000:3000 --env-file .env -it --rm agridot-be 
//4. Download ngrok
https://download.ngrok.com/
//5. Use ngrok with the port 3000 exposed from backend
ngrok http 3000
```

## Run tests

```bash
# unit tests
$ npm run test
```
