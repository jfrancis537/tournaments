import { BracketsManager, CrudInterface, DataTypes, Database as BracketsDatabase } from "brackets-manager";
import { InMemoryDatabase } from "brackets-memory-db";
import { v4 as uuid } from "uuid";
import { Tournament, TournamentOptions, TournamentState } from "@common/Models/Tournament";
import { Match, Participant, StageSettings, StageType, Status } from "brackets-model";
import { TeamManager } from "./TeamManager";
import { Team } from "@common/Models/Team";
import { Lazy } from "@common/Utilities/Lazy";
import { nextPowerOf2 } from "@common/Utilities/Math";
import { TournamentSocketAPI } from "@common/SocketAPIs/TournamentAPI";
import { SocketAction } from "@common/Utilities/SocketAction";
import { Database } from "../Database/Database";

class TournamentManager {

  private readonly storage: CrudInterface;
  private readonly manager: BracketsManager;
  private tournaments: Map<string, Tournament>;

  constructor() {
    this.storage = new InMemoryDatabase();
    this.manager = new BracketsManager(this.storage);
    this.tournaments = new Map();

    //@ts-ignore
    globalThis['manager'] = this.manager;
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
      playersSeeded: options.playersSeeded
    }

    // TODO remove this line.
    // Demo.run(tournament);

