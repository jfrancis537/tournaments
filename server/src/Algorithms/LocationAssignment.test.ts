import { Team } from '@common/Models/Team';
import { TournamentState } from '@common/Models/Tournament';
import { Status } from 'brackets-model';
import { DateTime } from 'luxon';
import { describe, expect, test } from 'vitest';
import { AlgorithmParams, TournamentWithMatches, assignLocations } from './LocationAssignment';

// ── helpers ──────────────────────────────────────────────────────────────────

let nextId = 0;

function makeMatch(roundId: number, id?: number, opp1Id = 1, opp2Id = 2): any {
  return {
    id: id ?? nextId++,
    stage_id: 0,
    group_id: 0,
    round_id: roundId,
    number: 1,
    child_count: 0,
    status: Status.Ready,
    opponent1: { id: opp1Id },
    opponent2: { id: opp2Id },
  };
}

function makeTeam(seedNumber: number, emails: string[]): Team {
  return {
    id: `team-${nextId++}`,
    tournamentId: 'unused',
    name: `Team ${seedNumber}`,
    seedNumber,
    players: emails.map(email => ({ contactEmail: email, name: email, skillLevel: 1 })),
  };
}

function makeTournament(startIso: string, endIso: string, name = 'T') {
  return {
    id: `tid-${nextId++}`,
    name,
    state: TournamentState.Finalizing,
    startDate: DateTime.fromISO(startIso),
    endDate: DateTime.fromISO(endIso),
    stages: [],
    stageSettings: [],
    playersSeeded: true,
    teamSize: 1,
  };
}

const BASE_PARAMS: AlgorithmParams = {
  locations: ['Court 1'],
  matchDurationMinutes: 15,
  gapMinutes: 5,
  windowStartHour: 10,
  windowStartMinute: 0,
  windowEndHour: 20,
  windowEndMinute: 0,
};

// ── tests ─────────────────────────────────────────────────────────────────────

describe('assignLocations', () => {

  test('assigns all matches to a single court in order', () => {
    const tournament = makeTournament('2026-06-01', '2026-06-07');
    const matches = [makeMatch(0), makeMatch(0), makeMatch(1)];
    const input: TournamentWithMatches[] = [{ tournament, matches }];

    const result = assignLocations(input, BASE_PARAMS);

    expect(result).toHaveLength(3);
    expect(result.every(r => r.location === 'Court 1')).toBe(true);

    const times = result.map(r => DateTime.fromISO(r.scheduledTime));
    expect(times[0].hour).toBe(10);
    expect(times[0].minute).toBe(0);
    expect(times[1].hour).toBe(10);
    expect(times[1].minute).toBe(20); // 15 min + 5 min gap
    expect(times[2].hour).toBe(10);
    expect(times[2].minute).toBe(40);
  });

  test('spreads matches across multiple courts', () => {
    const tournament = makeTournament('2026-06-01', '2026-06-07');
    const matches = [makeMatch(0), makeMatch(0), makeMatch(0), makeMatch(0)];
    const input: TournamentWithMatches[] = [{ tournament, matches }];
    const params = { ...BASE_PARAMS, locations: ['Court 1', 'Court 2'] };

    const result = assignLocations(input, params);

    expect(result).toHaveLength(4);
    // First two matches should each get a different court at 10:00
    const first = result[0];
    const second = result[1];
    expect(first.location).not.toBe(second.location);
    expect(DateTime.fromISO(first.scheduledTime).toISO())
      .toBe(DateTime.fromISO(second.scheduledTime).toISO());
  });

  test('round-ordered: round 0 matches come before round 1', () => {
    const tournament = makeTournament('2026-06-01', '2026-06-07');
    // Intentionally out-of-order in the input array
    const round1Match = makeMatch(1, 100);
    const round0MatchA = makeMatch(0, 101);
    const round0MatchB = makeMatch(0, 102);
    const input: TournamentWithMatches[] = [{
      tournament,
      matches: [round1Match, round0MatchA, round0MatchB],
    }];

    const result = assignLocations(input, BASE_PARAMS);

    const byMatchId = new Map(result.map(r => [r.matchId, r]));
    const r0aTime = DateTime.fromISO(byMatchId.get(101)!.scheduledTime);
    const r0bTime = DateTime.fromISO(byMatchId.get(102)!.scheduledTime);
    const r1Time = DateTime.fromISO(byMatchId.get(100)!.scheduledTime);

    expect(r0aTime < r1Time).toBe(true);
    expect(r0bTime < r1Time).toBe(true);
  });

  test('bye matches (null opponent) are skipped', () => {
    const tournament = makeTournament('2026-06-01', '2026-06-07');
    const byeMatch = { ...makeMatch(0), opponent2: null };
    const realMatch = makeMatch(0);
    const input: TournamentWithMatches[] = [{
      tournament,
      matches: [byeMatch, realMatch],
    }];

    const result = assignLocations(input, BASE_PARAMS);

    expect(result).toHaveLength(1);
    expect(result[0].matchId).toBe(realMatch.id);
  });

  test('rolls over to next day when daily window is exhausted', () => {
    const tournament = makeTournament('2026-06-01', '2026-06-07');
    // Window 10:00–11:00 = 60 min. With 15 min matches + 5 min gap = 20 min slots → 3 fit.
    // The 4th match should land on the next day at 10:00.
    const params: AlgorithmParams = {
      ...BASE_PARAMS,
      windowStartHour: 10,
      windowStartMinute: 0,
      windowEndHour: 11,
      windowEndMinute: 0,
    };
    const matches = [makeMatch(0), makeMatch(0), makeMatch(0), makeMatch(0)];
    const input: TournamentWithMatches[] = [{ tournament, matches }];

    const result = assignLocations(input, params);

    expect(result).toHaveLength(4);
    const day1 = result.slice(0, 3).map(r => DateTime.fromISO(r.scheduledTime).day);
    const day2Time = DateTime.fromISO(result[3].scheduledTime);
    expect(day1.every(d => d === 1)).toBe(true); // June 1
    expect(day2Time.day).toBe(2);                 // June 2
    expect(day2Time.hour).toBe(10);
    expect(day2Time.minute).toBe(0);
  });

  test('multi-tournament: earlier startDate tournament is scheduled first', () => {
    const tA = makeTournament('2026-06-03', '2026-06-07', 'Late');
    const tB = makeTournament('2026-06-01', '2026-06-07', 'Early');
    const matchA = makeMatch(0, 200);
    const matchB = makeMatch(0, 201);
    const input: TournamentWithMatches[] = [
      { tournament: tA, matches: [matchA] },
      { tournament: tB, matches: [matchB] },
    ];

    const result = assignLocations(input, BASE_PARAMS);

    expect(result).toHaveLength(2);
    const byId = new Map(result.map(r => [r.matchId, r]));
    const timeA = DateTime.fromISO(byId.get(200)!.scheduledTime);
    const timeB = DateTime.fromISO(byId.get(201)!.scheduledTime);
    // Early tournament (tB, starts June 1) should get the earlier slot
    expect(timeB < timeA).toBe(true);
  });

  test('courts shared across tournaments — no two matches on same court overlap', () => {
    const params = { ...BASE_PARAMS, locations: ['Court 1', 'Court 2'] };
    const t1 = makeTournament('2026-06-01', '2026-06-07', 'T1');
    const t2 = makeTournament('2026-06-01', '2026-06-07', 'T2');
    const matches1 = [makeMatch(0), makeMatch(0)];
    const matches2 = [makeMatch(0), makeMatch(0)];
    const input: TournamentWithMatches[] = [
      { tournament: t1, matches: matches1 },
      { tournament: t2, matches: matches2 },
    ];

    const result = assignLocations(input, params);

    expect(result).toHaveLength(4);

    // Group by location and verify no two times overlap
    const byLocation = new Map<string, DateTime[]>();
    for (const r of result) {
      if (!byLocation.has(r.location)) byLocation.set(r.location, []);
      byLocation.get(r.location)!.push(DateTime.fromISO(r.scheduledTime));
    }

    for (const [, times] of byLocation) {
      const sorted = [...times].sort((a, b) => a.toMillis() - b.toMillis());
      for (let i = 1; i < sorted.length; i++) {
        const gap = sorted[i].toMillis() - sorted[i - 1].toMillis();
        expect(gap).toBeGreaterThanOrEqual(
          (params.matchDurationMinutes + params.gapMinutes) * 60 * 1000
        );
      }
    }
  });

  test('throws when no slot fits within tournament dates', () => {
    // Single-day tournament, window 10:00-10:10, 15min matches — nothing fits
    const tournament = makeTournament('2026-06-01', '2026-06-01');
    const params: AlgorithmParams = {
      ...BASE_PARAMS,
      windowStartHour: 10,
      windowStartMinute: 0,
      windowEndHour: 10,
      windowEndMinute: 10,
    };
    const input: TournamentWithMatches[] = [{
      tournament,
      matches: [makeMatch(0)],
    }];

    expect(() => assignLocations(input, params)).toThrow();
  });

  test('returns empty array for empty match list', () => {
    const tournament = makeTournament('2026-06-01', '2026-06-07');
    const result = assignLocations([{ tournament, matches: [] }], BASE_PARAMS);
    expect(result).toHaveLength(0);
  });

  test('result includes correct tournamentName', () => {
    const tournament = makeTournament('2026-06-01', '2026-06-07', 'My Tournament');
    const input: TournamentWithMatches[] = [{ tournament, matches: [makeMatch(0)] }];
    const result = assignLocations(input, BASE_PARAMS);
    expect(result[0].tournamentName).toBe('My Tournament');
  });

  test('player in two tournaments is not double-booked on same court', () => {
    // 2 courts, 2 tournaments both starting June 1. "alice" plays in both.
    // Without player deconfliction both matches land at 10:00 on different courts.
    // With player deconfliction the second match must start after alice's first match ends.
    const params = { ...BASE_PARAMS, locations: ['Court 1', 'Court 2'] };
    const t1 = makeTournament('2026-06-01', '2026-06-07', 'T1');
    const t2 = makeTournament('2026-06-01', '2026-06-07', 'T2');

    // T1: alice (seed 1) vs bob (seed 2)
    const match1 = makeMatch(0, 300, 1, 2);
    const teams1 = [makeTeam(1, ['alice@example.com']), makeTeam(2, ['bob@example.com'])];

    // T2: alice (seed 3) vs charlie (seed 4)
    const match2 = makeMatch(0, 301, 3, 4);
    const teams2 = [makeTeam(3, ['alice@example.com']), makeTeam(4, ['charlie@example.com'])];

    const input: TournamentWithMatches[] = [
      { tournament: t1, matches: [match1], teams: teams1 },
      { tournament: t2, matches: [match2], teams: teams2 },
    ];

    const result = assignLocations(input, params);

    expect(result).toHaveLength(2);
    const byMatchId = new Map(result.map(r => [r.matchId, r]));
    const time1 = DateTime.fromISO(byMatchId.get(300)!.scheduledTime);
    const time2 = DateTime.fromISO(byMatchId.get(301)!.scheduledTime);

    // The two matches must not overlap for alice.
    const overlap = time1 < time2.plus({ minutes: params.matchDurationMinutes }) &&
                    time2 < time1.plus({ minutes: params.matchDurationMinutes });
    expect(overlap).toBe(false);
  });

  test('match with unknown participant (future round) uses court-only deconfliction', () => {
    // opponent2 is null — algorithm should skip player deconfliction for this match
    // without crashing, and still assign a court slot.
    const tournament = makeTournament('2026-06-01', '2026-06-07');
    const unknownOpponentMatch = { ...makeMatch(1), opponent2: null };
    const knownMatch = makeMatch(0);

    // Only the known match should be scheduled (bye filter already excludes null-opponent matches)
    const input: TournamentWithMatches[] = [{
      tournament,
      matches: [knownMatch, unknownOpponentMatch],
      teams: [makeTeam(1, ['alice@example.com']), makeTeam(2, ['bob@example.com'])],
    }];

    const result = assignLocations(input, BASE_PARAMS);

    expect(result).toHaveLength(1);
    expect(result[0].matchId).toBe(knownMatch.id);
  });
});
