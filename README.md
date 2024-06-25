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
   npm install --save-dev typescript ts-node @types/node
   npm install @solana/web3.js @solana/spl-token yargs dotenv
   ```

## Configuration

This project includes a pre-configured admin wallet for use on the Solana devnet. The keypair is stored in `admin_keypair.json`.

**Important:** This keypair is for testing purposes only. In a production environment, you should never commit private keys to a repository.

The project is set up to use Solana's devnet. If you need to change this, modify the `SOLANA_NETWORK` variable in the `.env` file.

# Documentation

The project consists of two main scripts:

1. `wallet-manager.ts`: For managing the admin wallet
2. `solana-points.ts`: For creating brand mints and managing tokens

## Wallet Manager

#### Check the admin wallet balance:

```
npx ts-node src/wallet-manager.ts check-balance
```

Example output:

```
Admin public key: GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM
Admin balance: 0.9955852 SOL
```

## Solana Points Script

#### Creating a new Brand Mint

```bash
npx ts-node src/solana-points.ts create-brand "Your Brand Name" SYMBOL
```

Example output:

```
Admin balance: 0.9955852 SOL
Created brand mint: 4uhztZYdeNWm6oWay8v6dtuyshLSAv2v3srewf27hkRd
Admin balance: 0.9941136 SOL
```

#### Minting Tokens

```bash
npx ts-node src/solana-points.ts mint-tokens <brand-mint-address> <user-wallet-address> <amount>
```

Example output:

```
Minted 1000 tokens to user: GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM
```

#### Burning Tokens

```bash
npx ts-node src/solana-points.ts burn-tokens <brand-mint-address> <user-wallet-address> <amount>
```

Example output:

```
Burned 100 tokens from user: GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM
```

#### Checking Token Balance

```bash
npx ts-node src/solana-points.ts check-token-balance <brand-mint-address> <user-wallet-address>
```

Example output:

```
Token balance for GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM:
1000 tokens of mint 4uhztZYdeNWm6oWay8v6dtuyshLSAv2v3srewf27hkRd
```

#### Checking Admin Wallet Balance

```bash
npx ts-node src/solana-points.ts check-balance
```

Example output:

```
Admin public key: GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM
Admin balance: 0.9941136 SOL
```

#### Getting All Brand Balances for a Wallet

```bash
npx ts-node src/solana-points.ts get-all-balances <wallet-address>
```

Example output:

```
Token balances for GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM:
My Brand: 0
Acme Points: 1000
Test Brand 1: 0
```

To hide zero balances, add the `--hide-zero` flag:

```bash
npx ts-node src/solana-points.ts get-all-balances <wallet-address> --hide-zero
```

Example output:

```
Token balances for GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM:
Acme Points: 1000
```

## Step-by-Step Walkthrough

Follow these steps to create a brand, mint tokens, and check balances:

1. **Check the admin wallet balance**

   ```bash
   npx ts-node src/solana-points.ts check-balance
   ```

   Example output:

   ```
   Admin public key: GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM
   Admin balance: 0.9955852 SOL
   ```

2. **Create a new brand**

   ```bash
   npx ts-node src/solana-points.ts create-brand "My Test Brand" MTB
   ```

   Example output:

   ```
   Admin balance: 0.9955852 SOL
   Created brand mint: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
   Admin balance: 0.9941136 SOL
   ```

3. **Mint tokens to the admin wallet**

   ```bash
   npx ts-node src/solana-points.ts mint-tokens EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM 1000
   ```

   Example output:

   ```
   Minted 1000 tokens to user: GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM
   ```

4. **Check the token balance**

   ```bash
   npx ts-node src/solana-points.ts check-token-balance EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM
   ```

   Example output:

   ```
   Token balance for GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM:
   1000 tokens of mint EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
   ```

5. **Get all brand balances**

   ```bash
   npx ts-node src/solana-points.ts get-all-balances GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM
   ```

   Example output:

   ```
   Token balances for GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM:
   My Test Brand: 1000
   Acme Points: 1000
   Test Brand 1: 0
   ```

6. **Create another brand and mint tokens**
   Repeat steps 2 and 3 with a different brand name and symbol.

7. **Check all balances again**

   ```bash
   npx ts-node src/solana-points.ts get-all-balances GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM
   ```

   Example output:

   ```
   Token balances for GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM:
   My Test Brand: 1000
   Acme Points: 1000
   Test Brand 1: 0
   New Brand: 500
   ```

8. **Burn some tokens**

   ```bash
   npx ts-node src/solana-points.ts burn-tokens EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM 100
   ```

   Example output:

   ```
   Burned 100 tokens from user: GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM
   ```

9. **Check balances after burning**

   ```bash
   npx ts-node src/solana-points.ts get-all-balances GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM --hide-zero
   ```

   Example output:

   ```
   Token balances for GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM:
   My Test Brand: 900
   Acme Points: 1000
   New Brand: 500
   ```

10. **Use the hide-zero flag**

    ```bash
    npx ts-node src/solana-points.ts get-all-balances GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM --hide-zero
    ```

    Example output:

    ```
    Token balances for GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM:
    My Test Brand: 1000
    Acme Points: 1000
    New Brand: 500
    ```

## Creating a New Admin Wallet

**WARNING: Following these steps will overwrite the current admin wallet. Only proceed if you intend to replace the existing admin wallet with a new one.**

If you need to create a new admin wallet, follow these steps:

1. **Generate a new Solana keypair**

   Run the following command in your terminal:

   ```bash
   solana-keygen new --outfile admin_keypair.json
   ```

   This will create a new keypair and save it to `admin_keypair.json`, overwriting any existing file with the same name.

2. **Secure your keypair**

   Ensure that `admin_keypair.json` is added to your `.gitignore` file to prevent accidentally committing it to version control.

3. **Get your new public key**

   Retrieve the public key of your new wallet:

   ```bash
   solana-keygen pubkey admin_keypair.json
   ```

   Make a note of this public key as you'll need it for the next step.

4. **Fund your new wallet**

   Use an available Solana devnet faucet to fund your new wallet. You can find faucets by searching online for "Solana devnet faucet". Input your new public key on the faucet website to receive SOL.

5. **Verify the new wallet**

   Run the check balance command to ensure everything is set up correctly:

   ```bash
   npx ts-node src/solana-points.ts check-balance
   ```

   You should see output with your new public key and balance.

6. **Update your project**

   If you've changed the name or location of the keypair file, update the `ADMIN_KEYPAIR_FILE` constant in both `wallet-manager.ts` and `solana-points.ts`:

   ```typescript
   const ADMIN_KEYPAIR_FILE = 'admin_keypair.json';
   ```

   Remember to update any hardcoded admin addresses in your test scripts or documentation to use the new address.

   **Important:**

   - The new admin wallet will not have any of the token balances or mints associated with the previous admin wallet. You may need to recreate your brands and mint new tokens after switching to a new admin wallet.

## Notes

- All operations are performed on the Solana devnet. Do not use real funds.
- The included admin wallet (`admin_keypair.json`) is for testing purposes only.
- The `brand_mints.json` file will be created in the project root directory to store information about created brand mints.
- Make sure the admin wallet has sufficient SOL to perform operations.
- Replace `GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM` as the admin wallet address when using these commands.
