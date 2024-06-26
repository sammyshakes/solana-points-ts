import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  createV1,
  mintV1,
  burnV1,
  TokenStandard,
  mplTokenMetadata,
  fetchDigitalAsset,
  DigitalAsset,
  fetchAllDigitalAssetByOwner,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  generateSigner,
  percentAmount,
  publicKey as umiPublicKey,
  some,
  Umi,
} from '@metaplex-foundation/umi';
import { keypairIdentity } from '@metaplex-foundation/umi';
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters';
import * as web3 from '@solana/web3.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const SOLANA_NETWORK =
  process.env.SOLANA_NETWORK || 'https://api.devnet.solana.com';
const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';

const umi = createUmi(SOLANA_NETWORK).use(mplTokenMetadata());

const ADMIN_KEYPAIR_FILE = 'admin_keypair.json';

interface MintInfo {
  address: string;
  name: string;
  symbol: string;
  tokenProgramId: string;
}

function loadAdminKeypair(): web3.Keypair {
  if (!fs.existsSync(ADMIN_KEYPAIR_FILE)) {
    throw new Error(
      `Admin keypair file not found. Please run the 'create-wallet' command from the wallet manager script first.`
    );
  }
  const adminPrivateKey = JSON.parse(
    fs.readFileSync(ADMIN_KEYPAIR_FILE, 'utf-8')
  );
  return web3.Keypair.fromSecretKey(Uint8Array.from(adminPrivateKey));
}

const adminKeypair = loadAdminKeypair();
const umiKeypair = fromWeb3JsKeypair(adminKeypair);
umi.use(keypairIdentity(umiKeypair));

async function checkAdminBalance(): Promise<void> {
  const connection = new web3.Connection(SOLANA_NETWORK, 'confirmed');
  const balance = await connection.getBalance(adminKeypair.publicKey);
  console.log(`Admin public key: ${adminKeypair.publicKey.toBase58()}`);
  console.log(`Admin balance: ${balance / 10 ** 9} SOL`);
}

async function createBrandMint(
  umi: Umi,
  name: string,
  symbol: string
): Promise<string> {
  const mint = generateSigner(umi);

  await createV1(umi, {
    mint,
    authority: umi.identity,
    name,
    symbol,
    uri: '', // You can add a URI to more token info if needed
    sellerFeeBasisPoints: percentAmount(0),
    decimals: some(9), // 9 decimals, you can adjust this as needed
    tokenStandard: TokenStandard.Fungible,
    splTokenProgram: umiPublicKey(TOKEN_2022_PROGRAM_ID),
  }).sendAndConfirm(umi);

  const mintInfo: MintInfo = {
    address: mint.publicKey,
    name,
    symbol,
    tokenProgramId: TOKEN_2022_PROGRAM_ID,
  };

  // Save mint info to file...
  const mintsFile = 'brand_mints.json';
  let mints: MintInfo[] = [];
  if (fs.existsSync(mintsFile)) {
    mints = JSON.parse(fs.readFileSync(mintsFile, 'utf-8'));
  }
  mints.push(mintInfo);
  fs.writeFileSync(mintsFile, JSON.stringify(mints, null, 2));

  return mint.publicKey;
}

async function mintTokensToUser(
  umi: Umi,
  brandMintAddress: string,
  userAddress: string,
  amount: number
): Promise<void> {
  await mintV1(umi, {
    mint: umiPublicKey(brandMintAddress),
    authority: umi.identity,
    amount: BigInt(amount * 10 ** 9), // Assuming 9 decimals
    tokenOwner: umiPublicKey(userAddress),
    tokenStandard: TokenStandard.Fungible,
  }).sendAndConfirm(umi);

  console.log(`Minted ${amount} tokens to user: ${userAddress}`);
}

async function burnTokens(
  umi: Umi,
  mintAddress: string,
  ownerAddress: string,
  amount: number
): Promise<void> {
  await burnV1(umi, {
    mint: umiPublicKey(mintAddress),
    authority: umi.identity,
    tokenOwner: umiPublicKey(ownerAddress),
    amount: BigInt(amount * 10 ** 9), // Assuming 9 decimals
    tokenStandard: TokenStandard.Fungible,
  }).sendAndConfirm(umi);

  console.log(`Burned ${amount} tokens from user: ${ownerAddress}`);
}

async function getTokenMetadata(
  umi: Umi,
  mintAddress: string
): Promise<DigitalAsset | null> {
  try {
    return await fetchDigitalAsset(umi, umiPublicKey(mintAddress));
  } catch (error) {
    console.error('Error fetching digital asset:', error);
    return null;
  }
}

async function checkTokenBalance(
  umi: Umi,
  tokenMintAddress: string,
  walletAddress: string
): Promise<number> {
  try {
    const assets = await fetchAllDigitalAssetByOwner(
      umi,
      umiPublicKey(walletAddress)
    );
    const asset = assets.find((a) => a.mint.publicKey === tokenMintAddress);

    if (asset) {
      return Number(asset.mint.supply) / Math.pow(10, asset.mint.decimals);
    }
    return 0; // Return 0 if the wallet doesn't own any tokens of this mint
  } catch (error) {
    console.error('Error getting token balance:', error);
    return 0; // Return 0 if there's an error
  }
}

