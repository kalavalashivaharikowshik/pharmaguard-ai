require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("dotenv").config();

const path = require("path");
const { subtask } = require("hardhat/config");
const { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } = require("hardhat/builtin-tasks/task-names");

// Use the solc compiler bundled in node_modules when the official download
// server is unreachable (offline / restricted networks). Set USE_LOCAL_SOLC=false
// to let Hardhat download the native compiler instead.
if (process.env.USE_LOCAL_SOLC !== "false") {
  subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD, async (args, hre, runSuper) => {
    if (args.solcVersion === "0.8.20") {
      const compilerPath = path.join(__dirname, "node_modules", "solc", "soljson.js");
      return { compilerPath, isSolcJs: true, version: args.solcVersion, longVersion: "0.8.20+commit.a1b79de6" };
    }
    return runSuper();
  });
}

const { SEPOLIA_RPC_URL, DEPLOYER_PRIVATE_KEY } = process.env;

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    hardhat: {},
    localhost: { url: "http://127.0.0.1:8545" },
    ...(SEPOLIA_RPC_URL && DEPLOYER_PRIVATE_KEY
      ? { sepolia: { url: SEPOLIA_RPC_URL, accounts: [DEPLOYER_PRIVATE_KEY] } }
      : {}),
  },
};
