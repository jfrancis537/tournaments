import { LocationAssignmentAPIConstants } from "@common/Constants/LocationAssignmentAPIConstants";
import { Team } from "@common/Models/Team";
import { Tournament } from "@common/Models/Tournament";
import { Match } from "brackets-model";
import { DateTime } from "luxon";

export interface AlgorithmParams {
  locations: string[];
  matchDurationMinutes: number;
  gapMinutes: number;
  windowStartHour: number;
  windowStartMinute: number;
  windowEndHour: number;
  windowEndMinute: number;
}

export interface TournamentWithMatches {
  tournament: Tournament;
  matches: Match[];
  teams?: Team[];
}

function advanceToWindow(time: DateTime, params: AlgorithmParams): DateTime {
  const windowStart = time.set({ hour: params.windowStartHour, minute: params.windowStartMinute, second: 0, millisecond: 0 });
  const windowEnd = time.set({ hour: params.windowEndHour, minute: params.windowEndMinute, second: 0, millisecond: 0 });

  if (time < windowStart) {
    return windowStart;
  }
  if (time >= windowEnd) {
    const nextDay = time.plus({ days: 1 }).startOf('day');
    return nextDay.set({ hour: params.windowStartHour, minute: params.windowStartMinute, second: 0, millisecond: 0 });
  }
  return time;
}

function buildParticipantMap(teams: Team[]): Map<number, Team> {
  const map = new Map<number, Team>();
  for (const team of teams) {
    if (team.seedNumber !== undefined) {
      map.set(team.seedNumber, team);
    }
  }
  return map;
}

function getMatchPlayerEmails(match: Match, participantMap: Map<number, Team>): string[] {
  const emails: string[] = [];
  const opp1Id = (match.opponent1 as { id?: number } | null)?.id;
  const opp2Id = (match.opponent2 as { id?: number } | null)?.id;

  if (opp1Id != null) {
    const team = participantMap.get(opp1Id);
    if (team) emails.push(...team.players.map(p => p.contactEmail));
  }
  if (opp2Id != null) {
    const team = participantMap.get(opp2Id);
    if (team) emails.push(...team.players.map(p => p.contactEmail));
  }
  return emails;
}

export function assignLocations(
  tournamentsWithMatches: TournamentWithMatches[],
  params: AlgorithmParams
): LocationAssignmentAPIConstants.MatchAssignment[] {
  if (params.locations.length === 0) {
    throw new Error('At least one location is required.');
  }

  const locationNextAvailable = new Map<string, DateTime>();
  for (const location of params.locations) {
    locationNextAvailable.set(location, DateTime.fromMillis(0));
  }

  // Tracks when each player (by email) is next free — shared across all tournaments.
  const playerNextAvailable = new Map<string, DateTime>();

  const results: LocationAssignmentAPIConstants.MatchAssignment[] = [];

  const sorted = [...tournamentsWithMatches].sort(
    (a, b) => a.tournament.startDate.toMillis() - b.tournament.startDate.toMillis()
  );

  for (const { tournament, matches, teams } of sorted) {
    const tournamentStart = tournament.startDate.startOf('day').set({
      hour: params.windowStartHour,
      minute: params.windowStartMinute,
      second: 0,
      millisecond: 0,
    });
    const tournamentEnd = tournament.endDate.endOf('day');

    const participantMap = buildParticipantMap(teams ?? []);

    const schedulableMatches = matches
      .filter(m => m.opponent1 !== null && m.opponent2 !== null)
      .sort((a, b) => {
        if (a.round_id !== b.round_id) return (a.round_id as number) - (b.round_id as number);
        return (a.id as number) - (b.id as number);
      });

    for (const match of schedulableMatches) {
      const playerEmails = getMatchPlayerEmails(match, participantMap);

      // Find the earliest time all players in this match are free.
      let playerBusyUntil = DateTime.fromMillis(0);
      for (const email of playerEmails) {
        const free = playerNextAvailable.get(email) ?? DateTime.fromMillis(0);
        if (free > playerBusyUntil) playerBusyUntil = free;
      }

      let bestLocation: string | null = null;
      let bestTime: DateTime | null = null;

      for (const location of params.locations) {
        let candidate = locationNextAvailable.get(location)!;

        // Must be after both the court is free AND all players are free.
        if (playerBusyUntil > candidate) candidate = playerBusyUntil;
        if (candidate < tournamentStart) candidate = tournamentStart;

        candidate = advanceToWindow(candidate, params);

        // If the match would run past today's window end, roll to next day's window start.
        const windowEndToday = candidate.set({
          hour: params.windowEndHour, minute: params.windowEndMinute, second: 0, millisecond: 0,
        });
        if (candidate.plus({ minutes: params.matchDurationMinutes }) > windowEndToday) {
          const nextDay = candidate.plus({ days: 1 }).startOf('day');
          candidate = nextDay.set({
            hour: params.windowStartHour, minute: params.windowStartMinute, second: 0, millisecond: 0,
          });
        }

        if (candidate > tournamentEnd) {
          continue;
        }

        if (bestTime === null || candidate < bestTime) {
          bestTime = candidate;
          bestLocation = location;
        }
      }

      if (bestLocation === null || bestTime === null) {
        throw new Error(
          `Cannot schedule match ${match.id} for tournament "${tournament.name}" (id: ${tournament.id}): no available slot within the tournament window.`
        );
      }

      results.push({
        tournamentId: tournament.id,
        tournamentName: tournament.name,
        matchId: match.id as number,
        location: bestLocation,
        scheduledTime: bestTime.toISO()!,
      });

      // Advance court availability by duration + gap (court turnaround time).
      locationNextAvailable.set(bestLocation, bestTime.plus({ minutes: params.matchDurationMinutes + params.gapMinutes }));

      // Block players until match ends (no extra gap — gap is for court turnaround only).
      const matchEnd = bestTime.plus({ minutes: params.matchDurationMinutes });
      for (const email of playerEmails) {
        playerNextAvailable.set(email, matchEnd);
      }
    }
  }

  return results;
}
