import { User } from "@common/Models/User";
import { Lazy } from "@common/Utilities/Lazy";
import { EnvironmentVariables } from "../Utilities/EnvironmentVariables";
import { MemoryDatabase } from "./MemoryDatabase";

export interface UserRecord extends User{
  salt: string,
  hash: string,
  createdDate: string,
  state: 'pending' | ''
}

export interface Database {
  hasUser(username: string): Promise<boolean>;
  getUser(username: string): Promise<UserRecord>;
  addUser(user: UserRecord): Promise<UserRecord>;
  updateUser(username: string, details: Partial<Omit<UserRecord, 'username'>>): Promise<UserRecord>;
}

export namespace Database {
  // const lazy = new Lazy<Database>(() => {
  //   // TODO use other database type for not development.
  //   return EnvironmentVariables.IS_DEVELOPMENT ? new MemoryDatabase() : new MemoryDatabase();
  // });

  export const instance = EnvironmentVariables.IS_DEVELOPMENT ? new MemoryDatabase() : new MemoryDatabase();

}