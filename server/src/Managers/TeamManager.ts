import { Team } from "@common/Models/Team";
import { Lazy } from "@common/Utilities/Lazy";
import { v4 as uuid } from "uuid";
import { Database } from "../Database/Database";
import { TeamAPIConstants } from "@common/Constants/TeamAPIConstants";
import { TournamentManager } from "./TournamentManager";
import { Tournament } from "@common/Models/Tournament";
import { TeamSocketAPI } from "@common/SocketAPIs/TeamAPI";
import { DatabaseError, DatabaseErrorType } from "../Database/DatabaseError";
import { RegistrationData } from "@common/Models/RegistrationData";
import { CodeChoice } from "@common/Enums/RegistrationEnums";
import { MailManager } from "./MailManager";
import { EnvironmentVariables } from "../Utilities/EnvironmentVariables";
import RegistrationReceivedEmail from "../Templates/RegistrationReceivedEmail";

type TeamOptions = Omit<Omit<Team, 'id'>, 'seedNumber'>

class TeamManager {

  public async getTeams(tournamentId: string): Promise<Team[] | undefined> {

    try {
      return await Database.instance.getTeams(tournamentId);
    } catch (err) {
      if (err instanceof DatabaseError && err.type === DatabaseErrorType.MissingRecord) {
        return undefined;
      }
      throw err;
    }
  }

  public async getTeam(id: string) {
    try {
      return await Database.instance.getTeam(id);
    } catch (err) {
      if (err instanceof DatabaseError && err.type === DatabaseErrorType.MissingRecord) {
        return undefined;
      }
      throw err;
    }
  }

  public async getRegistrations(tournamentId: string) {
    try {
      return await Database.instance.getRegistrations(tournamentId);
    } catch (err) {
      if (err instanceof DatabaseError && err.type === DatabaseErrorType.MissingRecord) {
        return undefined;
      }
      throw err;
    }
  }

  public async updateRegistration(tournamentId: string, contactEmail: string, update: Partial<Omit<RegistrationData, 'contactEmail'>>) {
    try {
      const data = await Database.instance.updateRegistration(tournamentId, contactEmail, update);
      TeamSocketAPI.onregistrationchanged.invoke(data);
      return TeamAPIConstants.RegistrationUpdateResult.SUCCESS;
    } catch (err) {
      if (err instanceof DatabaseError) {
        if (err.type === DatabaseErrorType.MissingRecord) {
          return TeamAPIConstants.RegistrationUpdateResult.NO_SUCH_REGISTRATION;
        }
      }
      console.log(err);
    }
    return TeamAPIConstants.RegistrationUpdateResult.ERROR;

  }

  public async deleteTeams(tournamentId: string) {
    await Database.instance.deleteTeams(tournamentId);
  }

  public async registerTeam(tournamentId: string, data: TeamAPIConstants.TeamRegistrationRequest): Promise<[TeamAPIConstants.TeamRegistrationResult, RegistrationData | undefined]> {
    const registrations = (await this.getRegistrations(tournamentId)) ?? [];
    const tournament = await TournamentManager.instance.getTournament(tournamentId);

    if (!tournament) {
      return [TeamAPIConstants.TeamRegistrationResult.NO_SUCH_TOURNAMENT, undefined]
    } else {
      if (!Tournament.isRegistrationOpen(tournament)) {
        return [TeamAPIConstants.TeamRegistrationResult.REGISTRATION_CLOSED, undefined]
      }
    }

    if (data.teamCodeMode === CodeChoice.EXISTING &&
      registrations.findIndex((existing) => {
        return existing.teamCode?.trim() === data.teamCode?.trim();
      }) == -1) {
      return [TeamAPIConstants.TeamRegistrationResult.NO_TEAMMATE, undefined];
    }

    for (const existing of registrations) {
      if (existing.contactEmail === data.contactEmail &&
        existing.tournamentId === tournamentId) {
        return [TeamAPIConstants.TeamRegistrationResult.INVALID_EMAIL, undefined]
      }
    }

    const registration: RegistrationData = {
      approved: false,
      tournamentId: tournamentId,
      ...data
    }

    try {
      await Database.instance.addRegistration(registration);
      TeamSocketAPI.onregistrationcreated.invoke(registration);
      if (!registration.contactEmail.startsWith("UNK")) {
        MailManager.sendEmail({
          from: EnvironmentVariables.EMAIL_SENDER,
          to: registration.contactEmail,
          subject: `Registration received for ${tournament.name}`,
          html: RegistrationReceivedEmail(registration.name, tournament.name)
        }).then(success => {
          if (!success) {
            console.error('Failed to send registration received email to: ' + registration.contactEmail);
          }
        });
      }
      return [TeamAPIConstants.TeamRegistrationResult.SUCCESS, registration];
    } catch (err) {
      if (err instanceof DatabaseError && err.type === DatabaseErrorType.ExistingRecord) {
        // Return server error since this means we are adding a team we generated already.
        return [TeamAPIConstants.TeamRegistrationResult.SERVER_ERROR, undefined];
      }
      throw err;
    }
  }



  public async confirmTeamRegistration(options: TeamOptions): Promise<[TeamAPIConstants.TeamRegistrationResult, Team | undefined]> {

    const team: Team = {
      id: uuid(),
      seedNumber: undefined,
      ...options
    }

    try {
      await Database.instance.addTeam(team);
      return [TeamAPIConstants.TeamRegistrationResult.SUCCESS, team];
    } catch (err) {
      if (err instanceof DatabaseError && err.type === DatabaseErrorType.ExistingRecord) {
        // Return server error since this means we are adding a team we generated already.
        return [TeamAPIConstants.TeamRegistrationResult.SERVER_ERROR, undefined];
      }
      throw err;
    }
  }

  /**
   * This function assigns non-temporary seed numbers.
   */
  public async assignSeedNumbers(toAssign: [string, number | undefined][]) {
    for (const [id, seed] of toAssign) {
      try {
        const team = await Database.instance.setTeamSeedNumber(id, seed);
        TeamSocketAPI.onteamseednumberassigned.invoke(team);
      } catch (err) {
        if (err instanceof DatabaseError && err.type === DatabaseErrorType.MissingRecord) {
          throw new Error(`Team with id: ${id} does not exist.`);
        }
      }
    }
  }
}

const instance = new Lazy(() => new TeamManager());
export { instance as TeamManager };