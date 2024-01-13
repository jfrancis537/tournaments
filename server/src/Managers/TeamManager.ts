import { Team } from "@common/Models/Team";
import { Lazy } from "@common/Utilities/Lazy";
import { v4 as uuid } from "uuid";
import { Database, TeamData } from "../Database/Database";

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

  public getTeam(id: string)
  {
    return this.teams.get(id);
  }

  public async registerTeam(options: TeamOptions) {
    if (!this.tournamentToTeams.has(options.tournamentId)) {
      this.tournamentToTeams.set(options.tournamentId, []);
    }
    const team: Team = {
      id: uuid(),
      seedNumber: undefined,
      ...options
    }
    this.teams.set(team.id, team);
    const teams = this.tournamentToTeams.get(options.tournamentId)!;
    teams.push(team.id);
    await this.save();
    return team;
  }

  public async assignSeedNumbers(toAssign: [string,number | undefined][])
  {
    for(const [id,seed] of toAssign) {
      const team = this.teams.get(id);
      if(!team)
      {
        throw new Error(`Team with id: ${id} does not exist.`);
      }
      team.seedNumber = seed;
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