async function getAllBrandBalances(
  umi: Umi,
  walletAddress: string,
  hideZeroBalances: boolean = false
): Promise<{ [key: string]: number }> {
  const mintsFile = 'brand_mints.json';
  if (!fs.existsSync(mintsFile)) {
    throw new Error('No brand mints found. Please create a brand first.');
  }

  const mints: MintInfo[] = JSON.parse(fs.readFileSync(mintsFile, 'utf-8'));
  const balances: { [key: string]: number } = {};

  try {
    const assets = await fetchAllDigitalAssetByOwner(
      umi,
      umiPublicKey(walletAddress)
    );

    for (const mint of mints) {
      const asset = assets.find((a) => a.mint.publicKey === mint.address);
      if (asset) {
        const balance =
          Number(asset.mint.supply) / Math.pow(10, asset.mint.decimals);
        if (!hideZeroBalances || balance > 0) {
          balances[mint.name] = balance;
        }
      } else if (!hideZeroBalances) {
        balances[mint.name] = 0;
      }
    }
  } catch (error) {
    console.error('Error fetching digital assets:', error);
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
        const mintAddress = await createBrandMint(umi, argv.name, argv.symbol);
        console.log(`Created brand mint: ${mintAddress}`);
        console.log('Using Token-2022 program');
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
        await mintTokensToUser(
          umi,
          argv.brandMint,
          argv.userAddress,
          argv.amount
        );
      } catch (error) {
        console.error('Error minting tokens:', error);
      }
    }
  )
  .command(
    'check-balance',
    'Check the balance of the admin wallet',
    {},
    async () => {
      try {
        await checkAdminBalance();
      } catch (error) {
        console.error('Error checking balance:', error);
      }
    }
  )
  .command(
    'get-metadata <mintAddress>',
    'Get comprehensive metadata for a token',
    (yargs: yargs.Argv) => {
      return yargs.positional('mintAddress', {
        describe: 'Mint address of the token',
        type: 'string',
        demandOption: true,
      });
    },
    async (argv: { mintAddress: string }) => {
      try {
        const asset = await getTokenMetadata(umi, argv.mintAddress);
        if (asset) {
          console.log('Digital Asset Information:');
          console.log('Mint:', asset.mint.publicKey);
          console.log('Metadata:');
          console.log('  Name:', asset.metadata.name);
          console.log('  Symbol:', asset.metadata.symbol);
          console.log('  URI:', asset.metadata.uri);
          console.log(
            '  Seller Fee Basis Points:',
            asset.metadata.sellerFeeBasisPoints
          );
          console.log('  Creators:', asset.metadata.creators);
          if (asset.edition) {
            console.log('Edition:');
            console.log('  Is Original:', asset.edition.isOriginal);
            if (asset.edition.isOriginal) {
              console.log('  Max Supply:', asset.edition.maxSupply);
              console.log('  Supply:', asset.edition.supply);
            } else {
              // For non-original editions, we need to check the structure
              if ('edition' in asset.edition) {
                console.log('  Edition Number:', asset.edition.edition);
              } else {
                console.log('  Edition information not available');
              }
            }
          }
        } else {
          console.log('No metadata found for the given mint address.');
        }
      } catch (error) {
        console.error('Error fetching digital asset:', error);
      }
    }
  )
  .command(
    'burn-tokens <mintAddress> <ownerAddress> <amount>',
    'Burn tokens from a user',
    (yargs: yargs.Argv) => {
      return yargs
        .positional('mintAddress', {
          describe: 'Mint address of the token',
          type: 'string',
          demandOption: true,
        })
        .positional('ownerAddress', {
          describe: 'Address of the token owner',
          type: 'string',
          demandOption: true,
        })
        .positional('amount', {
          describe: 'Amount of tokens to burn',
          type: 'number',
          demandOption: true,
        });
    },
    async (argv: {
      mintAddress: string;
      ownerAddress: string;
      amount: number;
    }) => {
      try {
        await burnTokens(umi, argv.mintAddress, argv.ownerAddress, argv.amount);
      } catch (error) {
        console.error('Error burning tokens:', error);
      }
    }
  )
  .command(
    'check-token-balance <mintAddress> <walletAddress>',
    'Check token balance for a wallet',
    (yargs: yargs.Argv) => {
      return yargs
        .positional('mintAddress', {
          describe: 'Mint address of the token',
          type: 'string',
          demandOption: true,
        })
        .positional('walletAddress', {
          describe: 'Wallet address to check',
          type: 'string',
          demandOption: true,
        });
    },
    async (argv: { mintAddress: string; walletAddress: string }) => {
      try {
        const balance = await checkTokenBalance(
          umi,
          argv.mintAddress,
          argv.walletAddress
        );
        console.log(`Token balance for ${argv.walletAddress}: ${balance}`);
      } catch (error) {
        console.error('Error checking token balance:', error);
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
          umi,
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
