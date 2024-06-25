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

# Using the Solana Points Script

Before you begin, ensure you have:

1. Set up the project and installed all dependencies
2. Created and funded the admin wallet using the wallet manager script

## Creating a new Brand Mint

To create a new brand, use the following command:

```bash
npx ts-node src/solana-points.ts create-brand "Your Brand Name" SYMBOL
```

Replace "Your Brand Name" with the desired name for your brand, and SYMBOL with a short ticker symbol (usually 3-4 letters).

Example:

```bash
npx ts-node src/solana-points.ts create-brand "Acme Points" ACME
```

Expected output:

```
Admin balance: [current balance] SOL
Created brand mint: [mint address]
Admin balance: [new balance] SOL
```

The mint address displayed in the output is important. Save this address as you'll need it for minting tokens.

## Minting Tokens

To mint tokens to a user's wallet, use the following command:

```bash
npx ts-node src/solana-points.ts mint-tokens <brand-mint-address> <user-wallet-address> <amount>
```

- Replace `<brand-mint-address>` with the mint address from the create-brand command
- Replace `<user-wallet-address>` with the Solana wallet address of the recipient
- Replace `<amount>` with the number of tokens to mint

Example:

```bash
npx ts-node src/solana-points.ts mint-tokens EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v Fg8qszGKKSJmFg7FowAstjM9JYXinELhY3hYzFKD5qo4 100
```

Expected output:

```
Minted 100 tokens to user: Fg8qszGKKSJmFg7FowAstjM9JYXinELhY3hYzFKD5qo4
```

## Checking Token Balance

To check a user's token balance for a specific brand, use:

```bash
npx ts-node src/solana-points.ts get-balance <brand-mint-address> <user-wallet-address>
```

Example:

```bash
npx ts-node src/solana-points.ts get-balance EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v Fg8qszGKKSJmFg7FowAstjM9JYXinELhY3hYzFKD5qo4
```

Expected output:

```
Token balance: 100
```

## Checking Admin Wallet Balance

To check the balance of the admin wallet:

```bash
npx ts-node src/solana-points.ts check-balance
```

Expected output:

```
Admin balance: [balance] SOL
```

Remember, all these operations are performed on the Solana devnet. Make sure the admin wallet has sufficient SOL to perform these operations. If you need more SOL, use the wallet manager script to request an airdrop.

## Important Notes

- This project is configured to use the Solana devnet. Do not use real funds.
- The included admin wallet (`admin_keypair.json`) is for testing purposes only.
- The `brand_mints.json` file will be created in the project root directory to store information about created brand mints.
