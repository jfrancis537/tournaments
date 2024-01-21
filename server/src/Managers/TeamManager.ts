import { Team } from "@common/Models/Team";
import { Lazy } from "@common/Utilities/Lazy";
import { v4 as uuid } from "uuid";
import { Database } from "../Database/Database";
import { TeamAPIConstants } from "@common/Constants/TeamAPIConstants";
import { TournamentManager } from "./TournamentManager";
import { Tournament } from "@common/Models/Tournament";
import { TeamSocketAPI } from "@common/SocketAPIs/TeamAPI";
import { DatabaseError, DatabaseErrorType } from "../Database/DatabaseError";

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

  public async deleteTeams(tournamentId: string) {
    await Database.instance.deleteTeams(tournamentId);
  }

  public async registerTeam(options: TeamOptions): Promise<[TeamAPIConstants.TeamRegistrationResult, Team | undefined]> {
  
    const teams = (await this.getTeams(options.tournamentId)) ?? [];

    const tournament = await TournamentManager.instance.getTournament(options.tournamentId)
    if (!tournament) {
      return [TeamAPIConstants.TeamRegistrationResult.NO_SUCH_TOURNAMENT, undefined]
    } else {
      if (!Tournament.isRegistrationOpen(tournament)) {
        return [TeamAPIConstants.TeamRegistrationResult.REGISTRATION_CLOSED, undefined]
      }
    }

    for (const existing of teams) {
      if (existing.contactEmail === options.contactEmail &&
        existing.tournamentId === options.tournamentId) {
        return [TeamAPIConstants.TeamRegistrationResult.INVALID_EMAIL, undefined]
      }
    }

    const team: Team = {
      id: uuid(),
      seedNumber: undefined,
      ...options
    }

    try {
      await Database.instance.addTeam(team);
      TeamSocketAPI.onteamcreated.invoke(team);
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
      const team = await this.getTeam(id);
      if (!team) {
        throw new Error(`Team with id: ${id} does not exist.`);
      }
      team.seedNumber = seed;
      TeamSocketAPI.onteamseednumberassigned.invoke(team);
    }
  }

}

const instance = new Lazy(() => new TeamManager());
export { instance as TeamManager };