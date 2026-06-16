import hre from "hardhat";
import "dotenv/config";
const { ethers } = hre;

async function main() {
  const recipientAddress = process.env.RECIPIENT_ADDRESS;
  if (!recipientAddress) {
    throw new Error("RECIPIENT_ADDRESS not set in .env");
  }

  console.log("=== PSL Token Transfer & Ownership ===\n");
  
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer wallet: ${deployer.address}`);
  console.log(`Recipient address: ${recipientAddress}\n`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer balance: ${ethers.formatEther(balance)} MATIC\n`);

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})\n`);

  // Load deployed token contract
  const deploymentFile = `./deployments/PSLToken-${network.chainId}.json`;
  const fs = await import("fs");
  
  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Deployment file not found: ${deploymentFile}. Run deploy script first.`);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));
  const tokenAddress = deployment.address;
  
  console.log(`Token contract: ${tokenAddress}\n`);

  const PSLToken = await ethers.getContractFactory("PSLToken");
  const token = PSLToken.attach(tokenAddress);

  // Check current balances and ownership
  const deployerBalance = await token.balanceOf(deployer.address);
  const currentOwner = await token.owner();
  const totalSupply = await token.totalSupply();

  console.log("Current state:");
  console.log(`  Current owner: ${currentOwner}`);
  console.log(`  Total supply: ${ethers.formatEther(totalSupply)} PSL`);
  console.log(`  Deployer balance: ${ethers.formatEther(deployerBalance)} PSL\n`);

  // Transfer all tokens to recipient
  if (deployerBalance > 0n) {
    console.log(`Transferring ${ethers.formatEther(deployerBalance)} PSL to ${recipientAddress}...`);
    const transferTx = await token.transfer(recipientAddress, deployerBalance);
    await transferTx.wait();
    console.log(`✓ Transfer complete: ${transferTx.hash}\n`);
  } else {
    console.log("No tokens to transfer (deployer balance is 0)\n");
  }

  // Transfer ownership
  if (currentOwner.toLowerCase() === deployer.address.toLowerCase()) {
    console.log(`Transferring contract ownership to ${recipientAddress}...`);
    const ownershipTx = await token.transferOwnership(recipientAddress);
    await ownershipTx.wait();
    console.log(`✓ Ownership transferred: ${ownershipTx.hash}\n`);
  } else {
    console.log(`Ownership already transferred to ${currentOwner}\n`);
  }

  // Final state
  const finalRecipientBalance = await token.balanceOf(recipientAddress);
  const finalOwnership = await token.owner();
  
  console.log("=== Final State ===");
  console.log(`Contract owner: ${finalOwnership}`);
  console.log(`Recipient (${recipientAddress}) balance: ${ethers.formatEther(finalRecipientBalance)} PSL`);
  console.log(`Deployer (${deployer.address}) balance: ${ethers.formatEther(await token.balanceOf(deployer.address))} PSL\n`);
  
  console.log("✓ Token deployment and transfer complete!");
  console.log(`\nToken address: ${tokenAddress}`);
  console.log(`Network: ${network.name}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
