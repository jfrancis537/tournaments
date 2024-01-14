import rfdc from "rfdc";
import { Database, TeamData, TournamentData } from "./Database";
import { DatabaseError, DatabaseErrorType } from "./DatabaseError";
import { UserRecord } from "@common/Models/User";

const clone = rfdc();

export class MemoryDatabase implements Database {


  private readonly userStorage = new Map<string, UserRecord>;
  private tournamentData: TournamentData = {
    bracketsData: {
      group: [],
      match: [],
      match_game: [],
      round: [],
      stage: [],
      participant: []
    },
    tournaments: []
  };

  private teamData: TeamData = {
    teams: [],
    tournamentToTeams: []
  }

  public async hasUser(username: string): Promise<boolean> {
    return this.userStorage.has(username);
  }

  public async getUser(username: string): Promise<UserRecord> {
    if (!this.userStorage.has(username)) {
      throw new DatabaseError(`Failed to get user with username: ${username}`, DatabaseErrorType.MissingRecord);
    }
    return clone(this.userStorage.get(username)!);
  }

  confirmUser(token: string): Promise<UserRecord> {
    throw new Error("Method not implemented.");
  }

  public async addUser(user: UserRecord): Promise<UserRecord> {
    if (this.userStorage.has(user.username)) {
      throw new DatabaseError(`User with username: ${user.username} already exists`, DatabaseErrorType.MissingRecord);
    }
    this.userStorage.set(user.username, clone(user));
    return clone(this.userStorage.get(user.username)!);
  }
  public async updateUser(username: string, update: Partial<Omit<UserRecord, "username">>): Promise<UserRecord> {
    const user = clone(await this.getUser(username));
    Object.assign(user, update);
    this.userStorage.set(user.username, user);
    return clone(this.userStorage.get(user.username)!);
  }

  public async setTournamentData(data: TournamentData): Promise<void> {
    this.tournamentData = data;
  }
  public async getTournamentData(): Promise<TournamentData> {
    return this.tournamentData;
  }

  public async setTeamData(data: TeamData): Promise<void> {
    this.teamData = data;
  }
  public async getTeamData(): Promise<TeamData> {
    return this.teamData;
  }

}