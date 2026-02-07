const solc = require("solc");
const fs = require("fs");
const path = require("path");

const contractsDir = path.join(__dirname, "..", "contracts");
const outputDir = path.join(__dirname, "..", "src", "abi");

// Read contract sources
const sources = {};
for (const file of fs.readdirSync(contractsDir)) {
  if (file.endsWith(".sol")) {
    sources[file] = {
      content: fs.readFileSync(path.join(contractsDir, file), "utf8"),
    };
  }
}

const input = {
  language: "Solidity",
  sources,
  settings: {
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode.object"],
      },
    },
    optimizer: { enabled: true, runs: 200 },
  },
};

console.log("Compiling contracts...");
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  for (const err of output.errors) {
    if (err.severity === "error") {
      console.error(err.formattedMessage);
      process.exit(1);
    } else {
      console.warn(err.formattedMessage);
    }
  }
}

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write ABI and bytecode for each contract
for (const [fileName, contracts] of Object.entries(output.contracts)) {
  for (const [contractName, contract] of Object.entries(contracts)) {
    const abiPath = path.join(outputDir, `${contractName}.json`);
    fs.writeFileSync(
      abiPath,
      JSON.stringify(
        {
          abi: contract.abi,
          bytecode: "0x" + contract.evm.bytecode.object,
        },
        null,
        2
      )
    );
    console.log(`  ${contractName} -> src/abi/${contractName}.json`);
  }
}

console.log("Compilation complete!");
