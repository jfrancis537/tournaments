import { TeamAPIConstants } from "@common/Constants/TeamAPIConstants";
import express, { Router } from "express";
import { TeamManager } from "../Managers/TeamManager";
import { RequireRole } from "../MiddleWare/RequireRoleMiddleware";
import { TournamentManager } from "../Managers/TournamentManager";

namespace TeamController {
  export const path = TeamAPIConstants.BASE_PATH;
  export const router = express.Router();

  router.post(TeamAPIConstants.ASSIGN_SEED_NUMBERS(), RequireRole('admin'),
    async (req, resp) => {
      const teamIds: (string | null)[] = req.body;
      const pairs: ([string,number] | undefined)[] =teamIds.map((id,i) => {
        if(!id)
        {
          return undefined;
        }
        return [id,i];
      });
      const toAssign = pairs.filter(item => !!item) as [string,number][];
      await TeamManager.instance.assignSeedNumbers(toAssign);
      if(await TournamentManager.instance.setTournamentSeeded(req.params.id)) {
        resp.sendStatus(201);
      } else {
        resp.sendStatus(500);
      }

    });

  router.get(TeamAPIConstants.GET_TEAMS(), (req, resp) => {
    const tournamentId = req.params.id;
    const teams = TeamManager.instance.getTeams(tournamentId);
    if (!teams) {
      resp.sendStatus(404);
      return;
    }
    resp.send(teams);
  });
}

const both: [string, Router] = [TeamController.path, TeamController.router];
export { both as TeamController };