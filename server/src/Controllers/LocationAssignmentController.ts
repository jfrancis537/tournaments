import { LocationAssignmentAPIConstants } from '@common/Constants/LocationAssignmentAPIConstants';
import { MatchMetadata } from '@common/Models/MatchMetadata';
import { TournamentState } from '@common/Models/Tournament';
import { TournamentSocketAPI } from '@common/SocketAPIs/TournamentAPI';
import express, { Router } from 'express';
import { AlgorithmParams, TournamentWithMatches, assignLocations } from '../Algorithms/LocationAssignment';
import { Database } from '../Database/Database';
import { DatabaseError, DatabaseErrorType } from '../Database/DatabaseError';
import { TeamManager } from '../Managers/TeamManager';
import { TournamentManager } from '../Managers/TournamentManager';
import { RequireRole } from '../MiddleWare/RequireRoleMiddleware';
import { asyncHandler } from '../Utilities/AsyncHandler';

namespace LocationAssignmentController {
  export const path = LocationAssignmentAPIConstants.BASE_PATH;
  export const router = express.Router();

  router.post(LocationAssignmentAPIConstants.PREVIEW, RequireRole('Admin'), asyncHandler(async (req, resp) => {
    const body: LocationAssignmentAPIConstants.PreviewRequest = req.body;

    if (!body.tournamentIds || body.tournamentIds.length === 0) {
      resp.status(400).json({ error: 'At least one tournament must be selected.' });
      return;
    }
    if (!body.locations || body.locations.length === 0) {
      resp.status(400).json({ error: 'At least one location is required.' });
      return;
    }
    if (!body.matchDurationMinutes || body.matchDurationMinutes <= 0) {
      resp.status(400).json({ error: 'Match duration must be greater than 0.' });
      return;
    }

    const tournamentsWithMatches: TournamentWithMatches[] = [];

    for (const tid of body.tournamentIds) {
      const tournament = await TournamentManager.instance.getTournament(tid);
      if (!tournament) {
        resp.status(404).json({ error: `Tournament ${tid} not found.` });
        return;
      }
      if (tournament.state !== TournamentState.Finalizing) {
        resp.status(400).json({ error: `Tournament "${tournament.name}" is not in Finalizing state.` });
        return;
      }
      const matches = await TournamentManager.instance.getMatchesForTournament(tid);
      const teams = await TeamManager.instance.getTeams(tid) ?? [];
      tournamentsWithMatches.push({ tournament, matches, teams });
    }

    const params: AlgorithmParams = {
      locations: body.locations,
      matchDurationMinutes: body.matchDurationMinutes,
      gapMinutes: body.gapMinutes ?? 0,
      windowStartHour: body.windowStartHour,
      windowStartMinute: body.windowStartMinute ?? 0,
      windowEndHour: body.windowEndHour,
      windowEndMinute: body.windowEndMinute ?? 0,
    };

    try {
      const assignments = assignLocations(tournamentsWithMatches, params);
      resp.json(assignments);
    } catch (err) {
      // Algorithm errors (e.g. no slot fits) are user-facing 400s, not server errors.
      resp.status(400).json({ error: err instanceof Error ? err.message : 'Algorithm failed.' });
    }
  }));

  router.post(LocationAssignmentAPIConstants.CONFIRM, RequireRole('Admin'), asyncHandler(async (req, resp) => {
    const body: LocationAssignmentAPIConstants.ConfirmRequest = req.body;

    if (!body.assignments || body.assignments.length === 0) {
      resp.status(400).json({ error: 'No assignments provided.' });
      return;
    }

    const tournamentIds = [...new Set(body.assignments.map(a => a.tournamentId))];
    const existingMetadataByTournament = new Map<string, Map<number, MatchMetadata>>();

    for (const tid of tournamentIds) {
      try {
        const metadataList = await Database.instance.getMatchMetadata(tid);
        const byMatchId = new Map<number, MatchMetadata>();
        for (const m of metadataList) {
          byMatchId.set(m.matchId, m);
        }
        existingMetadataByTournament.set(tid, byMatchId);
      } catch (err) {
        if (err instanceof DatabaseError && err.type === DatabaseErrorType.MissingRecord) {
          existingMetadataByTournament.set(tid, new Map());
        } else {
          throw err;
        }
      }
    }

    const entries: MatchMetadata[] = body.assignments.map(a => {
      const existing = existingMetadataByTournament.get(a.tournamentId)?.get(a.matchId);
      return {
        tournamentId: a.tournamentId,
        matchId: a.matchId,
        title: existing?.title ?? '',
        location: a.location,
        scheduledTime: a.scheduledTime,
      };
    });

    await Database.instance.bulkUpsertMatchMetadata(entries);

    for (const entry of entries) {
      TournamentSocketAPI.onmatchmetadataupdated.invoke(entry);
    }

    resp.sendStatus(200);
  }));
}

const both: [string, Router] = [LocationAssignmentController.path, LocationAssignmentController.router];
export { both as LocationAssignmentController };
