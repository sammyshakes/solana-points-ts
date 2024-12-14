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

Example output:

```
New admin keypair generated and saved to admin_keypair.json
Admin public key: GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM
```

### Checking Admin Wallet Balance

```bash
npx ts-node src/wallet-manager.ts check-balance
```

Example output:

```
Admin public key: GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM
Admin balance: 1.95526572 SOL
```

### Creating a User Keypair

```bash
npx ts-node src/wallet-manager.ts create-user <username>
```

Example output:

```
Created user keypair for alice
Public key: 7JvBvJ5kzTw8bzMj2FdJAijLWXcyeVBW5f1f3Bs5KThB
Keypair saved to: /path/to/project/user_keypairs/alice_keypair.json
```

## Solana Points Script

### Creating a new Brand Mint

```bash
npx ts-node src/solana-points.ts create-brand "Your Brand Name" SYMBOL
```

Example output:

```
Admin public key: GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM
Admin balance: 1.97235404 SOL
Created brand mint: Gb9Hb4eJTAsNW6Y3E7TFzzmNa9p8uxeJCvbgpFtQPgj6
Using standard SPL Token program
Admin public key: GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM
Admin balance: 1.95526572 SOL
```

To create a Token-2022 brand, add the `--token2022` flag:

```bash
npx ts-node src/solana-points.ts create-brand "Your Brand Name" SYMBOL --token2022
```

### Minting Tokens

```bash
npx ts-node src/solana-points.ts mint-tokens <brand-mint-address> <user-wallet-address> <amount>
```

Example output:

```
Minted 1000 tokens to user: GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM
```

### Burning Tokens

```bash
npx ts-node src/solana-points.ts burn-tokens <brand-mint-address> <user-wallet-address> <amount>
```

Example output:

```
Burned 100 tokens from user: GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM
```

### Checking Token Balance

```bash
npx ts-node src/solana-points.ts check-token-balance <brand-mint-address> <user-wallet-address>
```

Example output:

```
Token balance for GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM: 1000
```

### Checking Admin Wallet Balance

```bash
npx ts-node src/solana-points.ts check-balance
```

Example output:

```
Admin public key: GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM
Admin balance: 1.95526572 SOL
```

### Getting Token Metadata

```bash
npx ts-node src/solana-points.ts get-metadata <mint-address>
```

Example output:

```
Digital Asset Information:
Mint: Gb9Hb4eJTAsNW6Y3E7TFzzmNa9p8uxeJCvbgpFtQPgj6
Metadata:
  Name: Test Brand 2
  Symbol: TST2
  URI:
  Seller Fee Basis Points: 0
  Creators: {
  __option: 'Some',
  value: [
    {
      address: 'GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM',
      verified: true,
      share: 100
    }
  ]
}
```

### Getting All Brand Balances for a Wallet

```bash
npx ts-node src/solana-points.ts get-all-balances <wallet-address>
```

Example output:

```
Token balances for GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM:
My Brand: 0
Acme Points: 0
Test Brand 1: 0
Test Brand 2: 1000
```

To hide zero balances, add the `--hide-zero` flag:

```bash
npx ts-node src/solana-points.ts get-all-balances <wallet-address> --hide-zero
```

Example output:

```
Token balances for GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM:
Test Brand 2: 1000
```

## Step-by-Step Walkthrough

1. **Check the admin wallet balance**

   First, let's make sure the admin wallet has enough SOL to perform operations:

   ```bash
   npx ts-node src/solana-points.ts check-balance
   ```

   Example output:

   ```
   Admin public key: GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM
   Admin balance: 1.95526572 SOL
   ```

   Ensure you have enough SOL in the admin wallet. If not, you may need to airdrop some SOL using a Solana faucet.

2. **Create a new brand (Standard SPL Token)**

   Now, let's create a new brand for our tokens. Enter a name and symbol for your brand. For example, to create a brand named "My Test Brand" with the symbol "MTB", run the following command:

   ```bash
   npx ts-node src/solana-points.ts create-brand "My Test Brand" MTB
   ```

   Example output:

   ```
   Created brand mint: Gb9Hb4eJTAsNW6Y3E7TFzzmNa9p8uxeJCvbgpFtQPgj6
   Using standard SPL Token program
   ```

   **If you want to create a brand using the Token-2022 program instead, use the `--token2022` flag:**

   ```bash
   npx ts-node src/solana-points.ts create-brand "My Token-2022 Brand" MT22 --token2022
   ```

   Example output:

   ```
   Created brand mint: Gb9Hb4eJTAsNW6Y3E7TFzzmNa9p8uxeJCvbgpFtQPgj6
   Using Token-2022 program
   ```

   This command will output a mint address. The address is automatically saved in the `brand_mints.json` file in your project directory. For this walkthrough, also note down this address (in this example, `Gb9Hb4eJTAsNW6Y3E7TFzzmNa9p8uxeJCvbgpFtQPgj6`) as we'll use it in subsequent steps.

