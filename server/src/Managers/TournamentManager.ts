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
import { DatabaseError, DatabaseErrorType } from "../Database/DatabaseError";
import { MemoryDatabaseShim } from "../Database/MemoryDatabaseShim";
import { RegistrationData } from "@common/Models/RegistrationData";
import { TeamAPIConstants } from "@common/Constants/TeamAPIConstants";
import { EnvironmentVariables } from "../Utilities/EnvironmentVariables";
import { MailManager } from "./MailManager";
import TournamentRegistrationConfirmation from "../Templates/TournamentRegistrationConfirmation";

class TournamentManager {

  private readonly storage: CrudInterface;
  private readonly manager: BracketsManager;

  constructor() {
    this.storage = new MemoryDatabaseShim(new InMemoryDatabase(), async () => {
      await Database.instance.setBracketData(await this.manager.export());
    });
    this.manager = new BracketsManager(this.storage);
  }

  public async populateBracketData() {
    const data = await Database.instance.getBracketData();
    this.manager.import(data);
  }

  public async createNewTournament(options: TournamentOptions) {
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
      playersSeeded: options.playersSeeded,
      teamSize: options.teamSize
    }

    await Database.instance.addTournament(tournament);
    TournamentSocketAPI.ontournamentcreated.invoke(tournament);
    return tournament;
  }

  public async deleteTournament(id: string) {
    await this.manager.delete.tournament(id);
    await this.manager.storage.delete('participant', { tournament_id: id });
    await Database.instance.deleteTournament(id);
    await Database.instance.deleteMatchMetadata(id);
    await Database.instance.deleteRegistrations(id);
    TournamentSocketAPI.ontournamentdeleted.invoke(id);
  }

  public async openRegistration(id: string) {
    await this.setTournamentState(id, TournamentState.RegistrationOpen, TournamentSocketAPI.ontournamentstateupdated);
  }

  public async closeRegistration(id: string) {
    await this.setTournamentState(id, TournamentState.RegistrationConfirmation, TournamentSocketAPI.ontournamentstateupdated);
  }

  public async finalizeRegistrations(id: string) {
    const tournament = await this.getTournament(id);
    if (tournament && tournament.state === TournamentState.RegistrationConfirmation) {

      // Filter out unapproved registrations.
      const registrations = (await Database.instance.getRegistrations(id)).filter(r => r.approved);

      if (tournament.teamSize > 1) {
        registrations.sort((a, b) => {
          return a.teamCode!.localeCompare(b.teamCode!);
        });
      }


      const teams: RegistrationData[][] = [];
      for (let i = 0; i < registrations.length; i += tournament.teamSize) {
        const team = [];
        for (let j = i; j < i + tournament.teamSize; j++) {
          team.push(registrations[j]);
        }
        teams.push(team);
      }


      const confirmedTeams: Team[] = [];
      for (const teamRegistrations of teams) {
        const result = await TeamManager.instance.confirmTeamRegistration({
          name: teamRegistrations.map(r => r.name).join(' & '),
          players: teamRegistrations.map(r => ({
            contactEmail: r.contactEmail,
            name: r.name
          })),
          tournamentId: tournament.id
        });
        if(result[0] === TeamAPIConstants.TeamRegistrationResult.SUCCESS) {
          confirmedTeams.push(result[1]!);
        }
      }
      await this.setTournamentState(id, TournamentState.Seeding, TournamentSocketAPI.ontournamentstateupdated);
      const confirmUrl = `https://${EnvironmentVariables.HOST}/tournament/${tournament.id}`;
      const body = TournamentRegistrationConfirmation(tournament.name,confirmUrl);

      for(const team of confirmedTeams)
      {
        for(const player of team.players)
        {
          MailManager.sendEmail({
            sender: EnvironmentVariables.EMAIL_SENDER,
            to: player.contactEmail,
            subject: 'Tournament Registration Confirmed.',
            html: body
          }).then(success => {
            if (!success) {
              console.error('Failed to send an email to: ' + player.contactEmail);
            }
          });
        }
      }
    }
  }

  public async completeTournament(id: string) {
    await this.setTournamentState(id, TournamentState.Complete, TournamentSocketAPI.ontournamentstateupdated);
  }

  public async finalizeTournament(id: string) {
    const tournament = await this.getTournament(id);
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
    const tournament = await this.getTournament(id);
    // Only start allow starting the tournament once it's finalized.
    if (tournament && tournament.state === TournamentState.Finalizing) {
      // Save occurs here.
      this.setTournamentState(id, TournamentState.Active, TournamentSocketAPI.ontournamentstarted);
      return true;
    }
    return false;
  }

  public async setTournamentSeeded(id: string) {
    try {
      Database.instance.updateTournament(id, {
        playersSeeded: true
      });
    } catch {
      return false;
    }
    return true;
  }

  public async getTournaments() {
    return await Database.instance.getAllTournaments();
  }

  public async getTournament(id: string) {
    try {
      return await Database.instance.getTournament(id);
    } catch (err) {
      if (err instanceof DatabaseError && err.type === DatabaseErrorType.MissingRecord) {
        return undefined;
      }
      throw err;
    }
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
    return true;
  }

  public async updateMatch(tournamentId: string, matchId: number, update: Partial<Match>) {
    const success = await this.manager.storage.update('match', {
      id: matchId
    }, update);
    const updated = await this.getMatch(tournamentId, matchId);
    TournamentSocketAPI.onmatchupdated.invoke(updated!);
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
  }

  public async getTournamentData(id: string): Promise<[Tournament, BracketsDatabase] | undefined> {
    const tournament = await this.getTournament(id);
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
    let unorderedTeams = await TeamManager.instance.getTeams(tournament.id);
    if (!unorderedTeams) {
      return;
    }

    console.log("Unordered: ",unorderedTeams);

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

    console.log("seeding: ",seeding);

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
  }

  private async setTournamentState(id: string, state: TournamentState, actionToFire?: SocketAction<Tournament>) {
    try {
      const tournament = await Database.instance.updateTournament(id, {
        state: state
      });
      if (actionToFire) {
        actionToFire.invoke(tournament);
      }
      return true;
    } catch (err) {
      if (err instanceof DatabaseError && err.type === DatabaseErrorType.MissingRecord) {
        return false;
      }
      throw err;
    }

  }

}

const instance = new Lazy(() => new TournamentManager());
export { instance as TournamentManager };