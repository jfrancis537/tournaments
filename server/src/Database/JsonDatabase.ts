import rfdc from "rfdc";
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises'
import { Database, TeamData, TournamentData } from "./Database";
import { DatabaseError, DatabaseErrorType } from "./DatabaseError";
import { UserRecord } from "@common/Models/User";

const clone = rfdc();

interface JsonDatabaseSchema {
  users: { [id: string]: UserRecord },
  tournamentData: TournamentData,
  teamData: TeamData
}

export class JsonDatabase implements Database {

  private readonly pathName;
  private storage?: JsonDatabaseSchema;

  constructor(pathName: string) {
    this.pathName = path.resolve(pathName);
  }

  private get data(): JsonDatabaseSchema {
    if (!this.storage) {
      try {
        if (fs.existsSync(this.pathName)) {
          this.storage = JSON.parse(fs.readFileSync(this.pathName, 'utf-8'));
        } else {
          this.storage = {
            teamData: {
              teams: [],
              tournamentToTeams: []
            },
            tournamentData: {
              bracketsData: {
                group: [],
                match: [],
                match_game: [],
                round: [],
                stage: [],
                participant: []
              },
              tournaments: []
            },
            users: {}
          }
          fs.writeFileSync(this.pathName, JSON.stringify(this.storage), 'utf-8');
        }

      } catch (err) {
        console.error(err);
      }
    }
    return this.storage!;
  }

  public async hasUser(username: string): Promise<boolean> {
    return !!this.data.users[username]
  }

  public async getUser(username: string): Promise<UserRecord> {
    if (!this.hasUser(username)) {
      throw new DatabaseError(`Failed to get user with username: ${username}`, DatabaseErrorType.MissingRecord);
    }
    return clone(this.data.users[username]);
  }

  public async findUser(filter: Partial<UserRecord>): Promise<UserRecord | undefined> {
    for (const username in this.data.users) {
      const user = this.data.users[username];
      let found = true;
      for (const str in filter) {
        const key = str as keyof typeof filter;
        if (filter[key] !== user[key]) {
          found = false;
          break;
        }
      }
      if (found) {
        return clone(user);
      }
    }
    return undefined;
  }

  public async confirmUser(token: string): Promise<UserRecord> {
    for (const username in this.data.users) {
      const user = this.data.users[username];
      if (user.registrationToken === token) {
        user.registrationToken = undefined;
        await this.save();
        return clone(user);
      }
    }
    throw new DatabaseError('No user with specified registration token exists.', DatabaseErrorType.MissingRecord);
  }

  public async addUser(user: UserRecord): Promise<UserRecord> {
    if (!this.hasUser(user.username)) {
      throw new DatabaseError(`User with username: ${user.username} already exists`, DatabaseErrorType.MissingRecord);
    }
    this.data.users[user.username] = clone(user);
    await this.save();
    return await this.getUser(user.username);
  }
  public async updateUser(username: string, update: Partial<Omit<UserRecord, "username">>): Promise<UserRecord> {
    const user = await this.getUser(username);
    Object.assign(user, update);
    this.data.users[user.username] = user;
    await this.save();
    return this.getUser(user.username);
  }

  public async setTournamentData(data: TournamentData): Promise<void> {
    this.data.tournamentData = data;
    await this.save();
  }
  public async getTournamentData(): Promise<TournamentData> {
    return this.data.tournamentData;
  }

  public async setTeamData(data: TeamData): Promise<void> {
    this.data.teamData = data;
    await this.save();
  }
  public async getTeamData(): Promise<TeamData> {
    return this.data.teamData;
  }

  private async save() {
    await writeFile(this.pathName, JSON.stringify(this.data), 'utf-8')
  }

}