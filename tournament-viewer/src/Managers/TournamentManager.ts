import { BracketsManager, CrudInterface, Database } from "brackets-manager";
import { InMemoryDatabase } from "brackets-memory-db";
import { v4 as uuid } from "uuid";
import { Tournament, TournamentState } from "../Models/Tournament";
import { Match, StageSettings, StageType, Status } from "brackets-model";
import { Lazy } from "../Utilities/Lazy";
import { TeamManager } from "./TeamManager";
import { Action } from "../Utilities/Action";

type TournamentOptions = Omit<Omit<Tournament, 'id'>,'state'>;

class TournamentManager {

  private readonly storage: CrudInterface;
  private readonly manager: BracketsManager;
  private readonly tournaments: Map<string, Tournament>;

  public readonly ontournamentcreated: Action<Readonly<Tournament>>;
  public readonly onregistrationopen: Action<Readonly<Tournament>>;
  public readonly onregistrationclosed: Action<Readonly<Tournament>>;
  public readonly ontournamentstarted: Action<Readonly<Tournament>>;

  // public readonly onforfeit: Action<unknown>;
  // public readonly onscoreupdated: Action<unknown>;
  // public readonly onwinnerselected: Action<unknown>;

  public readonly onmatchupdated: Action<Match>;
  public readonly onmatchstarted: Action<Match>;

  constructor() {
    this.storage = new InMemoryDatabase();
    this.manager = new BracketsManager(this.storage);
    this.tournaments = new Map();

    this.ontournamentcreated = new Action();
    this.onregistrationopen = new Action();
    this.onregistrationclosed = new Action();
    this.ontournamentstarted = new Action();

    // this.onforfeit = new Action();
    // this.onscoreupdated = new Action();
    // this.onwinnerselected = new Action();

    this.onmatchupdated = new Action();
    this.onmatchstarted = new Action();
  }

  public createNewTournament(options: TournamentOptions) {
    const tournament: Tournament = {
      id: uuid(),
      name: options.name,
      // Registration will open when the date passes, but doesn't require action by the admins.
      state: options.registrationOpenDate ? TournamentState.RegistrationOpen : TournamentState.New,
      startDate: options.startDate,
      endDate: options.endDate,
      registrationOpenDate: options.registrationOpenDate,
      stages: options.stages,
      stageSettings: options.stageSettings,
    }

    this.tournaments.set(tournament.id, tournament);
    this.ontournamentcreated.invoke(tournament);
    return tournament;
  }

  public openRegistration(id: string) {
    this.setTournamentState(id, TournamentState.RegistrationOpen,this.onregistrationopen);
  }

  public async closeRegistration(id: string) {
    this.setTournamentState(id, TournamentState.RegistrationClosed,this.onregistrationclosed);
  }

  public async startTournament(id: string) {
    const tournament = this.tournaments.get(id);
    if (tournament && tournament.state < TournamentState.Running) {
      for (let i = 0; i < tournament.stages.length; i++) {
        const stage = tournament.stages[i];
        const settings = tournament.stageSettings[i];
        await this.createStage(tournament, stage, settings);
      }
      this.ontournamentstarted.invoke(tournament);
      return true;
    }
    return false;
  }

  // All of the following public commands are called from the match view / settings screen. 
  // That screen will be brought up by the on click function so there should 
  // be access to all of these parameters.


  // A match can not be started until the match status is Ready
  public async startMatch(match: Match) {
    if(match.status === Status.Ready)
    {
      this.manager.update.match({
        id: match.id,
        status: Status.Running
      });
      this.onmatchstarted.invoke(match);
      return true;
    }
    return false;
  }

  public async forfeit(teamId: number, match: Match) {
    if (match.opponent1!.id === teamId) {
      await this.manager.update.match({
        id: match.id,
        opponent1: {
          forfeit: true
        }
      });
      this.onmatchupdated.invoke(match);
    } else if (match.opponent2!.id === teamId) {
      await this.manager.update.match({
        id: match.id,
        opponent2: {
          forfeit: true
        }
      });
      this.onmatchupdated.invoke(match);
    }
  }

  public async updateScore(teamId: number, match: Match, newScore: number) {
    if (match.opponent1!.id === teamId) {
      await this.manager.update.match({
        id: match.id,
        opponent1: {
          score: newScore
        }
      });
      this.onmatchupdated.invoke(match);
    } else if (match.opponent2!.id === teamId) {
      await this.manager.update.match({
        id: match.id,
        opponent2: {
          score: newScore
        }
      });
      this.onmatchupdated.invoke(match);
    }
  }

  public async selectWinner(teamId: number, match: Match) {
    if (match.opponent1!.id === teamId) {
      await this.manager.update.match({
        id: match.id,
        opponent1: {
          result: 'win'
        },
        opponent2: {
          result: 'loss'
        }
      });
      this.onmatchupdated.invoke(match);
    } else if (match.opponent2!.id === teamId) {
      await this.manager.update.match({
        id: match.id,
        opponent1: {
          result: 'loss'
        },
        opponent2: {
          result: 'win'
        }
      });
      this.onmatchupdated.invoke(match);
    }
  }

  // TODO implement futher draw logic.
  public async declareDraw(teamId: number, match: Match) {
    if (match.opponent1!.id === teamId) {
      await this.manager.update.match({
        id: match.id,
        opponent1: {
          result: 'draw'
        },
        opponent2: {
          result: 'draw'
        }
      });
    } else {
      await this.manager.update.match({
        id: match.id,
        opponent1: {
          result: 'draw'
        },
        opponent2: {
          result: 'draw'
        }
      });
    }
  }

  public getTournamentData(id: string): Promise<Database>
  {
    return this.manager.get.tournamentData(id);
  }

  private async createStage(tournament: Readonly<Tournament>, stageType: Readonly<StageType>, settings: StageSettings) {

    const teams = TeamManager.instance.getTeams(tournament.id);
    if (!teams) {
      return;
    }

    const seeding = teams.sort((a, b) => {
      return a.seedNumber! - b.seedNumber!;
    }).map(team => team.name);

    await this.manager.create.stage({
      name: tournament.name,
      tournamentId: tournament.id,
      type: stageType,
      seeding: seeding,
      settings: settings
    });
  }

  private setTournamentState(id: string, state: TournamentState, actionToFire?: Action<Readonly<Tournament>>) {
    const tournament = this.tournaments.get(id);
    if (tournament) {
      tournament.state = state;
      if(actionToFire)
      {
        actionToFire.invoke(tournament);
      }
    }
  }

}

const instance = new Lazy(() => new TournamentManager());
export { instance as TournamentManager };