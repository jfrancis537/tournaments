import { User, UserRecord } from "@common/Models/User";
import { EnvironmentVariables } from "../Utilities/EnvironmentVariables";
import { DataTypes, ValueToArray } from "brackets-manager";
import { Tournament } from "@common/Models/Tournament";
import { Team } from "@common/Models/Team";
import { JsonDatabase } from "./JsonDatabase";
import { MatchMetadata } from "@common/Models/MatchMetadata";
import { RegistrationData } from "@common/Models/RegistrationData";


export interface Database {
  hasUser(email: string): Promise<boolean>;
  getUser(email: string): Promise<UserRecord>;
  addUser(user: UserRecord): Promise<UserRecord>;
  updateUser(email: string, details: Partial<Omit<UserRecord, 'email'>>): Promise<UserRecord>;
  findUser(user: Partial<UserRecord>): Promise<UserRecord | undefined>;
  confirmUser(token: string): Promise<UserRecord>;

  getTournament(tournamentId: string): Promise<Tournament>;
  getAllTournaments(): Promise<Tournament[]>
  addTournament(tournament: Tournament): Promise<Tournament>;
  updateTournament(tournamentId: string,tournament: Partial<Omit<Tournament,'id'>>): Promise<Tournament>;
  deleteTournament(tournamentId: string): Promise<void>;

  addMatchMetadata(metadata: MatchMetadata): Promise<void>;
  deleteMatchMetadata(tournamentId: string): Promise<void>;
  getMatchMetadata(tournamentId: string): Promise<MatchMetadata[]>
  getMatchMetadata(tournamentId: string, matchId: number): Promise<MatchMetadata>

  setBracketData(data: ValueToArray<DataTypes>): Promise<void>;
  getBracketData(): Promise<ValueToArray<DataTypes>>;

  addTeam(team: Team): Promise<Team>;
  getTeam(id: string): Promise<Team>;
  getTeams(tournamentId: string): Promise<Team[]>
  deleteTeams(tournamentId: string): Promise<void>;

  addRegistration(reg: RegistrationData): Promise<RegistrationData>;
  getRegistration(tournamentId: string, email: string): Promise<RegistrationData>;
  getRegistrations(tournamentId: string): Promise<RegistrationData[]>;
  deleteRegistrations(tournamentId: string): Promise<void>;
  deleteRegistration(tournamentId: string, email: string): Promise<void>;
}

export namespace Database {

  export const instance: Database = EnvironmentVariables.IS_DEVELOPMENT ? new JsonDatabase(`${process.env.HOME}/Desktop/database.json`) : new JsonDatabase("./database.json");

}