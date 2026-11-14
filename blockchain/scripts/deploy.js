const hre = require("hardhat");

async function main() {
  const BatchRegistry =
    await hre.ethers.getContractFactory(
      "BatchRegistry"
    );

  const contract =
    await BatchRegistry.deploy();

  await contract.deployed();

  console.log(
    "BatchRegistry deployed:",
    contract.address
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });