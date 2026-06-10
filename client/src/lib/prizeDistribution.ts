import { ethers } from 'ethers';
import {
  TOURNAMENT_ESCROW_ABI,
  TOURNAMENT_ESCROW_ADDRESSES,
} from '@/lib/web3Config';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export interface PrizeWinner {
  wallet: string;
  percentage: number;
}

/**
 * Distribute tournament prizes on-chain via the TournamentEscrow contract.
 *
 * Obtains a signer from the injected wallet (window.ethereum) using ethers v6,
 * matching the contract-interaction convention used elsewhere in this codebase
 * (see PLATFORM_GUIDE.md and lib/nftReader.ts).
 *
 * @param tournamentId  The on-chain tournament identifier.
 * @param winners       Winners with their wallet and prize percentage.
 * @returns The transaction hash of the confirmed distribution transaction.
 */
export async function distributePrizes(
  tournamentId: number,
  winners: PrizeWinner[]
): Promise<string> {
  const ethereum = (globalThis as { ethereum?: ethers.Eip1193Provider }).ethereum
    ?? (typeof window !== 'undefined'
      ? (window as Window & { ethereum?: ethers.Eip1193Provider }).ethereum
      : undefined);

  if (!ethereum) {
    throw new Error('Wallet not connected');
  }

  const provider = new ethers.BrowserProvider(ethereum);

  // Ensure an account is actually authorized/connected.
  const accounts = await provider.listAccounts();
  if (!accounts || accounts.length === 0) {
    throw new Error('Wallet not connected');
  }

  const signer = await provider.getSigner();

  const { chainId } = await provider.getNetwork();
  const contractAddress = TOURNAMENT_ESCROW_ADDRESSES[Number(chainId)];

  if (!contractAddress || contractAddress === ZERO_ADDRESS) {
    throw new Error(
      `TournamentEscrow contract is not configured for chain ${chainId}`
    );
  }

  const contract = new ethers.Contract(
    contractAddress,
    TOURNAMENT_ESCROW_ABI as ethers.InterfaceAbi,
    signer
  );

  const tx = await contract.distributePrizes(tournamentId, winners);
  const receipt = await tx.wait();

  // ethers v6: receipt.hash is the confirmed tx hash; fall back to tx.hash.
  return receipt?.hash ?? tx.hash;
}
