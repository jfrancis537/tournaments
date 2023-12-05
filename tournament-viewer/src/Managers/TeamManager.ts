import { Team } from "../Models/Team";
import { Lazy } from "../Utilities/Lazy";
import { v4 as uuid } from "uuid";

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

  public registerTeam(options: TeamOptions) {
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
  }

  // This should be called from the UI when a team is dragged and dropped to it's spot in the inital round.
  public assignSeedNumber(id: string, seed: number) {
    const team = this.teams.get(id);
    if(!team)
    {
      throw new Error(`Team with id: ${id} does not exist.`);
    }

    team.seedNumber = seed;
  }

}

const instance = new Lazy(() => new TeamManager());
export { instance as TeamManager };