    this.tournaments.set(tournament.id, tournament);
    TournamentSocketAPI.ontournamentcreated.invoke(tournament);
    this.save();
    return tournament;
  }

  public async deleteTournament(id: string) {
    await this.manager.delete.tournament(id);
    this.tournaments.delete(id);
    TournamentSocketAPI.ontournamentdeleted.invoke(id);
    await this.save();
  }

  public async openRegistration(id: string) {
    await this.setTournamentState(id, TournamentState.RegistrationOpen, TournamentSocketAPI.ontournamentstateupdated);
  }

  public async closeRegistration(id: string) {
    await this.setTournamentState(id, TournamentState.Seeding, TournamentSocketAPI.ontournamentstateupdated);
  }

  public async completeTournament(id: string) {
    await this.setTournamentState(id, TournamentState.Complete, TournamentSocketAPI.ontournamentstateupdated);
  }

  public async finalizeTournament(id: string) {
    const tournament = this.tournaments.get(id);
    // Only start allow finalization after the seeds have been assigned.
    if (tournament && tournament.state === TournamentState.Seeding) {
      for (let i = 0; i < tournament.stages.length; i++) {
        const stage = tournament.stages[i];
        const settings = tournament.stageSettings[i];
        await this.createStage(tournament, stage, settings);
      }
      // Save occurs here.
      this.setTournamentState(id, TournamentState.Finalizing, TournamentSocketAPI.ontournamentstateupdated);
      return true;
    }
    return false;
  }

  public async startTournament(id: string) {
    const tournament = this.tournaments.get(id);
    // Only start allow starting the tournament once it's finalized.
    if (tournament && tournament.state === TournamentState.Finalizing) {
      for (let i = 0; i < tournament.stages.length; i++) {
        const stage = tournament.stages[i];
        const settings = tournament.stageSettings[i];
        await this.createStage(tournament, stage, settings);
      }
      // Save occurs here.
      this.setTournamentState(id, TournamentState.Active, TournamentSocketAPI.ontournamentstarted);
      return true;
    }
    return false;
  }

  public async setTournamentSeeded(id: string) {
    const tournament = this.tournaments.get(id);
    if (!tournament) {
      return false;
    }
    tournament.playersSeeded = true;
    await this.save();
    return true;
  }

  public getTournaments() {
    return [...this.tournaments.values()]
  }

  public getTournament(id: string) {
    return this.tournaments.get(id);
  }

  // All of the following public commands are called from the match view / settings screen. 
  // That screen will be brought up by the on click function so there should 
  // be access to all of these parameters.

  public async selectWinner(tournamentId: string, teamId: number, matchId: number) {

    const match = await this.getMatch(tournamentId, matchId);

    if (!match) {
      return false;
    }

    if (match.opponent1!.id === teamId) {
      await this.manager.update.match({
        id: match.id,
        opponent1: {
          result: 'win',
          score: match.opponent1!.score
        },
        opponent2: {
          result: 'loss',
          score: match.opponent2!.score
        }
      });
      TournamentSocketAPI.onmatchupdated.invoke(match);
      this.save();
      return true;
    } else if (match.opponent2!.id === teamId) {
      await this.manager.update.match({
        id: match.id,
        opponent1: {
          result: 'loss',
          score: match.opponent1!.score
        },
        opponent2: {
          result: 'win',
          score: match.opponent2!.score
        }
      });
      TournamentSocketAPI.onmatchupdated.invoke(match);
      this.save();
      return true;
    }
    return false;
  }

  public async forfeit(tournamentId: string, teamId: number, matchId: number) {

    const match = await this.getMatch(tournamentId, matchId);

    if (!match) {
      return false;
    }


    if (match.opponent1!.id === teamId) {
      await this.manager.update.match({
        id: match.id,
        opponent1: {
          forfeit: true
        },
        opponent2: {
          result: 'win'
        }
      });
      TournamentSocketAPI.onmatchupdated.invoke(match);
      this.save();
      return true;
    } else if (match.opponent2!.id === teamId) {
      await this.manager.update.match({
        id: match.id,
        opponent1: {
          result: 'win'
        },
        opponent2: {
          forfeit: true
        }
      });
      this.save();
      TournamentSocketAPI.onmatchupdated.invoke(match);
      return true;
    }
    return false;
  }

  public async matchStatusIs(tournamentId: string, matchId: number, status: Status, mode: 'gt' | 'lt' | 'eq' = 'eq') {
    const match = await this.getMatch(tournamentId, matchId);
    if (!match) {
      return false;
    }
    switch (mode) {
      case 'eq':
        return match.status === status;
      case 'gt':
        return match.status >= status;
      case 'lt':
        return match.status >= status;
    }
  }

  public async getMatchStatus(tournamentId: string, matchId: number) {
    const match = await this.getMatch(tournamentId, matchId);
    return match?.status;
  }

  public async startMatch(tournamentId: string, match: Match) {

    await this.manager.storage.update('match', {
      id: match.id
    }, {
      opponent1: {
        id: match.opponent1!.id,
        score: 0
      },
      opponent2: {
        id: match.opponent2!.id,
        score: 0
      },
      status: Status.Running
    });

    const updated = await this.getMatch(tournamentId, match.id as number);
    TournamentSocketAPI.onmatchstarted.invoke(updated!);
    this.save();
  }

  /**
   * This function does not check that the team id provided is matched to an opponent in this match.
   */
  public async updateScore(tournamentId: string, teamId: number, matchId: number, delta: number) {

    const match = await this.getMatch(tournamentId, matchId);
    if (!match) {
      throw new Error('Score was updated on a match that does not exist.');
    }

    if (match.status !== Status.Running) {
      throw new Error('Score was updated on a match that was not running.');
    }

    if (match.opponent1!.id === teamId) {
      const currentScore = match.opponent1!.score ?? 0;
      await this.manager.storage.update('match', {
        id: match.id
      }, {
        opponent1: {
          id: match.opponent1!.id,
          score: currentScore + delta
        },
      });
      TournamentSocketAPI.onmatchupdated.invoke(match);
      this.save();
    } else {
      const currentScore = match.opponent2!.score ?? 0;
      await this.manager.storage.update('match', {
        id: match.id
      }, {
        opponent2: {
          id: match.opponent2!.id,
          score: currentScore + delta
        },
      });
    }
    TournamentSocketAPI.onmatchupdated.invoke(match);
    this.save();
    return true;
  }

  public async updateMatch(tournamentId: string, matchId: number, update: Partial<Match>) {
    const success = await this.manager.storage.update('match', {
      id: matchId
    }, update);
    const updated = await this.getMatch(tournamentId, matchId);
    TournamentSocketAPI.onmatchupdated.invoke(updated!);
    this.save();
    return success;
  }

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
    TournamentSocketAPI.onmatchupdated.invoke(match);
    this.save();
  }

  public async getTournamentData(id: string): Promise<[Tournament, BracketsDatabase] | undefined> {
    const tournament = this.tournaments.get(id);
    if (tournament) {
      return [tournament, await this.manager.get.tournamentData(id)];
    } else {
      return undefined;
    }
  }

  public async getMatch(tournamentId: string, matchId: number): Promise<Match | undefined> {
    const stage = await this.manager.get.currentStage(tournamentId);
    if (!stage) {
      return undefined;
    }

    const filter: Partial<DataTypes['match']> = {
      stage_id: stage.id,
      id: matchId
    }
    const selection = await this.manager.storage.select('match', filter);
    if (!selection) {
      return undefined;
    }
    return selection[0];
  }

  private async createStage(tournament: Readonly<Tournament>, stageType: Readonly<StageType>, settings: StageSettings) {

    // Get the teams for the tournament
    let unorderedTeams = TeamManager.instance.getTeams(tournament.id);
    if (!unorderedTeams) {
      return;
    }

    let teams = [...unorderedTeams].filter(team => team.seedNumber !== undefined);
    teams.sort((a, b) => {
      return a.seedNumber! - b.seedNumber!;
    });

    const seeding: (Team | undefined)[] = [];
    let index = 0;
    for (let seedNumber = 0; seedNumber < nextPowerOf2(teams.length); seedNumber++) {
      const team = teams[index];
      if (team && team.seedNumber === seedNumber) {
        seeding.push(team);
        index++;
      } else {
        seeding.push(undefined);
      }
    }

    const stage = await this.manager.create.stage({
      name: tournament.name,
      tournamentId: tournament.id,
      type: stageType,
      seeding: seeding.map(team => team?.name ?? null),
      settings: settings
    });
    const filter: Partial<Participant> = {
      tournament_id: stage.tournament_id
    }
    // Not null asserted because we just created the stage.
    const participants = (await this.manager.storage.select('participant', filter))!;
    await TeamManager.instance.assignSeedNumbers(
      participants.map((participant, i) => {
        const team = teams[i];
        return [team.id, participant.id as number];
      }));
    await this.save();
  }

  private async setTournamentState(id: string, state: TournamentState, actionToFire?: SocketAction<Tournament>) {
    const tournament = this.tournaments.get(id);
    if (tournament) {
      tournament.state = state;
      if (actionToFire) {
        actionToFire.invoke(tournament);
      }
    }
    await this.save();
  }

  private async save() {
    const data = await this.manager.export();
    const tournaments = [...this.tournaments];
    await Database.instance.setTournamentData({
      tournaments,
      bracketsData: data
    });
  }

  public async load() {
    const data = await Database.instance.getTournamentData();
    await this.manager.import(data.bracketsData);
    this.tournaments = new Map(data.tournaments);
  }

}

const instance = new Lazy(() => new TournamentManager());
export { instance as TournamentManager };