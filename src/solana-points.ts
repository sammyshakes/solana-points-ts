import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
  getMint,
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
      `Admin keypair file not found. Please run the 'create-wallet' command from the wallet manager script first.`
    );
  }
  const adminPrivateKey = JSON.parse(
    fs.readFileSync(ADMIN_KEYPAIR_FILE, 'utf-8')
  );
  return Keypair.fromSecretKey(Uint8Array.from(adminPrivateKey));
}

const adminKeypair = loadAdminKeypair();

async function checkAdminBalance(): Promise<void> {
  const balance = await connection.getBalance(adminKeypair.publicKey);
  console.log(`Admin public key: ${adminKeypair.publicKey.toBase58()}`);
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
  tokenMintAddress: string,
  walletAddress: string
): Promise<number> {
  const mintPublicKey = new PublicKey(tokenMintAddress);
  const walletPublicKey = new PublicKey(walletAddress);

  try {
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      adminKeypair,
      mintPublicKey,
      walletPublicKey
    );

    const accountInfo = await getAccount(connection, tokenAccount.address);
    const mintInfo = await getMint(connection, mintPublicKey);

    return Number(accountInfo.amount) / 10 ** mintInfo.decimals;
  } catch (error) {
    console.error('Error getting token balance:', error);
    return 0; // Return 0 if there's an error (e.g., account doesn't exist)
  }
}

async function getAllBrandBalances(
  walletAddress: string,
  hideZeroBalances: boolean = false
): Promise<{ [key: string]: number }> {
  const mintsFile = 'brand_mints.json';
  if (!fs.existsSync(mintsFile)) {
    throw new Error('No brand mints found. Please create a brand first.');
  }

  const mints: MintInfo[] = JSON.parse(fs.readFileSync(mintsFile, 'utf-8'));
  const balances: { [key: string]: number } = {};

  for (const mint of mints) {
    const balance = await getTokenBalance(mint.address, walletAddress);
    if (!hideZeroBalances || balance > 0) {
      balances[mint.name] = balance;
    }
  }

  return balances;
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
    'check-token-balance <tokenMint> <walletAddress>',
    'Check token balance for any SPL token and wallet address',
    (yargs: yargs.Argv) => {
      return yargs
        .positional('tokenMint', {
          describe: 'Token mint address',
          type: 'string',
          demandOption: true,
        })
        .positional('walletAddress', {
          describe: 'Wallet address to check',
          type: 'string',
          demandOption: true,
        });
    },
    async (argv: { tokenMint: string; walletAddress: string }) => {
      try {
        const balance = await getTokenBalance(
          argv.tokenMint,
          argv.walletAddress
        );
        console.log(`Token balance for ${argv.walletAddress}:`);
        console.log(`${balance} tokens of mint ${argv.tokenMint}`);
      } catch (error) {
        console.error('Error checking token balance:', error);
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
  .command(
    'get-all-balances <walletAddress>',
    'Get all brand token balances for a wallet',
    (yargs: yargs.Argv) => {
      return yargs
        .positional('walletAddress', {
          describe: 'Wallet address to check',
          type: 'string',
          demandOption: true,
        })
        .option('hide-zero', {
          describe: 'Hide zero balances',
          type: 'boolean',
          default: false,
        });
    },
    async (argv: { walletAddress: string; hideZero: boolean }) => {
      try {
        const balances = await getAllBrandBalances(
          argv.walletAddress,
          argv.hideZero
        );
        console.log(`Token balances for ${argv.walletAddress}:`);
        if (Object.keys(balances).length === 0) {
          console.log('No non-zero balances found.');
        } else {
          for (const [brand, balance] of Object.entries(balances)) {
            console.log(`${brand}: ${balance}`);
          }
        }
      } catch (error) {
        console.error('Error getting all brand balances:', error);
      }
    }
  )
  .help()
  .strict()
  .parse();
