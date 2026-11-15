const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

/**
 * Deploys BatchRegistry and writes the address to deployments/<network>.json.
 *
 *   npx hardhat run scripts/deploy.js --network localhost
 *   npx hardhat run scripts/deploy.js --network sepolia
 *
 * Optional: REGISTRAR_ADDRESS=0x... grants the backend wallet permission to
 * register and revoke batches (when it differs from the deployer).
 */
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Network:  ${hre.network.name}`);
  console.log(`Deployer: ${deployer.address}`);

  const BatchRegistry = await hre.ethers.getContractFactory("BatchRegistry");
  const contract = await BatchRegistry.deploy();
  await contract.deployed();
  console.log(`BatchRegistry deployed: ${contract.address}`);

  const registrar = process.env.REGISTRAR_ADDRESS;
  if (registrar && registrar.toLowerCase() !== deployer.address.toLowerCase()) {
    const role = await contract.REGISTRAR_ROLE();
    const tx = await contract.grantRole(role, registrar);
    await tx.wait();
    console.log(`Granted REGISTRAR_ROLE to ${registrar}`);
  }

  const outDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, `${hre.network.name}.json`),
    JSON.stringify(
      { network: hre.network.name, address: contract.address, deployer: deployer.address, deployedAt: new Date().toISOString() },
      null,
      2,
    ),
  );
  console.log(`\nSet BLOCKCHAIN_CONTRACT_ADDRESS=${contract.address} in the backend environment.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
