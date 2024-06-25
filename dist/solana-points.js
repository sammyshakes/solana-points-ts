"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const dotenv = __importStar(require("dotenv"));
const fs = __importStar(require("fs"));
dotenv.config();
const SOLANA_NETWORK = process.env.SOLANA_NETWORK || 'https://api.devnet.solana.com';
const connection = new web3_js_1.Connection(SOLANA_NETWORK, 'confirmed');
const ADMIN_KEYPAIR_FILE = 'admin_keypair.json';
function loadAdminKeypair() {
    if (!fs.existsSync(ADMIN_KEYPAIR_FILE)) {
        throw new Error(`Admin keypair file not found. Please run the 'create-wallet' command first.`);
    }
    const adminPrivateKey = JSON.parse(fs.readFileSync(ADMIN_KEYPAIR_FILE, 'utf-8'));
    return web3_js_1.Keypair.fromSecretKey(Uint8Array.from(adminPrivateKey));
}
const adminKeypair = loadAdminKeypair();
function createAdminKeypair() {
    if (fs.existsSync(ADMIN_KEYPAIR_FILE)) {
        throw new Error(`Admin keypair file already exists. Use the existing wallet or delete ${ADMIN_KEYPAIR_FILE} to create a new one.`);
    }
    const adminKeypair = web3_js_1.Keypair.generate();
    fs.writeFileSync(ADMIN_KEYPAIR_FILE, JSON.stringify(Array.from(adminKeypair.secretKey)));
    console.log(`New admin keypair generated and saved to ${ADMIN_KEYPAIR_FILE}`);
    return adminKeypair;
}
async function checkAdminBalance() {
    const adminKeypair = loadAdminKeypair();
    const balance = await connection.getBalance(adminKeypair.publicKey);
    console.log(`Admin balance: ${balance / 10 ** 9} SOL`);
}
async function createBrandMint(name, symbol) {
    const mint = await (0, spl_token_1.createMint)(connection, adminKeypair, adminKeypair.publicKey, null, 9);
    const mintInfo = {
        address: mint.toBase58(),
        name,
        symbol,
    };
    const mintsFile = 'brand_mints.json';
    let mints = [];
    if (fs.existsSync(mintsFile)) {
        mints = JSON.parse(fs.readFileSync(mintsFile, 'utf-8'));
    }
    mints.push(mintInfo);
    fs.writeFileSync(mintsFile, JSON.stringify(mints, null, 2));
    console.log(`Created brand mint: ${mint.toBase58()}`);
    return mint.toBase58();
}
async function mintTokensToUser(brandMintAddress, userAddress, amount) {
    const mintPublicKey = new web3_js_1.PublicKey(brandMintAddress);
    const userPublicKey = new web3_js_1.PublicKey(userAddress);
    const tokenAccount = await (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, adminKeypair, mintPublicKey, userPublicKey);
    await (0, spl_token_1.mintTo)(connection, adminKeypair, mintPublicKey, tokenAccount.address, adminKeypair.publicKey, amount * 10 ** 9 // Assuming 9 decimals
    );
    console.log(`Minted ${amount} tokens to user: ${userAddress}`);
    return tokenAccount.address.toBase58();
}
async function getTokenBalance(brandMintAddress, userAddress) {
    const mintPublicKey = new web3_js_1.PublicKey(brandMintAddress);
    const userPublicKey = new web3_js_1.PublicKey(userAddress);
    const tokenAccount = await (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, adminKeypair, mintPublicKey, userPublicKey);
    const accountInfo = await (0, spl_token_1.getAccount)(connection, tokenAccount.address);
    return Number(accountInfo.amount) / 10 ** 9; // Assuming 9 decimals
}
(0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .command('create-brand <name> <symbol>', 'Create a new brand mint', (yargs) => {
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
}, async (argv) => {
    try {
        await checkAdminBalance();
        const mintAddress = await createBrandMint(argv.name, argv.symbol);
        console.log(`Created brand mint: ${mintAddress}`);
        await checkAdminBalance();
    }
    catch (error) {
        console.error('Error creating brand mint:', error);
    }
})
    .command('mint-tokens <brandMint> <userAddress> <amount>', 'Mint tokens to a user', (yargs) => {
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
}, async (argv) => {
    try {
        await mintTokensToUser(argv.brandMint, argv.userAddress, argv.amount);
    }
    catch (error) {
        console.error('Error minting tokens:', error);
    }
})
    .command('get-balance <brandMint> <userAddress>', 'Get token balance for a user', (yargs) => {
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
}, async (argv) => {
    try {
        const balance = await getTokenBalance(argv.brandMint, argv.userAddress);
        console.log(`Token balance: ${balance}`);
    }
    catch (error) {
        console.error('Error getting token balance:', error);
    }
})
    .command('check-balance', 'Check the balance of the admin wallet', async () => {
    try {
        await checkAdminBalance();
    }
    catch (error) {
        console.error('Error checking balance:', error);
    }
})
    .help()
    .strict()
    .parse();
