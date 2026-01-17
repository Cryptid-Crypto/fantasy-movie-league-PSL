import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as db from './db';

describe('Tournament Entry Validation', () => {
  let testUserId: number;
  let testTournamentId: number;
  let testPerformer1Id: number;
  let testPerformer2Id: number;
  let testPerformer3Id: number;

  beforeAll(async () => {
    // Create test user
    await db.upsertUser({
      openId: 'test-user-validation',
      name: 'Test User Validation',
      email: 'validation@example.com',
    });
    const testUser = await db.getUserByOpenId('test-user-validation');
    testUserId = testUser!.id;

    // Create test performers with different types
    testPerformer1Id = await db.createPerformer({
      name: 'Test Legend',
      performerType: 'Legend',
    });

    testPerformer2Id = await db.createPerformer({
      name: 'Test Anal Queen',
      performerType: 'Anal Queen',
    });

    testPerformer3Id = await db.createPerformer({
      name: 'Test Rising Star',
      performerType: 'Rising Star',
    });

    // Sync NFTs for the user
    await db.syncUserNft({
      userId: testUserId,
      performerId: testPerformer1Id,
      contractAddress: '0xtest',
      tokenId: 'token-1',
    });

    await db.syncUserNft({
      userId: testUserId,
      performerId: testPerformer2Id,
      contractAddress: '0xtest',
      tokenId: 'token-2',
    });

    await db.syncUserNft({
      userId: testUserId,
      performerId: testPerformer3Id,
      contractAddress: '0xtest',
      tokenId: 'token-3',
    });

    // Create test tournament
    testTournamentId = await db.createTournament({
      name: 'Test Validation Tournament',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-30'),
    });

    // Add roster requirements: 1 Legend, 1 Anal Queen
    await db.createTournamentRosterRequirement({
      tournamentId: testTournamentId,
      performerType: 'Legend',
      requiredCount: 1,
    });

    await db.createTournamentRosterRequirement({
      tournamentId: testTournamentId,
      performerType: 'Anal Queen',
      requiredCount: 1,
    });
  });

  afterAll(async () => {
    // Cleanup
    if (testPerformer1Id) await db.deletePerformer(testPerformer1Id);
    if (testPerformer2Id) await db.deletePerformer(testPerformer2Id);
    if (testPerformer3Id) await db.deletePerformer(testPerformer3Id);
  });

  it('should validate NFT ownership correctly', async () => {
    const userNfts = await db.getUserNfts(testUserId);
    expect(userNfts).toHaveLength(3);

    const nftMap = new Map(userNfts.map(nft => [`${nft.performerId}-${nft.tokenId}`, nft]));
    
    // Should find owned NFT
    expect(nftMap.has(`${testPerformer1Id}-token-1`)).toBe(true);
    
    // Should not find non-owned NFT
    expect(nftMap.has(`${testPerformer1Id}-token-999`)).toBe(false);
  });

  it('should validate roster requirements correctly', async () => {
    const requirements = await db.getTournamentRosterRequirements(testTournamentId);
    expect(requirements).toHaveLength(2);

    const userNfts = await db.getUserNfts(testUserId);
    const userNftMap = new Map(userNfts.map(nft => [`${nft.performerId}-${nft.tokenId}`, nft]));

    // Valid roster: 1 Legend + 1 Anal Queen
    const validRoster = [
      { performerId: testPerformer1Id, nftTokenId: 'token-1' },
      { performerId: testPerformer2Id, nftTokenId: 'token-2' },
    ];

    const rosterPerformerTypes = new Map<string | null, number>();
    for (const performer of validRoster) {
      const nft = userNftMap.get(`${performer.performerId}-${performer.nftTokenId}`);
      const performerType = nft?.performerType || null;
      rosterPerformerTypes.set(performerType, (rosterPerformerTypes.get(performerType) || 0) + 1);
    }

    // Check requirements
    let isValid = true;
    for (const req of requirements) {
      const requiredType = req.performerType;
      const requiredCount = req.requiredCount;
      const actualCount = rosterPerformerTypes.get(requiredType) || 0;
      
      if (actualCount < requiredCount) {
        isValid = false;
        break;
      }
    }

    expect(isValid).toBe(true);
  });

  it('should detect invalid roster (missing required type)', async () => {
    const requirements = await db.getTournamentRosterRequirements(testTournamentId);
    const userNfts = await db.getUserNfts(testUserId);
    const userNftMap = new Map(userNfts.map(nft => [`${nft.performerId}-${nft.tokenId}`, nft]));

    // Invalid roster: 1 Legend + 1 Rising Star (missing Anal Queen)
    const invalidRoster = [
      { performerId: testPerformer1Id, nftTokenId: 'token-1' },
      { performerId: testPerformer3Id, nftTokenId: 'token-3' },
    ];

    const rosterPerformerTypes = new Map<string | null, number>();
    for (const performer of invalidRoster) {
      const nft = userNftMap.get(`${performer.performerId}-${performer.nftTokenId}`);
      const performerType = nft?.performerType || null;
      rosterPerformerTypes.set(performerType, (rosterPerformerTypes.get(performerType) || 0) + 1);
    }

    // Check requirements
    const unmetRequirements: string[] = [];
    for (const req of requirements) {
      const requiredType = req.performerType;
      const requiredCount = req.requiredCount;
      const actualCount = rosterPerformerTypes.get(requiredType) || 0;
      
      if (actualCount < requiredCount) {
        unmetRequirements.push(`${requiredCount} ${requiredType}`);
      }
    }

    expect(unmetRequirements.length).toBeGreaterThan(0);
    expect(unmetRequirements).toContain('1 Anal Queen');
  });

  it('should allow entry with valid roster', async () => {
    const entryId = await db.enterTournament({
      tournamentId: testTournamentId,
      userId: testUserId,
      totalScore: 0,
    });

    expect(entryId).toBeGreaterThan(0);

    // Add valid roster
    await db.addPerformerToEntry({
      entryId,
      performerId: testPerformer1Id,
      nftTokenId: 'token-1',
    });

    await db.addPerformerToEntry({
      entryId,
      performerId: testPerformer2Id,
      nftTokenId: 'token-2',
    });

    const entryPerformers = await db.getEntryPerformers(entryId);
    expect(entryPerformers).toHaveLength(2);
  });

  it('should allow updating entry roster', async () => {
    const entry = await db.getUserTournamentEntry(testTournamentId, testUserId);
    expect(entry).toBeDefined();

    // Delete existing performers
    await db.deleteEntryPerformers(entry!.id);

    // Add new roster (still valid)
    await db.addPerformerToEntry({
      entryId: entry!.id,
      performerId: testPerformer1Id,
      nftTokenId: 'token-1',
    });

    await db.addPerformerToEntry({
      entryId: entry!.id,
      performerId: testPerformer2Id,
      nftTokenId: 'token-2',
    });

    const updatedPerformers = await db.getEntryPerformers(entry!.id);
    expect(updatedPerformers).toHaveLength(2);
  });
});
