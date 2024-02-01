import { TournamentAPIConstants } from '@common/Constants/TournamentAPIConstants';
import express, { Router } from 'express';
import { TournamentManager } from '../Managers/TournamentManager';
import { Tournament, TournamentOptions, TournamentState } from '@common/Models/Tournament';
import { RequireRole } from '../MiddleWare/RequireRoleMiddleware';
import { TeamManager } from '../Managers/TeamManager';

namespace TournamentManagerController {
  export const path = TournamentAPIConstants.BASE_PATH;
  export const router = express.Router();

  router.get(TournamentAPIConstants.GET_ALL_TOURNAMENTS, async (req, resp) => {
    const data = await TournamentManager.instance.getTournaments();
    resp.status(200).json(data);
  });

  router.get(TournamentAPIConstants.GET_TOURNAMENT(), async (req, resp) => {
    const data = await TournamentManager.instance.getTournament(req.params.id);
    if (!data) {
      resp.sendStatus(404);
      return;
    }
    resp.json(data);

  });

  router.get(TournamentAPIConstants.GET_TOURNAMENT_DATA(), async (req, resp) => {
    const data = await TournamentManager.instance.getTournamentData(req.params.id);
    if (data) {
      resp.json(data);
    } else {
      resp.sendStatus(404);
    }
  });

  router.post(TournamentAPIConstants.START_TOURNAMENT(), RequireRole('admin'),
    async (req, resp) => {
      const success = await TournamentManager.instance.startTournament(req.params.id);
      if (success) {
        resp.sendStatus(200);
      } else {
        resp.sendStatus(404);
      }
    });

  router.post(TournamentAPIConstants.SET_STATE(), RequireRole('admin'),
    async (req, resp) => {
      const body: TournamentAPIConstants.SetTournamentStateRequest = (req.body);
      const tournament = await TournamentManager.instance.getTournament(req.params.id);
      if (!tournament) {
        resp.sendStatus(404);
        return;
      }

      if (tournament.state >= body.state) {
        resp.sendStatus(400);
        return;
      }

      switch (body.state) {
        case TournamentState.New:
          // State can't be reset to new.
          resp.sendStatus(400);
          break;
        case TournamentState.RegistrationOpen:
          await TournamentManager.instance.openRegistration(tournament.id);
          break;
        case TournamentState.RegistrationConfirmation:
          await TournamentManager.instance.closeRegistration(tournament.id);
          break;
        case TournamentState.Seeding:
          //await TournamentManager.instance.closeRegistration(tournament.id);
          // THis will be where final registrations will be approved.
          break;
        case TournamentState.Finalizing:
          const success = await TournamentManager.instance.finalizeTournament(tournament.id);
          if (!success) {
            resp.sendStatus(400);
          }
          break;
        case TournamentState.Active:
          // This should be done via start tournament.
          resp.sendStatus(400);
          return;
        case TournamentState.Complete:
          await TournamentManager.instance.completeTournament(tournament.id);
          break;
      }
      resp.sendStatus(200);
    });

  router.delete(TournamentAPIConstants.DELETE_TOURNAMENT(), RequireRole('admin'),
    async (req, resp) => {
      const tournament = await TournamentManager.instance.getTournament(req.params.id);
      if (!tournament) {
        resp.sendStatus(404);
        return;
      }

      await TournamentManager.instance.deleteTournament(req.params.id);
      await TeamManager.instance.deleteTeams(req.params.id);
      resp.sendStatus(204);
    });

  router.put(TournamentAPIConstants.CREATE_TOURNAMENT(), RequireRole('admin'),
    async (req, resp) => {
      const options: TournamentOptions = Tournament.Deserialize(req.body);
      const t = await TournamentManager.instance.createNewTournament(options);
      resp.status(201).json(t);
    });
}
const both: [string, Router] = [TournamentManagerController.path, TournamentManagerController.router];
export { both as TournamentManagerController };
