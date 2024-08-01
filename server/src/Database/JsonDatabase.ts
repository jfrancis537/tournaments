import rfdc from "rfdc";
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises'
import { Database } from "./Database";
import { DatabaseError, DatabaseErrorType } from "./DatabaseError";
import { UserRecord } from "@common/Models/User";
import { MatchMetadata } from "@common/Models/MatchMetadata";
import { Team } from "@common/Models/Team";
import { SerializedTournament, Tournament, TournamentMetadata } from "@common/Models/Tournament";
import { Database as BracketsDatabase } from "brackets-manager";
import { RegistrationData } from "@common/Models/RegistrationData";


const clone = rfdc();

interface JsonDatabaseSchema {
  version: string,
  users: { [id: string]: UserRecord };
  tournaments: { [id: string]: SerializedTournament };
  tournamentMetadata: {[id: string]: TournamentMetadata}
  bracketData: BracketsDatabase;
  registrations: { [tid: string]: { [email: string]: RegistrationData } }
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
            tournamentMetadata: {},
            registrations: {},
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
          fs.writeFileSync(this.pathName, JSON.stringify(this.storage), 'utf-8');
        } else {
          this.storage = {
            version: "1.1",
            matchMetadata: {},
            teamData: {
            },
            tournaments: {},
            tournamentMetadata: {},
            registrations: {},
            bracketData: {
              group: [],
              match: [],
              match_game: [],
              round: [],
              stage: [],
              participant: []
            },
            users: {},
          }
          fs.writeFileSync(this.pathName, JSON.stringify(this.storage), 'utf-8');
        }

      } catch (err) {
        console.error(err);
      }
    }
    return this.storage!;
  }

  public async hasUser(email: string): Promise<boolean> {
    return !!this.data.users[email]
  }

  public async getUser(email: string): Promise<UserRecord> {
    if (!this.hasUser(email)) {
      throw new DatabaseError(`Failed to get user with email: ${email}`, DatabaseErrorType.MissingRecord);
    }
    return clone(this.data.users[email]);
  }

  public async findUser(filter: Partial<UserRecord>): Promise<UserRecord | undefined> {
    for (const email in this.data.users) {
      const user = this.data.users[email];
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
    for (const email in this.data.users) {
      const user = this.data.users[email];
      if (user.registrationToken === token) {
        user.registrationToken = undefined;
        await this.save();
        return clone(user);
      }
    }
    throw new DatabaseError('No user with specified registration token exists.', DatabaseErrorType.MissingRecord);
  }

  public async addUser(user: UserRecord): Promise<UserRecord> {
    if (!this.hasUser(user.email)) {
      throw new DatabaseError(`User with email: ${user.email} already exists`, DatabaseErrorType.MissingRecord);
    }
    this.data.users[user.email] = clone(user);
    await this.save();
    return await this.getUser(user.email);
  }

  public async updateUser(email: string, update: Partial<Omit<UserRecord, "email">>): Promise<UserRecord> {
    const user = await this.getUser(email);
    Object.assign(user, update);
    this.data.users[user.email] = user;
    await this.save();
    return this.getUser(user.email);
  }

  public async getTournament(tournamentId: string): Promise<Tournament> {
    const tournament = this.data.tournaments[tournamentId];
    if (!tournament) {
      throw new DatabaseError(`No tournament with id: ${tournamentId}`, DatabaseErrorType.MissingRecord);
    }
    return Tournament.Deserialize(tournament);
  }

  public async getAllTournaments(): Promise<Tournament[]> {
    return Object.values(this.data.tournaments).map(Tournament.Deserialize);
  }

  public async addTournament(tournament: Tournament): Promise<Tournament> {
    const existing = this.data.tournaments[tournament.id];
    if (existing) {
      throw new DatabaseError('A tournament with that id already exists', DatabaseErrorType.ExistingRecord);
    }
    this.data.tournaments[tournament.id] = Tournament.Serialize(tournament);
    await this.save();
    return this.getTournament(tournament.id);
  }

  public async setTournamentMetadata(metadata: TournamentMetadata): Promise<TournamentMetadata> {
    this.data.tournamentMetadata[metadata.id] = clone(metadata);
    await this.save();
    return clone(this.data.tournamentMetadata[metadata.id]);
  }

  public async getTournamentMetadata(id: string): Promise<TournamentMetadata | undefined> {
    return this.data.tournamentMetadata[id];
  }
  public async deleteTournamentMetadata(id: string): Promise<void> {
    delete this.data.tournamentMetadata[id];
  }

  public async updateTournament(tournamentId: string, tournament: Partial<Omit<Tournament, "id">>): Promise<Tournament> {
    const existing = this.data.tournaments[tournamentId];
    if (!existing) {
      throw new DatabaseError(`No tournament with id: ${tournamentId}`, DatabaseErrorType.MissingRecord);
    }

    Object.assign(existing, tournament);
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

  public async deleteMatchMetadata(tournamentId: string): Promise<void> {
    delete this.data.matchMetadata[tournamentId];
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

  public async setTeamSeedNumber(id: string, seed: number | undefined): Promise<Team> {
    for (const tournamentId in this.data.teamData) {
      const tournamentTeams = this.data.teamData[tournamentId];
      const team = tournamentTeams[id];
      if (team) {
        team.seedNumber = seed;
        return clone(team);
      }
    }
    throw new DatabaseError('Team with this id does not exist.', DatabaseErrorType.MissingRecord);
  }

  public async getTeam(id: string): Promise<Team> {
    for (const tournamentId in this.data.teamData) {
      const tournamentTeams = this.data.teamData[tournamentId];
      const team = tournamentTeams[id];
      if (team) {
        return clone(team);
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

  public async addRegistration(reg: RegistrationData): Promise<RegistrationData> {
    let tournamentRegistrations = this.data.registrations[reg.tournamentId];
    if (!tournamentRegistrations) {
      tournamentRegistrations = {
        [reg.contactEmail]: clone(reg)
      }
      this.data.registrations[reg.tournamentId] = tournamentRegistrations;
      await this.save();
      return clone(reg);
    } else {
      const existing = tournamentRegistrations[reg.contactEmail];
      if (!existing) {
        tournamentRegistrations[reg.contactEmail] = clone(reg);
        await this.save();
        return clone(reg);
      } else {
        throw new DatabaseError('Registration with this email already exists.', DatabaseErrorType.ExistingRecord);
      }
    }
  }
  public async getRegistration(tournamentId: string, email: string): Promise<RegistrationData> {
    const tournamentRegistrations = this.data.registrations[tournamentId];
    const registration = tournamentRegistrations[email];
    if (registration) {
      return registration;
    }
    throw new DatabaseError('Team with this id does not exist.', DatabaseErrorType.MissingRecord);
  }

  public async updateRegistration(
    tournamentId: string,
    email: string,
    update: Partial<Omit<RegistrationData, "contactEmail">>): Promise<RegistrationData> {
      const tournamentRegistrations = this.data.registrations[tournamentId];
      const registration = tournamentRegistrations[email];
      Object.assign(registration,update);
      await this.save()
      return clone(registration);
  }

  public async getRegistrations(tournamentId: string): Promise<RegistrationData[]> {
    const tournamentTeams = this.data.registrations[tournamentId];
    if (tournamentTeams) {
      return Object.values(tournamentTeams);
    } else {
      return [];
    }
  }

  public async deleteRegistration(tournamentId: string, email: string): Promise<void> {
    const tournamentRegistrations = this.data.registrations[tournamentId];
    if (tournamentRegistrations) {

      delete tournamentRegistrations[email];
    }

    await this.save();
  }

  public async deleteRegistrations(tournamentId: string): Promise<void> {
    delete this.data.registrations[tournamentId];
    await this.save();
  }

  private async save() {
    console.log('saving');
    await writeFile(this.pathName, JSON.stringify(this.data, undefined, ' '), 'utf-8')
  }

}