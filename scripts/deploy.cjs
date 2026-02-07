/**
 * Deploy EyeFighterGame to World Chain Mainnet
 *
 * Uses real WLD token at 0x2cFc85d8E48F8EAB294be644d9E25C3030863003
 *
 * Prerequisites:
 *   1. Add GAME_PRIVATE_KEY to .env.local (deployer wallet with ETH on World Chain)
 *
 * Usage:
 *   node scripts/compile.cjs && node scripts/deploy.cjs
 */

const fs = require("fs");
const path = require("path");

async function main() {
  const { createWalletClient, createPublicClient, http, formatEther, defineChain } = await import("viem");
  const { privateKeyToAccount } = await import("viem/accounts");

  // Load env
  require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

  // World Chain Mainnet (chain ID 480)
  const worldchain = defineChain({
    id: 480,
    name: "World Chain",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: { http: ["https://worldchain-mainnet.g.alchemy.com/public"] },
    },
    blockExplorers: {
      default: { name: "WorldScan", url: "https://worldscan.org" },
    },
  });

  // Real WLD token on World Chain mainnet
  const WLD_TOKEN = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003";

  const privateKey = process.env.GAME_PRIVATE_KEY;
  if (!privateKey) {
    console.error("ERROR: GAME_PRIVATE_KEY not set in .env.local");
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey);
  console.log("Deployer:", account.address);
  console.log("Chain: World Chain Mainnet (480)");
  console.log("WLD Token:", WLD_TOKEN);

  const publicClient = createPublicClient({
    chain: worldchain,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account,
    chain: worldchain,
    transport: http(),
  });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log("Balance:", formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error("ERROR: No ETH balance on World Chain mainnet.");
    process.exit(1);
  }

  // Load compiled artifact
  const abiDir = path.join(__dirname, "..", "src", "abi");
  const gameArtifact = JSON.parse(fs.readFileSync(path.join(abiDir, "EyeFighterGame.json"), "utf8"));

  // Deploy EyeFighterGame with real WLD token address
  console.log("\n--- Deploying EyeFighterGame ---");
  const gameHash = await walletClient.deployContract({
    abi: gameArtifact.abi,
    bytecode: gameArtifact.bytecode,
    args: [WLD_TOKEN],
  });
  console.log("Tx hash:", gameHash);
  console.log("Waiting for confirmation...");
  const gameReceipt = await publicClient.waitForTransactionReceipt({ hash: gameHash });
  const gameAddr = gameReceipt.contractAddress;
  console.log("EyeFighterGame deployed:", gameAddr);
  console.log("Explorer:", `https://worldscan.org/address/${gameAddr}`);

  console.log("\n========================================");
  console.log("Add this to .env.local:");
  console.log("========================================");
  console.log(`NEXT_PUBLIC_GAME_CONTRACT=${gameAddr}`);
  console.log("========================================");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
