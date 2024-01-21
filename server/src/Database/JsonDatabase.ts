import rfdc from "rfdc";
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises'
import { Database } from "./Database";
import { DatabaseError, DatabaseErrorType } from "./DatabaseError";
import { UserRecord } from "@common/Models/User";
import { MatchMetadata } from "@common/Models/MatchMetadata";
import { Team } from "@common/Models/Team";
import { SerializedTournament, Tournament } from "@common/Models/Tournament";
import { Database as BracketsDatabase } from "brackets-manager";

/**
 * 
 * NEXT THIS IS TO FIGURE OUT REGISTRATION EMAILS FOR TOURNAMENT REGISTRATION.
 * 
 */

const clone = rfdc();

interface JsonDatabaseSchema {
  version: string,
  users: { [id: string]: UserRecord };
  tournaments: { [id: string]: SerializedTournament };
  bracketData: BracketsDatabase;
  teamData: { [tid: string]: { [id: string]: Team } };
  matchMetadata: {
    [tid: string]: {
      [mid: number]: MatchMetadata
    }
  };
}

export class JsonDatabase implements Database {

  private readonly pathName;
  private storage?: JsonDatabaseSchema;

  constructor(pathName: string) {
    this.pathName = path.resolve(pathName);
  }

  public async setBracketData(data: BracketsDatabase): Promise<void> {
    this.data.bracketData = data;
  }
  public async getBracketData(): Promise<BracketsDatabase> {
    return this.data.bracketData;
  }


  private get data(): JsonDatabaseSchema {
    if (!this.storage) {
      try {
        if (fs.existsSync(this.pathName)) {
          let loaded: JsonDatabaseSchema | { version?: string };
          try {
            loaded = JSON.parse(fs.readFileSync(this.pathName, 'utf-8'));
            // TODO remove in the future once version is always there.
            if (loaded.version === undefined) {
              loaded = {};
            }
          } catch {
            loaded = {};
          }
          this.storage = {
            version: "1.1",
            matchMetadata: {},
            teamData: {
            },
            tournaments: {},
            bracketData: {
              group: [],
              match: [],
              match_game: [],
              round: [],
              stage: [],
              participant: []
            },
            users: {},
            // Add loaded properties at the end to ensure that loaded properties overwrite the schema.
            ...loaded,
          }
        } else {
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

  public async getTournament(tournamentId: string): Promise<Tournament> {
    const tournament = this.data.tournaments[tournamentId];
    if(!tournament)
    {
      throw new DatabaseError(`No tournament with id: ${tournamentId}`, DatabaseErrorType.MissingRecord);
    }
    return Tournament.Deserialize(tournament);
  }
  
  public async getAllTournaments(): Promise<Tournament[]> {
    return Object.values(this.data.tournaments).map(Tournament.Deserialize);
  }

  public async addTournament(tournament: Tournament): Promise<Tournament> {
    const existing = this.data.tournaments[tournament.id];
    if(existing)
    {
      throw new DatabaseError('A tournament with that id already exists',DatabaseErrorType.ExistingRecord);
    }
    this.data.tournaments[tournament.id] = Tournament.Serialize(tournament);
    await this.save();
    return this.getTournament(tournament.id);
  }

  public async updateTournament(tournamentId: string, tournament: Partial<Omit<Tournament, "id">>): Promise<Tournament> {
    const existing = this.data.tournaments[tournamentId];
    if(!existing)
    {
      throw new DatabaseError(`No tournament with id: ${tournamentId}`, DatabaseErrorType.MissingRecord);
    }
    
    Object.assign(existing,tournament);
    await this.save();
    return Tournament.Deserialize(existing);
  }

  public async deleteTournament(tournamentId: string): Promise<void> {
    delete this.data.tournaments[tournamentId];
    await this.save();
  }

  public async addMatchMetadata(metadata: MatchMetadata): Promise<void> {
    let inTournament = this.data.matchMetadata[metadata.tournamentId];
    if (!inTournament) {
      inTournament = {};
      this.data.matchMetadata[metadata.tournamentId] = inTournament;
    }

    inTournament[metadata.matchId] = clone(metadata);
    await this.save();
  }

  public async addTeam(team: Team): Promise<Team> {
    let tournamentTeams = this.data.teamData[team.tournamentId];
    if (!tournamentTeams) {
      tournamentTeams = {
        [team.id]: clone(team)
      }
      this.data.teamData[team.tournamentId] = tournamentTeams;
      await this.save();
      return clone(team);
    } else {
      const existing = tournamentTeams[team.id];
      if (!existing) {
        tournamentTeams[team.id] = clone(team);
        await this.save();
        return clone(team);
      } else {
        throw new DatabaseError('Team with this id already exists.', DatabaseErrorType.ExistingRecord);
      }
    }
  }

  public async getTeam(id: string): Promise<Team> {
    for (const tournamentId in this.data.teamData) {
      const tournamentTeams = this.data.teamData[tournamentId];
      const team = tournamentTeams[id];
      if (team) {
        return team;
      }
    }
    throw new DatabaseError('Team with this id does not exist.', DatabaseErrorType.MissingRecord);
  }

  public async getTeams(tournamentId: string): Promise<Team[]> {
    const tournamentTeams = this.data.teamData[tournamentId];
    if (tournamentTeams) {
      return Object.values(tournamentTeams);
    } else {
      return [];
    }
  }

  public async deleteTeams(tournamentId: string): Promise<void> {
    delete this.data.teamData[tournamentId];
    await this.save();
  }

  public async getMatchMetadata(tournamentId: string): Promise<MatchMetadata[]>
  public async getMatchMetadata(tournamentId: string, matchId: number): Promise<MatchMetadata>
  public async getMatchMetadata(tournamentId: string, matchId?: number): Promise<MatchMetadata | MatchMetadata[]> {
    const forTournament = this.data.matchMetadata[tournamentId];
    if (!forTournament) {
      throw new DatabaseError('No metadata exists for tournament with id: ' + tournamentId, DatabaseErrorType.MissingRecord);
    }
    if (matchId === undefined) {
      return Object.values(forTournament);
    }

    const metadata = forTournament[matchId];
    if (!metadata) {
      throw new DatabaseError(`match: ${matchId} does not have metadata for tournament: ${tournamentId}`
        , DatabaseErrorType.MissingRecord);
    }
    return metadata;
  }

  private async save() {
    await writeFile(this.pathName, JSON.stringify(this.data,undefined,' '), 'utf-8')
  }

}