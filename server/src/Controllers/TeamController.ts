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
      const pairs: ([string, number] | undefined)[] = teamIds.map((id, i) => {
        if (!id) {
          return undefined;
        }
        return [id, i];
      });
      const toAssign = pairs.filter(item => !!item) as [string, number][];
      await TeamManager.instance.assignSeedNumbers(toAssign);
      if (await TournamentManager.instance.setTournamentSeeded(req.params.id)) {
        resp.sendStatus(201);
      } else {
        resp.sendStatus(500);
      }

    });

  router.put(TeamAPIConstants.REGISTER_TEAM(), async (req, resp) => {
    const body: TeamAPIConstants.TeamRegistrationRequest = req.body;
    let result: TeamAPIConstants.TeamRegistrationResult;
    try {
      const registration = await TeamManager.instance.registerTeam({
        name: body.teamName,
        contactEmail: body.contactEmail,
        players: [],
        tournamentId: req.params.id
      });
      result = registration[0];
    } catch (err) {
      result = TeamAPIConstants.TeamRegistrationResult.SERVER_ERROR;
    }
    const response: TeamAPIConstants.TeamRegistrationResponse = {
      result
    }
    switch (result) {
      case TeamAPIConstants.TeamRegistrationResult.SUCCESS:
        resp.status(200).json(response);
        break;
      case TeamAPIConstants.TeamRegistrationResult.REGISTRATION_CLOSED:
      case TeamAPIConstants.TeamRegistrationResult.INVALID_EMAIL:
        resp.status(400).json(response);
        break;
      case TeamAPIConstants.TeamRegistrationResult.NO_SUCH_TOURNAMENT:
        resp.status(404).json(response);
        break;
      case TeamAPIConstants.TeamRegistrationResult.SERVER_ERROR:
        resp.status(500).json(response);
        break;
    }
  });

  router.get(TeamAPIConstants.GET_TEAMS(), async (req, resp) => {
    const tournamentId = req.params.id;
    const teams = await TeamManager.instance.getTeams(tournamentId);
    if (!teams) {
      resp.sendStatus(404);
      return;
    }
    resp.send(teams);
  });
}

const both: [string, Router] = [TeamController.path, TeamController.router];
export { both as TeamController };