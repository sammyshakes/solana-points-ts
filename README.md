# Solana Points System

This project implements a simple points system on the Solana blockchain, allowing for the creation of brand-specific token mints and the minting of tokens to users.

## Installation

1. Clone the repository:

   ```
   git clone git@github.com:tronicapp/solana-points-ts.git
   cd solana-points-ts
   ```

2. Install dependencies:
   ```
   npm install --save-dev typescript ts-node @types/node
   npm install @solana/web3.js @solana/spl-token yargs dotenv
   ```

## Configuration

This project includes a pre-configured admin wallet for use on the Solana devnet. The keypair is stored in `admin_keypair.json`.

**Important:** This keypair is for testing purposes only. In a production environment, you should never commit private keys to a repository.

The project is set up to use Solana's devnet. If you need to change this, modify the `SOLANA_NETWORK` variable in the `.env` file.

## Usage

The project consists of two main scripts:

1. `wallet-manager.ts`: For managing the admin wallet
2. `solana-points.ts`: For creating brand mints and managing tokens

### Wallet Manager

Check the admin wallet balance:

```
npx ts-node src/wallet-manager.ts check-balance
```

### Solana Points System

1. Create a new brand mint:

   ```
   npx ts-node src/solana-points.ts create-brand "Brand Name" SYMBOL
   ```

   Replace "Brand Name" with your desired brand name and SYMBOL with a short ticker symbol.

2. Mint tokens to a user:

   ```
   npx ts-node src/solana-points.ts mint-tokens <brand-mint-address> <user-wallet-address> <amount>
   ```

   Replace `<brand-mint-address>` with the address output from the create-brand command, `<user-wallet-address>` with the recipient's Solana wallet address, and `<amount>` with the number of tokens to mint.

3. Check a user's token balance:

   ```
   npx ts-node src/solana-points.ts get-balance <brand-mint-address> <user-wallet-address>
   ```

4. Check the admin wallet balance:
   ```
   npx ts-node src/solana-points.ts check-balance
   ```

## Important Notes

- This project is configured to use the Solana devnet. Do not use real funds.
- The included admin wallet (`admin_keypair.json`) is for testing purposes only.
- The `brand_mints.json` file will be created in the project root directory to store information about created brand mints.
