import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("Deploying PSLToken contract...");

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying from address: ${deployer.address}`);
  console.log(`Deployer balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} MATIC`);

  const PSLToken = await ethers.getContractFactory("PSLToken");
  const token = await PSLToken.deploy(deployer.address);

  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log(`\nPSLToken deployed to: ${address}`);
  console.log(`\nToken details:`);
  console.log(`  Name: ${await token.name()}`);
  console.log(`  Symbol: ${await token.symbol()}`);
  console.log(`  Decimals: ${await token.decimals()}`);
  console.log(`  Total Supply: ${ethers.formatEther(await token.totalSupply())} PSL`);
  console.log(`  Max Supply: ${ethers.formatEther(await token.MAX_SUPPLY())} PSL`);
  console.log(`  Owner: ${await token.owner()}`);

  console.log("\nSave this address to your environment variables:");
  console.log(`PSL_TOKEN_ADDRESS=${address}`);

  console.log("\nVerify contract on Polygonscan:");
  console.log(`npx hardhat verify --network polygonAmoy ${address} ${deployer.address}`);
  console.log(`npx hardhat verify --network polygon ${address} ${deployer.address}`);

  // Save deployment info
  const fs = await import("fs");
  const deploymentInfo = {
    contract: "PSLToken",
    address,
    deployer: deployer.address,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    timestamp: new Date().toISOString(),
    name: await token.name(),
    symbol: await token.symbol(),
    decimals: (await token.decimals()).toString(),
    totalSupply: (await token.totalSupply()).toString(),
  };
  
  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentFile = `${deploymentsDir}/PSLToken-${deploymentInfo.chainId}.json`;
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: ${deploymentFile}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });