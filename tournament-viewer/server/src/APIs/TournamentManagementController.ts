import { TournamentAPIConstants } from '@common/Constants/TournamentAPIConstants';
import express, { Router } from 'express';
import { TournamentManager } from '../Managers/TournamentManager';
import { Tournament, TournamentOptions } from '@common/Models/Tournament';

namespace TournamentManagerController {
  export const path = TournamentAPIConstants.BASE_PATH;
  export const router = express.Router();

  router.get(TournamentAPIConstants.GET_TOURNAMENT_DATA(),async (req,resp) => {
    const data = await TournamentManager.instance.getTournamentData(req.params.id);
    if(data) {
      resp.json(data);
    } else {
      resp.sendStatus(404);
    }
  });

  // TODO - AUTH REQURIED
  router.post(TournamentAPIConstants.START_TOURNAMENT(),async (req,resp) => {
    const success = await TournamentManager.instance.startTournament(req.params.id);
    if(success)
    {
      resp.sendStatus(200);
    } else {
      resp.sendStatus(404);
    }
  });

  // TODO - AUTH REQURIED
  router.put(TournamentAPIConstants.CREATE_TOURNAMENT(),async (req,resp) => {
    const options: TournamentOptions = Tournament.Deserialize(req.body);
    const t = TournamentManager.instance.createNewTournament(options);
    resp.status(201).json(t);
  });
}
const both: [string,Router] = [TournamentManagerController.path,TournamentManagerController.router];
export {both as TournamentManagerController};
