import { LocationAssignmentAPIConstants } from "@common/Constants/LocationAssignmentAPIConstants";
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

  const results: LocationAssignmentAPIConstants.MatchAssignment[] = [];

  const sorted = [...tournamentsWithMatches].sort(
    (a, b) => a.tournament.startDate.toMillis() - b.tournament.startDate.toMillis()
  );

  for (const { tournament, matches } of sorted) {
    const tournamentStart = tournament.startDate.startOf('day').set({
      hour: params.windowStartHour,
      minute: params.windowStartMinute,
      second: 0,
      millisecond: 0,
    });
    const tournamentEnd = tournament.endDate.endOf('day');

    const schedulableMatches = matches
      .filter(m => m.opponent1 !== null && m.opponent2 !== null)
      .sort((a, b) => {
        if (a.round_id !== b.round_id) return (a.round_id as number) - (b.round_id as number);
        return (a.id as number) - (b.id as number);
      });

    for (const match of schedulableMatches) {
      let bestLocation: string | null = null;
      let bestTime: DateTime | null = null;

      for (const location of params.locations) {
        let candidate = locationNextAvailable.get(location)!;

        if (candidate < tournamentStart) {
          candidate = tournamentStart;
        }

        candidate = advanceToWindow(candidate, params);

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

      const slotEnd = bestTime.plus({ minutes: params.matchDurationMinutes + params.gapMinutes });
      locationNextAvailable.set(bestLocation, slotEnd);
    }
  }

  return results;
}
