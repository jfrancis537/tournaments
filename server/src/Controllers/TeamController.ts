import { TeamAPIConstants } from "@common/Constants/TeamAPIConstants";
import express, { Router } from "express";
import { TeamManager } from "../Managers/TeamManager";
import { RequireRole } from "../MiddleWare/RequireRoleMiddleware";
import { TournamentManager } from "../Managers/TournamentManager";
import { generateRegistrationCode } from "../Utilities/Crypto";
import { RegistrationData } from "@common/Models/RegistrationData";

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

  router.post(TeamAPIConstants.SET_REGISTRATION_APPROVAL, RequireRole('admin'),
    async (req, resp) => {
      const request: TeamAPIConstants.SetRegistrationApprovalRequest = req.body;
      const result = await TeamManager.instance.updateRegistration(request.tournamentId,
        request.contactEmail,
        {
          approved: request.approval
        });

      switch (result) {
        case TeamAPIConstants.RegistrationUpdateResult.SUCCESS:
          resp.sendStatus(200);
          break;
        case TeamAPIConstants.RegistrationUpdateResult.ERROR:
          resp.sendStatus(500);
          break;
        case TeamAPIConstants.RegistrationUpdateResult.NO_SUCH_REGISTRATION:
          resp.sendStatus(400);
          break;
      }

    });

  router.put(TeamAPIConstants.SET_REGISTRATION_CODES, RequireRole('admin'),
    async (req, resp) => {
      const body: TeamAPIConstants.SetRegistrationCodesRequest = req.body;
      const existing = await TeamManager.instance.getRegistrations(body.tournamentId);
      const tournament = await TournamentManager.instance.getTournament(body.tournamentId);
      if (existing && tournament) {

        const updates: Map<string, Partial<Omit<RegistrationData, 'contactEmail'>>> = new Map();
        // Team code, count.
        const updateCounts: Map<string, number> = new Map();

        for (const registration of body.registrations) {
          // 400 for any mistake, and don't update anything.
          if (!registration.teamCode) {
            resp.status(400).send("Can not unset a registration code.");
            return;
          }

          const matched = existing.find(existingReg => {
            return existingReg.contactEmail === registration.contactEmail;
          });

          if (!matched) {
            resp.status(400).send("No such registration with contact: " + registration.contactEmail);
            return;
          }

          if (!matched.approved) {
            resp.status(400).send("Can't set team code for unapproved registration.");
          }

          // TODO: decide if we will want to be able to rearrange teams later.
          if (matched.teamCode !== undefined) {
            resp.status(400).send("Can not override an existing team code.");
          }

          updates.set(registration.contactEmail, {
            teamCode: registration.teamCode
          });
          const currentCount = updateCounts.get(registration.teamCode) ?? 0;
          updateCounts.set(registration.teamCode, currentCount + 1);
        }
        // Make sure there are the right number of updates.

        for (const [_, update] of updates) {
          if (updateCounts.get(update.teamCode!) !== tournament!.teamSize) {
            resp.sendStatus(400);
            return;
          }
        }

        for (const [email, update] of updates) {
          const result = await TeamManager.instance.updateRegistration(tournament.id, email, update);
          switch (result) {
            case TeamAPIConstants.RegistrationUpdateResult.SUCCESS:
              break;
            case TeamAPIConstants.RegistrationUpdateResult.ERROR:
              resp.sendStatus(500);
              return;
            case TeamAPIConstants.RegistrationUpdateResult.NO_SUCH_REGISTRATION:
              // Should be impossible at this point.
              resp.sendStatus(400);
              return;
          }
        }

        resp.sendStatus(200);
        return;
      } else {
        resp.sendStatus(404);
        return;
      }
    });

  router.put(TeamAPIConstants.REGISTER_TEAM(), async (req, resp) => {
    const body: TeamAPIConstants.TeamRegistrationRequest = req.body;
    let result: TeamAPIConstants.TeamRegistrationResult;
    try {
      const registration = await TeamManager.instance.registerTeam(req.params.id, body);
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

  router.get(TeamAPIConstants.GET_REGISTRATIONS(), RequireRole('admin'), async (req, resp) => {
    const tournamentId = req.params.id;
    const registrations = await TeamManager.instance.getRegistrations(tournamentId);
    if (!registrations) {
      resp.sendStatus(404);
      return;
    }
    resp.send(registrations);
  });

  router.get(TeamAPIConstants.CREATE_REGISTRATION_CODE, async (req, resp) => {
    const body: TeamAPIConstants.RegistrationCodeResponse = {
      code: await generateRegistrationCode()
    }

    resp.json(body);
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