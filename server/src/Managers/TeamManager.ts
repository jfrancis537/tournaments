import { Team } from "@common/Models/Team";
import { Lazy } from "@common/Utilities/Lazy";
import { v4 as uuid } from "uuid";
import { Database, TeamData } from "../Database/Database";
import { TeamAPIConstants } from "@common/Constants/TeamAPIConstants";
import { TournamentManager } from "./TournamentManager";
import { Tournament, TournamentState } from "@common/Models/Tournament";
import { TeamSocketAPI } from "@common/SocketAPIs/TeamAPI";

type TeamOptions = Omit<Omit<Team, 'id'>, 'seedNumber'>

class TeamManager {

  private teams: Map<string, Team>;
  private tournamentToTeams: Map<string, string[]>;

  constructor() {
    this.teams = new Map();
    this.tournamentToTeams = new Map();
  }

  public getTeams(tournamentId: string): Team[] | undefined {
    const teamIds = this.tournamentToTeams.get(tournamentId);
    if (teamIds) {
      return teamIds.map(id => this.teams.get(id)!);
    }
    return undefined;
  }

  public getTeam(id: string) {
    return this.teams.get(id);
  }

  public async deleteTeams(tournamentId: string) {
    const teamIds = this.tournamentToTeams.get(tournamentId);
    if (!teamIds) {
      return false;
    }

    this.tournamentToTeams.delete(tournamentId);

    for (const id of teamIds) {
      const team = this.teams.get(id);
      if (team) {
        this.teams.delete(id);
      }
    }

    await this.save();
    return true;
  }

  public async registerTeam(options: TeamOptions): Promise<[TeamAPIConstants.TeamRegistrationResult, Team | undefined]> {
    if (!this.tournamentToTeams.has(options.tournamentId)) {
      this.tournamentToTeams.set(options.tournamentId, []);
    }
    const tournament = TournamentManager.instance.getTournament(options.tournamentId)
    if (!tournament) {
      return [TeamAPIConstants.TeamRegistrationResult.NO_SUCH_TOURNAMENT, undefined]
    } else {
      if (!Tournament.isRegistrationOpen(tournament)) {
        return [TeamAPIConstants.TeamRegistrationResult.REGISTRATION_CLOSED, undefined]
      }
    }

    for (const existing of this.teams.values()) {
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
    this.teams.set(team.id, team);
    const teams = this.tournamentToTeams.get(options.tournamentId)!;
    teams.push(team.id);

    TeamSocketAPI.onteamcreated.invoke(team);

    await this.save();
    return [TeamAPIConstants.TeamRegistrationResult.SUCCESS, team];
  }

  /**
   * This function assigns non-temporary seed numbers.
   */
  public async assignSeedNumbers(toAssign: [string, number | undefined][]) {
    for (const [id, seed] of toAssign) {
      const team = this.teams.get(id);
      if (!team) {
        throw new Error(`Team with id: ${id} does not exist.`);
      }
      team.seedNumber = seed;
      TeamSocketAPI.onteamseednumberassigned.invoke(team);
    }
    await this.save();
  }

  private async save() {
    const data: TeamData = {
      teams: [...this.teams],
      tournamentToTeams: [...this.tournamentToTeams]
    }
    await Database.instance.setTeamData(data);
  }

  public async load() {
    const data = await Database.instance.getTeamData();
    this.teams = new Map(data.teams);
    this.tournamentToTeams = new Map(data.tournamentToTeams);
  }

}

const instance = new Lazy(() => new TeamManager());
export { instance as TeamManager };