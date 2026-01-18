import { ethers } from "hardhat";

async function main() {
  console.log("Deploying TournamentEscrow contract...");

  const TournamentEscrow = await ethers.getContractFactory("TournamentEscrow");
  const escrow = await TournamentEscrow.deploy();

  await escrow.waitForDeployment();

  const address = await escrow.getAddress();
  console.log(`TournamentEscrow deployed to: ${address}`);
  console.log("\nSave this address to your environment variables:");
  console.log(`ESCROW_CONTRACT_ADDRESS=${address}`);
  
  console.log("\nVerify contract on Polygonscan:");
  console.log(`npx hardhat verify --network polygonAmoy ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
