const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

async function main() {
  const provider = new ethers.JsonRpcProvider('https://polygon-bor-rpc.publicnode.com');
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  const recipient = ethers.getAddress(process.env.RECIPIENT_ADDRESS);

  console.log('=== PSL Token Deployment (Polygon Mainnet) ===');
  console.log('Deployer:', wallet.address);
  console.log('Recipient (ownership target):', recipient);
  console.log('Wallet balance:', ethers.formatEther(await provider.getBalance(wallet.address)), 'POL');

  // Load compiled artifact
  const artifact = JSON.parse(fs.readFileSync(
    './artifacts/contracts/PSLToken.sol/PSLToken.json',
    'utf-8'
  ));

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  console.log('\nDeploying PSLToken... (this can take ~30s on mainnet)');

  const tx = await factory.deploy(wallet.address);
  console.log('Deploy tx sent:', tx.deploymentTransaction().hash);

  const contract = await tx.waitForDeployment();
  const contractAddr = await contract.getAddress();
  console.log('✅ Contract deployed at:', contractAddr);

  // Verify it's real
  const balance = await provider.getBalance(contractAddr);
  const code = await provider.getCode(contractAddr);
  console.log('   Contract code length:', code.length, 'bytes');
  console.log('   Token name:', await contract.name());
  console.log('   Symbol:', await contract.symbol());
  console.log('   Owner:', await contract.owner());
  console.log('   Total supply:', ethers.formatEther(await contract.totalSupply()));

  // Transfer 100M PSL tokens to recipient
  const initialSupply = await contract.balanceOf(wallet.address);
  if (initialSupply > 0n) {
    console.log('\n--- Transferring', ethers.formatEther(initialSupply), 'PSL to', recipient);
    const transferTx = await contract.transfer(recipient, initialSupply);
    await transferTx.wait();
    console.log('✅ Tokens transferred:', transferTx.hash);
  }

  // Transfer ownership
  console.log('--- Transferring contract ownership to', recipient);
  const ownerTx = await contract.transferOwnership(recipient);
  await ownerTx.wait();
  console.log('✅ Ownership transferred:', ownerTx.hash);

  // Final state
  console.log('\n=== FINAL STATE ===');
  console.log('Token address:', contractAddr);
  console.log('Owner:', await contract.owner());
  console.log('Recipient PSL balance:', ethers.formatEther(await contract.balanceOf(recipient)));
  console.log('Deployer PSL balance:', ethers.formatEther(await contract.balanceOf(wallet.address)));

  // Update the site config so the site uses the real address
  const correctAddr = contractAddr;
  console.log('\n=== UPDATE THESE FILES ===');
  console.log('shared/contracts.ts -> PSL_TOKEN:', correctAddr);
  console.log('client/src/lib/web3Config.ts -> PSL_TOKEN_ADDRESSES[137]:', correctAddr);

  // Save deployment record
  fs.writeFileSync('./deployments/PSLToken-137.json', JSON.stringify({
    contract: 'PSLToken',
    address: correctAddr,
    deployer: wallet.address,
    recipient,
    network: 'polygon',
    chainId: '137',
    timestamp: new Date().toISOString(),
    name: await contract.name(),
    symbol: await contract.symbol(),
    decimals: (await contract.decimals()).toString(),
    totalSupply: (await contract.totalSupply()).toString(),
    deployTxHash: tx.deploymentTransaction().hash,
  }, null, 2));
  console.log('\nDeployment info saved to deployments/PSLToken-137.json');
}

main().catch(e => { console.error(e); process.exit(1); });
