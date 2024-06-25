import {
  Connection,
  Keypair,
  PublicKey,
  TransactionConfirmationStrategy,
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
} from '@solana/spl-token';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const SOLANA_NETWORK =
  process.env.SOLANA_NETWORK || 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_NETWORK, 'confirmed');

const ADMIN_KEYPAIR_FILE = 'admin_keypair.json';

function loadAdminKeypair(): Keypair {
  if (!fs.existsSync(ADMIN_KEYPAIR_FILE)) {
    throw new Error(
      `Admin keypair file not found. Please run the 'create-wallet' command first.`
    );
  }
  const adminPrivateKey = JSON.parse(
    fs.readFileSync(ADMIN_KEYPAIR_FILE, 'utf-8')
  );
  return Keypair.fromSecretKey(Uint8Array.from(adminPrivateKey));
}

const adminKeypair = loadAdminKeypair();

function createAdminKeypair(): Keypair {
  if (fs.existsSync(ADMIN_KEYPAIR_FILE)) {
    throw new Error(
      `Admin keypair file already exists. Use the existing wallet or delete ${ADMIN_KEYPAIR_FILE} to create a new one.`
    );
  }
  const adminKeypair = Keypair.generate();
  fs.writeFileSync(
    ADMIN_KEYPAIR_FILE,
    JSON.stringify(Array.from(adminKeypair.secretKey))
  );
  console.log(`New admin keypair generated and saved to ${ADMIN_KEYPAIR_FILE}`);
  return adminKeypair;
}

async function checkAdminBalance(): Promise<void> {
  const adminKeypair = loadAdminKeypair();
  const balance = await connection.getBalance(adminKeypair.publicKey);
  console.log(`Admin balance: ${balance / 10 ** 9} SOL`);
}

interface MintInfo {
  address: string;
  name: string;
  symbol: string;
}

async function createBrandMint(name: string, symbol: string): Promise<string> {
  const mint = await createMint(
    connection,
    adminKeypair,
    adminKeypair.publicKey,
    null,
    9
  );

  const mintInfo: MintInfo = {
    address: mint.toBase58(),
    name,
    symbol,
  };

  const mintsFile = 'brand_mints.json';
  let mints: MintInfo[] = [];
  if (fs.existsSync(mintsFile)) {
    mints = JSON.parse(fs.readFileSync(mintsFile, 'utf-8'));
  }
  mints.push(mintInfo);
  fs.writeFileSync(mintsFile, JSON.stringify(mints, null, 2));

  console.log(`Created brand mint: ${mint.toBase58()}`);
  return mint.toBase58();
}

async function mintTokensToUser(
  brandMintAddress: string,
  userAddress: string,
  amount: number
): Promise<string> {
  const mintPublicKey = new PublicKey(brandMintAddress);
  const userPublicKey = new PublicKey(userAddress);

  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    adminKeypair,
    mintPublicKey,
    userPublicKey
  );

  await mintTo(
    connection,
    adminKeypair,
    mintPublicKey,
    tokenAccount.address,
    adminKeypair.publicKey,
    amount * 10 ** 9 // Assuming 9 decimals
  );

  console.log(`Minted ${amount} tokens to user: ${userAddress}`);
  return tokenAccount.address.toBase58();
}

async function getTokenBalance(
  brandMintAddress: string,
  userAddress: string
): Promise<number> {
  const mintPublicKey = new PublicKey(brandMintAddress);
  const userPublicKey = new PublicKey(userAddress);

  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    adminKeypair,
    mintPublicKey,
    userPublicKey
  );

  const accountInfo = await getAccount(connection, tokenAccount.address);

  return Number(accountInfo.amount) / 10 ** 9; // Assuming 9 decimals
}

yargs(hideBin(process.argv))
  .command(
    'create-brand <name> <symbol>',
    'Create a new brand mint',
    (yargs: yargs.Argv) => {
      return yargs
        .positional('name', {
          describe: 'Brand name',
          type: 'string',
          demandOption: true,
        })
        .positional('symbol', {
          describe: 'Brand symbol',
          type: 'string',
          demandOption: true,
        });
    },
    async (argv: { name: string; symbol: string }) => {
      try {
        await checkAdminBalance();
        const mintAddress = await createBrandMint(argv.name, argv.symbol);
        console.log(`Created brand mint: ${mintAddress}`);
        await checkAdminBalance();
      } catch (error) {
        console.error('Error creating brand mint:', error);
      }
    }
  )
  .command(
    'mint-tokens <brandMint> <userAddress> <amount>',
    'Mint tokens to a user',
    (yargs: yargs.Argv) => {
      return yargs
        .positional('brandMint', {
          describe: 'Brand mint address',
          type: 'string',
          demandOption: true,
        })
        .positional('userAddress', {
          describe: 'User wallet address',
          type: 'string',
          demandOption: true,
        })
        .positional('amount', {
          describe: 'Amount of tokens to mint',
          type: 'number',
          demandOption: true,
        });
    },
    async (argv: {
      brandMint: string;
      userAddress: string;
      amount: number;
    }) => {
      try {
        await mintTokensToUser(argv.brandMint, argv.userAddress, argv.amount);
      } catch (error) {
        console.error('Error minting tokens:', error);
      }
    }
  )
  .command(
    'get-balance <brandMint> <userAddress>',
    'Get token balance for a user',
    (yargs: yargs.Argv) => {
      return yargs
        .positional('brandMint', {
          describe: 'Brand mint address',
          type: 'string',
          demandOption: true,
        })
        .positional('userAddress', {
          describe: 'User wallet address',
          type: 'string',
          demandOption: true,
        });
    },
    async (argv: { brandMint: string; userAddress: string }) => {
      try {
        const balance = await getTokenBalance(argv.brandMint, argv.userAddress);
        console.log(`Token balance: ${balance}`);
      } catch (error) {
        console.error('Error getting token balance:', error);
      }
    }
  )
  .command(
    'check-balance',
    'Check the balance of the admin wallet',
    async () => {
      try {
        await checkAdminBalance();
      } catch (error) {
        console.error('Error checking balance:', error);
      }
    }
  )
  .help()
  .strict()
  .parse();
