import { TeamAPIConstants } from "@common/Constants/TeamAPIConstants";
import express, { Router } from "express";
import { TeamManager } from "../Managers/TeamManager";
import { RequireRole } from "../MiddleWare/RequireRoleMiddleware";

namespace TeamController {
  export const path = TeamAPIConstants.BASE_PATH;
  export const router = express.Router();

  router.post(TeamAPIConstants.ASSIGN_SEED_NUMBERS(), RequireRole('admin'),
    (req, resp) => {
      const teamIds: (string | null)[] = req.body;
      for (let i = 0; i < teamIds.length; i++) {
        const id = teamIds[i];
        if (id) {
          TeamManager.instance.assignSeedNumber(id, i);
        }
      }
      resp.sendStatus(201);
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