3. **Create a user keypair**

   Let's create a new user to interact with our tokens:

   ```bash
   npx ts-node src/wallet-manager.ts create-user alice
   ```

   Example output:

   ```
   Created user keypair for alice
   Public key: 7JvBvJ5kzTw8bzMj2FdJAijLWXcyeVBW5f1f3Bs5KThB
   Keypair saved to: /path/to/project/user_keypairs/alice_keypair.json
   ```

   This will generate a new keypair for Alice and display her public key. The keypair is automatically saved in the `user_keypairs` directory. Note down Alice's public key for the next steps.

4. **Mint tokens to the new user**

   Now, let's mint some tokens to Alice using the brand mint address from step 2 and Alice's public key from step 3:

   ```bash
   npx ts-node src/solana-points.ts mint-tokens Gb9Hb4eJTAsNW6Y3E7TFzzmNa9p8uxeJCvbgpFtQPgj6 7JvBvJ5kzTw8bzMj2FdJAijLWXcyeVBW5f1f3Bs5KThB 1000
   ```

   Example output:

   ```
   Minted 1000 tokens to user: 7JvBvJ5kzTw8bzMj2FdJAijLWXcyeVBW5f1f3Bs5KThB
   ```

5. **Check the token balance for the user**

   Let's verify that Alice received the tokens:

   ```bash
   npx ts-node src/solana-points.ts check-token-balance Gb9Hb4eJTAsNW6Y3E7TFzzmNa9p8uxeJCvbgpFtQPgj6 7JvBvJ5kzTw8bzMj2FdJAijLWXcyeVBW5f1f3Bs5KThB
   ```

   Example output:

   ```
   Token balance for 7JvBvJ5kzTw8bzMj2FdJAijLWXcyeVBW5f1f3Bs5KThB: 1000
   ```

6. **Burn some tokens from the user**

   Now, let's burn 100 tokens from Alice's balance:

   ```bash
   npx ts-node src/solana-points.ts burn-tokens Gb9Hb4eJTAsNW6Y3E7TFzzmNa9p8uxeJCvbgpFtQPgj6 7JvBvJ5kzTw8bzMj2FdJAijLWXcyeVBW5f1f3Bs5KThB 100
   ```

   Example output:

   ```
   Burned 100 tokens from user: 7JvBvJ5kzTw8bzMj2FdJAijLWXcyeVBW5f1f3Bs5KThB
   ```

7. **Get token metadata**

   Let's retrieve the metadata for our token:

   ```bash
   npx ts-node src/solana-points.ts get-metadata Gb9Hb4eJTAsNW6Y3E7TFzzmNa9p8uxeJCvbgpFtQPgj6
   ```

   Example output:

   ```
   Digital Asset Information:
   Mint: Gb9Hb4eJTAsNW6Y3E7TFzzmNa9p8uxeJCvbgpFtQPgj6
   Metadata:
     Name: My Test Brand
     Symbol: MTB
     URI:
     Seller Fee Basis Points: 0
     Creators: {
       __option: 'Some',
       value: [
         {
           address: 'GWbuU4p4arBy14MLKDMYoQQoWiHzn93B2WdAw72nbyBM',
           verified: true,
           share: 100
         }
       ]
     }
   ```

8. **Check all balances for the user**

   Finally, let's check all token balances for Alice:

   ```bash
   npx ts-node src/solana-points.ts get-all-balances 7JvBvJ5kzTw8bzMj2FdJAijLWXcyeVBW5f1f3Bs5KThB
   ```

   Example output:

   ```
   Token balances for 7JvBvJ5kzTw8bzMj2FdJAijLWXcyeVBW5f1f3Bs5KThB:
   My Test Brand: 900
   ```

   To see only non-zero balances (which in this case would be the same output), add the `--hide-zero` flag:

   ```bash
   npx ts-node src/solana-points.ts get-all-balances 7JvBvJ5kzTw8bzMj2FdJAijLWXcyeVBW5f1f3Bs5KThB --hide-zero
   ```

By following these steps, you've created a new brand of tokens, minted some to a user, performed various operations, and checked balances. This walkthrough demonstrates the basic functionality of the Solana Points System.

## Notes

- All operations are performed on the Solana devnet. Do not use real funds.
- For demo purposes, an admin wallet (`admin_keypair.json`) is already provided.
- Make sure the admin wallet has sufficient SOL to perform operations.
- Created user keypairs are stored in the `user_keypairs` directory.
- In a production environment, users would create their own wallets and provide their public keys.
- Created Brand mint information will be stored in the `brand_mints.json` file in the project root directory.
- The wallet manager (`wallet-manager.ts`) is used for creating both admin and user keypairs and can be used to set up new wallets before interacting with the Solana Points System.
