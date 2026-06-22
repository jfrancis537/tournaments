import { TournamentAPIConstants } from '@common/Constants/TournamentAPIConstants';
import { Tournament, TournamentMetadata, TournamentOptions, TournamentState } from '@common/Models/Tournament';
import express, { Router } from 'express';
import { TeamManager } from '../Managers/TeamManager';
import { TournamentManager } from '../Managers/TournamentManager';
import { RequireRole } from '../MiddleWare/RequireRoleMiddleware';
import { asyncHandler } from '../Utilities/AsyncHandler';

namespace TournamentManagerController {
  export const path = TournamentAPIConstants.BASE_PATH;
  export const router = express.Router();

  router.get(TournamentAPIConstants.GET_ALL_TOURNAMENTS, asyncHandler(async (_req, resp) => {
    const data = await TournamentManager.instance.getTournaments();
    resp.status(200).json(data);
  }));

  router.get(TournamentAPIConstants.GET_TOURNAMENT(), asyncHandler(async (req, resp) => {
    const data = await TournamentManager.instance.getTournament(req.params.id);
    if (!data) {
      resp.sendStatus(404);
      return;
    }
    resp.json(data);
  }));

  router.get(TournamentAPIConstants.GET_TOURNAMENT_DATA(), asyncHandler(async (req, resp) => {
    const data = await TournamentManager.instance.getTournamentData(req.params.id);
    if (data) {
      resp.json(data);
    } else {
      resp.sendStatus(404);
    }
  }));

  router.post(TournamentAPIConstants.START_TOURNAMENT(), RequireRole('Admin'), asyncHandler(async (req, resp) => {
    const success = await TournamentManager.instance.startTournament(req.params.id);
    if (success) {
      resp.sendStatus(200);
    } else {
      resp.sendStatus(404);
    }
  }));

  router.post(TournamentAPIConstants.SET_STATE(), RequireRole('Admin'), asyncHandler(async (req, resp) => {
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
        resp.sendStatus(400);
        break;
      case TournamentState.RegistrationOpen:
        await TournamentManager.instance.openRegistration(tournament.id);
        break;
      case TournamentState.RegistrationConfirmation:
        await TournamentManager.instance.closeRegistration(tournament.id);
        break;
      case TournamentState.Seeding:
        await TournamentManager.instance.finalizeRegistrations(tournament.id);
        break;
      case TournamentState.Finalizing:
        {
          const success = await TournamentManager.instance.finalizeTournament(tournament.id);
          if (!success) {
            resp.sendStatus(400);
          }
        }
        break;
      case TournamentState.Active:
        resp.sendStatus(400);
        return;
      case TournamentState.Complete:
        await TournamentManager.instance.completeTournament(tournament.id);
        break;
    }
    resp.sendStatus(200);
  }));

  router.delete(TournamentAPIConstants.DELETE_TOURNAMENT(), RequireRole('Admin'), asyncHandler(async (req, resp) => {
    const tournament = await TournamentManager.instance.getTournament(req.params.id);
    if (!tournament) {
      resp.sendStatus(404);
      return;
    }
    await TournamentManager.instance.deleteTournament(req.params.id);
    await TeamManager.instance.deleteTeams(req.params.id);
    resp.sendStatus(204);
  }));

  router.put(TournamentAPIConstants.CREATE_TOURNAMENT(), RequireRole('Admin'), asyncHandler(async (req, resp) => {
    const options: TournamentOptions = Tournament.Deserialize(req.body);
    const t = await TournamentManager.instance.createNewTournament(options);
    resp.status(201).json(t);
  }));

  router.put(TournamentAPIConstants.SET_METADATA(), RequireRole('Admin'), asyncHandler(async (req, resp) => {
    const body: TournamentMetadata = req.body;
    const tournament = await TournamentManager.instance.getTournament(req.params.id);
    if (!tournament) {
      resp.sendStatus(404);
      return;
    }
    await TournamentManager.instance.setTournamentMetadata(body);
    resp.sendStatus(201);
  }));

  router.get(TournamentAPIConstants.GET_METADATA(), asyncHandler(async (req, resp) => {
    const metadata = await TournamentManager.instance.getTournamentMetadata(req.params.id);
    if (!metadata) {
      resp.sendStatus(404);
      return;
    }
    resp.status(200).json(metadata);
  }));
}

const both: [string, Router] = [TournamentManagerController.path, TournamentManagerController.router];
export { both as TournamentManagerController };
