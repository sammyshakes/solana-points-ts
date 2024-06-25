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
const fs = __importStar(require("fs"));
const dotenv = __importStar(require("dotenv"));
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
dotenv.config();
const SOLANA_NETWORK = process.env.SOLANA_NETWORK || 'https://api.devnet.solana.com';
const connection = new web3_js_1.Connection(SOLANA_NETWORK, 'confirmed');
const ADMIN_KEYPAIR_FILE = 'admin_keypair.json';
function createAdminKeypair() {
    if (fs.existsSync(ADMIN_KEYPAIR_FILE)) {
        throw new Error(`Admin keypair file already exists. Use the existing wallet or delete ${ADMIN_KEYPAIR_FILE} to create a new one.`);
    }
    const adminKeypair = web3_js_1.Keypair.generate();
    fs.writeFileSync(ADMIN_KEYPAIR_FILE, JSON.stringify(Array.from(adminKeypair.secretKey)));
    console.log(`New admin keypair generated and saved to ${ADMIN_KEYPAIR_FILE}`);
    return adminKeypair;
}
function loadAdminKeypair() {
    if (!fs.existsSync(ADMIN_KEYPAIR_FILE)) {
        throw new Error(`Admin keypair file not found. Please run the 'create-wallet' command first.`);
    }
    const adminPrivateKey = JSON.parse(fs.readFileSync(ADMIN_KEYPAIR_FILE, 'utf-8'));
    return web3_js_1.Keypair.fromSecretKey(Uint8Array.from(adminPrivateKey));
}
async function checkAdminBalance() {
    const adminKeypair = loadAdminKeypair();
    const balance = await connection.getBalance(adminKeypair.publicKey);
    console.log(`Admin balance: ${balance / 10 ** 9} SOL`);
}
async function airdropToAdmin() {
    const adminKeypair = loadAdminKeypair();
    const retries = 5;
    for (let i = 0; i < retries; i++) {
        try {
            const airdropSignature = await connection.requestAirdrop(adminKeypair.publicKey, 2 * 10 ** 9 // 2 SOL
            );
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            const confirmationStrategy = {
                signature: airdropSignature,
                blockhash,
                lastValidBlockHeight,
            };
            await connection.confirmTransaction(confirmationStrategy);
            console.log('Airdrop completed');
            return;
        }
        catch (error) {
            console.error(`Airdrop attempt ${i + 1} failed:`, error);
            if (i === retries - 1) {
                throw error;
            }
        }
    }
}
(0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .command('create-wallet', 'Create a new admin wallet', {}, async () => {
    try {
        const adminKeypair = createAdminKeypair();
        console.log(`Admin public key: ${adminKeypair.publicKey.toBase58()}`);
    }
    catch (error) {
        console.error('Error creating wallet:', error);
    }
})
    .command('check-balance', 'Check the balance of the admin wallet', {}, async () => {
    try {
        await checkAdminBalance();
    }
    catch (error) {
        console.error('Error checking balance:', error);
    }
})
    .command('airdrop', 'Airdrop SOL to the admin account', {}, async () => {
    try {
        await airdropToAdmin();
        await checkAdminBalance();
    }
    catch (error) {
        console.error('Error performing airdrop:', error);
    }
})
    .help()
    .strict()
    .parse();
