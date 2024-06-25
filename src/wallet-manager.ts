import {
  Connection,
  Keypair,
  PublicKey,
  TransactionConfirmationStrategy,
} from '@solana/web3.js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

dotenv.config();

const SOLANA_NETWORK =
  process.env.SOLANA_NETWORK || 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_NETWORK, 'confirmed');

const ADMIN_KEYPAIR_FILE = 'admin_keypair.json';

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

async function checkAdminBalance(): Promise<void> {
  const adminKeypair = loadAdminKeypair();
  const balance = await connection.getBalance(adminKeypair.publicKey);
  console.log(`Admin balance: ${balance / 10 ** 9} SOL`);
}

async function airdropToAdmin(): Promise<void> {
  const adminKeypair = loadAdminKeypair();
  const retries = 5;
  for (let i = 0; i < retries; i++) {
    try {
      const airdropSignature = await connection.requestAirdrop(
        adminKeypair.publicKey,
        2 * 10 ** 9 // 2 SOL
      );

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();

      const confirmationStrategy: TransactionConfirmationStrategy = {
        signature: airdropSignature,
        blockhash,
        lastValidBlockHeight,
      };

      await connection.confirmTransaction(confirmationStrategy);
      console.log('Airdrop completed');
      return;
    } catch (error) {
      console.error(`Airdrop attempt ${i + 1} failed:`, error);
      if (i === retries - 1) {
        throw error;
      }
    }
  }
}

yargs(hideBin(process.argv))
  .command('create-wallet', 'Create a new admin wallet', {}, async () => {
    try {
      const adminKeypair = createAdminKeypair();
      console.log(`Admin public key: ${adminKeypair.publicKey.toBase58()}`);
    } catch (error) {
      console.error('Error creating wallet:', error);
    }
  })
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
  .command('airdrop', 'Airdrop SOL to the admin account', {}, async () => {
    try {
      await airdropToAdmin();
      await checkAdminBalance();
    } catch (error) {
      console.error('Error performing airdrop:', error);
    }
  })
  .help()
  .strict()
  .parse();
