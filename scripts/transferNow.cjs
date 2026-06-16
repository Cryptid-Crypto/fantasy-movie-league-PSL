const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  const provider = new ethers.JsonRpcProvider('https://polygon-bor-rpc.publicnode.com');
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  const recipient = process.env.RECIPIENT_ADDRESS;

  console.log('Deployer:', wallet.address);
  console.log('Recipient:', recipient);
  console.log('Wallet balance:', ethers.formatEther(await provider.getBalance(wallet.address)), 'POL');

  // Attach to deployed PSL token on Polygon mainnet
  // (lowercase bypasses checksum validation, getAddress re-checksums correctly)
  const PSL_TOKEN = ethers.getAddress('0xf171c26d2e93f7557259323f966491e7514d6b3c');
  console.log('Normalized token address:', PSL_TOKEN);
  const abi = [
    'function balanceOf(address) view returns (uint256)',
    'function transfer(address to, uint256 value) returns (bool)',
    'function transferOwnership(address newOwner)',
    'function owner() view returns (address)',
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function totalSupply() view returns (uint256)',
  ];

  const token = new ethers.Contract(PSL_TOKEN, abi, wallet);

  console.log('\nToken:', await token.name(), '(' + await token.symbol() + ')');
  console.log('Total supply:', ethers.formatEther(await token.totalSupply()), 'PSL');
  console.log('Current owner:', await token.owner());

  const deployerBalance = await token.balanceOf(wallet.address);
  const recipientBalanceBefore = await token.balanceOf(recipient);
  console.log('Deployer PSL balance:', ethers.formatEther(deployerBalance));
  console.log('Recipient PSL balance:', ethers.formatEther(recipientBalanceBefore));

  // 1. Transfer tokens
  if (deployerBalance > 0n) {
    console.log('\n--- Transferring ' + ethers.formatEther(deployerBalance) + ' PSL to ' + recipient);
    const tx = await token.transfer(recipient, deployerBalance);
    await tx.wait();
    console.log('✅ Transfer tx:', tx.hash);
  } else {
    console.log('\nNo tokens to transfer.');
  }

  // 2. Transfer ownership
  const currentOwner = await token.owner();
  if (currentOwner.toLowerCase() === wallet.address.toLowerCase()) {
    console.log('--- Transferring contract ownership to ' + recipient);
    const otx = await token.transferOwnership(recipient);
    await otx.wait();
    console.log('✅ Ownership tx:', otx.hash);
  } else {
    console.log('Ownership already transferred to:', currentOwner);
  }

  // 3. Final state
  console.log('\n=== Final State ===');
  console.log('Token owner:', await token.owner());
  console.log('Deployer PSL:', ethers.formatEther(await token.balanceOf(wallet.address)));
  console.log('Recipient PSL:', ethers.formatEther(await token.balanceOf(recipient)));
}

main().catch(e => { console.error(e); process.exit(1); });
