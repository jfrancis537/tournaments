import express, { Router } from 'express';
import { TournamentManager } from '../Managers/TournamentManager';
import { MatchAPIConstants } from '@common/Constants/MatchAPIConstants';
import { Match } from 'brackets-model';
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

  router.put(MatchAPIConstants.SELECT_WINNER(), RequireRole('admin'),
    async (req, resp) => {
      const body: MatchAPIConstants.WinnerUpdate = req.body;
      if (Number(req.params.mid) !== body.match.id) {
        resp.sendStatus(400);
        return;
      }
      const success = await TournamentManager.instance.selectWinner(body.winnerId, body.match);
      if (!success) {
        // TODO check if this is the correct code to send.
        resp.sendStatus(404);
        return;
      }
      resp.sendStatus(200);
    });

  router.put(MatchAPIConstants.FORFEIT(), RequireRole('admin'),
    async (req, resp) => {
      const body: MatchAPIConstants.ForfeitUpdate = req.body;
      if (Number(req.params.mid) !== body.match.id) {
        resp.sendStatus(400);
        return;
      }
      const success = await TournamentManager.instance.forfeit(body.forfeitId, body.match);
      if (!success) {
        // TODO check if this is the correct code to send.
        resp.sendStatus(404);
        return;
      }
      resp.sendStatus(200);
    });

  router.put(MatchAPIConstants.UPDATE_SCORE(), RequireRole('admin'),
    async (req, resp) => {
      const body: MatchAPIConstants.ScoreUpdate = req.body;
      if (Number(req.params.mid) !== body.match.id) {
        resp.sendStatus(400);
        return;
      }
      const success = await TournamentManager.instance.updateScore(body.teamId, body.match, body.score);
      if (!success) {
        // TODO check if this is the correct code to send.
        resp.sendStatus(404);
        return;
      }
      resp.sendStatus(200);
    });

  router.put(MatchAPIConstants.UPDATE_STATE(), RequireRole('admin'),
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

  router.put(MatchAPIConstants.UPDATE(), RequireRole('admin'),
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
