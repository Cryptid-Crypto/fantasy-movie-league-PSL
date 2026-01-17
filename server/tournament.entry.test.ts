import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as db from './db';

describe('Tournament Roster Entry', () => {
  let testUserId: number;
  let testTournamentId: number;
  let testPerformer1Id: number;
  let testPerformer2Id: number;

  beforeAll(async () => {
    // Create test user
    await db.upsertUser({
      openId: 'test-user-roster-entry',
      name: 'Test User',
      email: 'test@example.com',
    });
    const testUser = await db.getUserByOpenId('test-user-roster-entry');
    testUserId = testUser!.id;

    // Create test performers
    testPerformer1Id = await db.createPerformer({
      name: 'Test Performer 1',
      performerType: 'Legend',
    });

    testPerformer2Id = await db.createPerformer({
      name: 'Test Performer 2',
      performerType: 'Anal Queen',
    });

    // Create test tournament
    testTournamentId = await db.createTournament({
      name: 'Test Roster Tournament',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
    });

    // Add roster requirements
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
    // Cleanup performers only (tournament entries cascade delete)
    if (testPerformer1Id) {
      await db.deletePerformer(testPerformer1Id);
    }
    if (testPerformer2Id) {
      await db.deletePerformer(testPerformer2Id);
    }
  });

  it('should create tournament entry with multiple performers', async () => {
    // Create entry
    const entryId = await db.enterTournament({
      tournamentId: testTournamentId,
      userId: testUserId,
      totalScore: 0,
    });

    expect(entryId).toBeGreaterThan(0);

    // Add performers to entry
    const performer1EntryId = await db.addPerformerToEntry({
      entryId,
      performerId: testPerformer1Id,
      nftTokenId: 'token-1',
    });

    const performer2EntryId = await db.addPerformerToEntry({
      entryId,
      performerId: testPerformer2Id,
      nftTokenId: 'token-2',
    });

    expect(performer1EntryId).toBeGreaterThan(0);
    expect(performer2EntryId).toBeGreaterThan(0);

    // Verify entry performers
    const entryPerformers = await db.getEntryPerformers(entryId);
    expect(entryPerformers).toHaveLength(2);
    expect(entryPerformers[0].performerId).toBe(testPerformer1Id);
    expect(entryPerformers[1].performerId).toBe(testPerformer2Id);
    expect(entryPerformers[0].nftTokenId).toBe('token-1');
    expect(entryPerformers[1].nftTokenId).toBe('token-2');
  });

  it('should fetch roster requirements for tournament', async () => {
    const requirements = await db.getTournamentRosterRequirements(testTournamentId);

    expect(requirements).toHaveLength(2);
    expect(requirements[0].performerType).toBe('Legend');
    expect(requirements[0].requiredCount).toBe(1);
    expect(requirements[1].performerType).toBe('Anal Queen');
    expect(requirements[1].requiredCount).toBe(1);
  });

  it('should include performer types in entry performers query', async () => {
    // Get the entry from the first test
    const existingEntry = await db.getUserTournamentEntry(testTournamentId, testUserId);
    expect(existingEntry).toBeDefined();

    const entryPerformers = await db.getEntryPerformers(existingEntry!.id);
    expect(entryPerformers.length).toBeGreaterThan(0);
    
    const legendPerformer = entryPerformers.find(ep => ep.performerId === testPerformer1Id);
    expect(legendPerformer).toBeDefined();
    expect(legendPerformer!.performerType).toBe('Legend');
    expect(legendPerformer!.performerName).toBe('Test Performer 1');
  });
});
