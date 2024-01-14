import { UserRecord } from "@common/Models/User";
import { EnvironmentVariables } from "../Utilities/EnvironmentVariables";
import { DataTypes, ValueToArray } from "brackets-manager";
import { Tournament } from "@common/Models/Tournament";
import { Team } from "@common/Models/Team";
import { JsonDatabase } from "./JsonDatabase";

type ArrayMap<K,V> = [K,V][];

export interface TournamentData {
  bracketsData: ValueToArray<DataTypes>;
  tournaments: [string,Tournament][];
}

export interface TeamData {
  teams: ArrayMap<string,Team>;
  tournamentToTeams: ArrayMap<string,string[]>;
}

export interface Database {
  hasUser(username: string): Promise<boolean>;
  getUser(username: string): Promise<UserRecord>;
  addUser(user: UserRecord): Promise<UserRecord>;
  updateUser(username: string, details: Partial<Omit<UserRecord, 'username'>>): Promise<UserRecord>;
  confirmUser(token: string): Promise<UserRecord>;
  
  setTournamentData(data: TournamentData): Promise<void>;
  getTournamentData(): Promise<TournamentData>

  setTeamData(data: TeamData): Promise<void>;
  getTeamData(): Promise<TeamData>;
}

export namespace Database {

  export const instance = EnvironmentVariables.IS_DEVELOPMENT ? new JsonDatabase(`${process.env.HOME}/Desktop/database.json`) : new JsonDatabase("./database.json");

}