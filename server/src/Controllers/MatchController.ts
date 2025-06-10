import { MatchAPIConstants } from '@common/Constants/MatchAPIConstants';
import { MatchMetadata } from '@common/Models/MatchMetadata';
import { TournamentSocketAPI } from '@common/SocketAPIs/TournamentAPI';
import { Match } from 'brackets-model';
import express, { Router } from 'express';
import { Database } from '../Database/Database';
import { DatabaseError, DatabaseErrorType } from '../Database/DatabaseError';
import { TournamentManager } from '../Managers/TournamentManager';
import { RequireRole } from '../MiddleWare/RequireRoleMiddleware';

namespace MatchController {
  export const path = MatchAPIConstants.BASE_PATH;
  export const router = express.Router();
  router.get(MatchAPIConstants.GET_MATCH(), async (req, resp) => {
    const data = await TournamentManager.instance.getMatch(req.params.tid, Number(req.params.mid));
    if (data) {
      resp.json(data);
    } else {
      resp.sendStatus(404);
    }
  });

  router.get(MatchAPIConstants.GET_ALL_MATCH_METADATA(), async (req, resp) => {
    try {
      const data = await Database.instance.getMatchMetadata(req.params.tid);
      resp.json(data);
      return;
    } catch (err) {
      if (err instanceof DatabaseError && err.type === DatabaseErrorType.MissingRecord) {
        resp.sendStatus(404);
        return;
      }
      console.log(err);
      resp.sendStatus(500);
    }
  });

  router.get(MatchAPIConstants.GET_MATCH_METADATA(), async (req, resp) => {
    try {
      const data = await Database.instance.getMatchMetadata(req.params.tid, Number(req.params.mid));
      resp.json(data);
      return;
    } catch (err) {
      if (err instanceof DatabaseError && err.type === DatabaseErrorType.MissingRecord) {
        resp.sendStatus(404);
        return;
      }
      resp.sendStatus(500);
    }
  });

  router.put(MatchAPIConstants.ADD_MATCH_METADATA(),RequireRole('Admin') ,async (req, resp) => {
    const metadata: MatchMetadata = req.body;
    if (metadata.matchId !== Number(req.params.mid) || metadata.tournamentId !== req.params.tid) {
      resp.sendStatus(400);
    }

    await Database.instance.addMatchMetadata(metadata);
    TournamentSocketAPI.onmatchmetadataupdated.invoke(metadata);
    resp.sendStatus(201);
  });

  router.put(MatchAPIConstants.SELECT_WINNER(), RequireRole('Admin'),
    async (req, resp) => {
      const body: MatchAPIConstants.WinnerUpdate = req.body;
      const success = await TournamentManager.instance.selectWinner(req.params.tid, body.winnerId, Number(req.params.mid));
      if (!success) {
        // TODO check if this is the correct code to send.
        resp.sendStatus(404);
        return;
      }
      resp.sendStatus(200);
    });

  router.put(MatchAPIConstants.FORFEIT(), RequireRole('Admin'),
    async (req, resp) => {
      const body: MatchAPIConstants.ForfeitUpdate = req.body;
      const success = await TournamentManager.instance.forfeit(req.params.tid, body.forfeitId, Number(req.params.mid));
      if (!success) {
        // TODO check if this is the correct code to send.
        resp.sendStatus(404);
        return;
      }
      resp.sendStatus(200);
    });

  router.put(MatchAPIConstants.UPDATE_SCORE(), RequireRole('Admin'),
    async (req, resp) => {
      const body: MatchAPIConstants.ScoreUpdate = req.body;

      const success = await TournamentManager.instance.updateScore(req.params.tid, body.teamId, Number(req.params.mid), body.delta);
      if (!success) {
        // TODO check if this is the correct code to send.
        resp.sendStatus(404);
        return;
      }
      resp.sendStatus(200);
    });

  router.put(MatchAPIConstants.UPDATE_STATE(), RequireRole('Admin'),
    async (req, resp) => {
      const body: MatchAPIConstants.StateUpdate = req.body;
      if (Number(req.params.mid) !== body.match.id) {
        resp.sendStatus(400);
        return;
      }
      const success = await TournamentManager.instance.updateMatch(req.params.tid, Number(req.params.mid), {
        status: body.state
      });
      if (!success) {
        resp.sendStatus(404);
        return;
      }
      resp.sendStatus(200);
    });

    router.get(MatchAPIConstants.RESET_MATCH(),RequireRole('Admin'), async (req,resp) => {
      try {
        await TournamentManager.instance.reset(req.params.tid, Number(req.params.mid));
      } catch {
        resp.sendStatus(500);
      }
      resp.sendStatus(200);
    });

  router.put(MatchAPIConstants.UPDATE(), RequireRole('Admin'),
    async (req, resp) => {
      const body: Partial<Match> = req.body;
      const success = await TournamentManager.instance.updateMatch(req.params.tid, Number(req.params.mid), body);
      if (!success) {
        resp.sendStatus(404);
        return;
      }
      resp.sendStatus(200);
    });
}
const both: [string, Router] = [MatchController.path, MatchController.router];
export { both as MatchController };
