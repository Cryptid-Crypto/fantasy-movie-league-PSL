import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const contractAddress = "0x67298C9de638c9aE7d4Bf4704Be95D00Ed6b1FF6";
  const newOwner = "0x9b4C7569036c201aFF1d670625B6259e1135362b";

  console.log("Transferring ownership on Amoy...");
  console.log(`Contract: ${contractAddress}`);
  console.log(`New Owner: ${newOwner}`);

  const [deployer] = await ethers.getSigners();
  console.log(`\nDeployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} POL`);

  const PSLToken = await ethers.getContractFactory("PSLToken");
  const token = PSLToken.attach(contractAddress);

  const currentOwner = await token.owner();
  console.log(`\nCurrent Owner: ${currentOwner}`);

  if (currentOwner.toLowerCase() === newOwner.toLowerCase()) {
    console.log("Ownership already transferred!");
    return;
  }

  console.log("\nInitiating transferOwnership...");
  const tx = await token.transferOwnership(newOwner);
  console.log(`Transaction sent: ${tx.hash}`);
  console.log("Waiting for confirmation...");

  await tx.wait();
  console.log("✅ Transfer confirmed!");

  const newOwnerCheck = await token.owner();
  console.log(`\nNew Owner: ${newOwnerCheck}`);
  console.log(newOwnerCheck.toLowerCase() === newOwner.toLowerCase() ? "✅ SUCCESS" : "❌ FAILED");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
