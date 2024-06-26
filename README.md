# Solana Points System

This project implements a simple points system on the Solana blockchain, allowing for the creation of brand-specific token mints and the minting of tokens to users.

## Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Documentation](#documentation)
   - [Wallet Manager](#wallet-manager)
   - [Solana Points Script](#solana-points-script)
4. [Step-by-Step Walkthrough](#step-by-step-walkthrough)
5. [Important Notes](#important-notes)

## Installation

1. Clone the repository:

   ```
   git clone git@github.com:tronicapp/solana-points-ts.git
   cd solana-points-ts
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Configuration

This project includes a pre-configured admin wallet for use on the Solana devnet. The keypair is stored in `admin_keypair.json`.

**Important:** This keypair is for testing purposes only. In a production environment, you should never commit private keys to a repository.

The project is set up to use Solana's devnet. If you need to change this, modify the `SOLANA_NETWORK` variable in the `.env` file.

---

# Documentation

The project consists of two main scripts:

1. `wallet-manager.ts`: For managing the admin wallet
2. `solana-points.ts`: For creating brand mints and managing tokens

## Wallet Manager

The wallet manager script (`wallet-manager.ts`) is used for creating and managing wallets.

### Creating the Admin Wallet

> Do NOT run this command if you already have an admin wallet. This will overwrite the existing admin wallet.

```bash
npx ts-node src/wallet-manager.ts create-admin
```

### Checking Admin Wallet Balance

```bash
npx ts-node src/wallet-manager.ts check-balance
```

### Creating a User Keypair

```bash
npx ts-node src/wallet-manager.ts create-user <username>
```

## Solana Points Script

### Creating a new Brand Mint

```bash
npx ts-node src/solana-points.ts create-brand "Your Brand Name" SYMBOL
```

### Minting Tokens

```bash
npx ts-node src/solana-points.ts mint-tokens <brand-mint-address> <user-wallet-address> <amount>
```

### Burning Tokens

```bash
npx ts-node src/solana-points.ts burn-tokens <brand-mint-address> <user-wallet-address> <amount>
```

### Checking Token Balance

```bash
npx ts-node src/solana-points.ts check-token-balance <brand-mint-address> <user-wallet-address>
```

### Checking Admin Wallet Balance

```bash
npx ts-node src/solana-points.ts check-balance
```

### Getting Token Metadata

```bash
npx ts-node src/solana-points.ts get-metadata <mint-address>
```

### Getting All Brand Balances for a Wallet

```bash
npx ts-node src/solana-points.ts get-all-balances <wallet-address>
```

To hide zero balances, add the `--hide-zero` flag:

```bash
npx ts-node src/solana-points.ts get-all-balances <wallet-address> --hide-zero
```

## Step-by-Step Walkthrough

1. **Check the admin wallet balance**

   ```bash
   npx ts-node src/solana-points.ts check-balance
   ```

2. **Create a new brand**

   ```bash
   npx ts-node src/solana-points.ts create-brand "My Test Brand" MTB
   ```

3. **Create a user keypair**

   ```bash
   npx ts-node src/wallet-manager.ts create-user alice
   ```

4. **Mint tokens to the new user**

   ```bash
   npx ts-node src/solana-points.ts mint-tokens <brand-mint-address> <user-wallet-address> 1000
   ```

5. **Check the token balance for the user**

   ```bash
   npx ts-node src/solana-points.ts check-token-balance <brand-mint-address> <user-wallet-address>
   ```

6. **Burn some tokens from the user**

   ```bash
   npx ts-node src/solana-points.ts burn-tokens <brand-mint-address> <user-wallet-address> 100
   ```

7. **Get token metadata**

   ```bash
   npx ts-node src/solana-points.ts get-metadata <brand-mint-address>
   ```

8. **Check all balances for the user**

   ```bash
   npx ts-node src/solana-points.ts get-all-balances <user-wallet-address>
   ```

## Notes

- All operations are performed on the Solana devnet. Do not use real funds.
- For demo purposes, an admin wallet (`admin_keypair.json`) is already provided.
- Make sure the admin wallet has sufficient SOL to perform operations.
- Created user keypairs are stored in the `user_keypairs` directory.
- In a production environment, users would create their own wallets and provide their public keys.
- Created Brand mint information will be stored in the `brand_mints.json` file in the project root directory.
- The wallet manager (`wallet-manager.ts`) is used for creating both admin and user keypairs and can be used to set up new wallets before interacting with the Solana Points System.
