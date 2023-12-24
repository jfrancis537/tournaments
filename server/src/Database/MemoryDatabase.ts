import rfdc from "rfdc";
import { Database, UserRecord } from "./Database";
import { DatabaseError, DatabaseErrorType } from "./DatabaseError";

const clone = rfdc();

export class MemoryDatabase implements Database {

  private readonly userStorage = new Map<string, UserRecord>;

  public async hasUser(username: string): Promise<boolean> {
    return this.userStorage.has(username);
  }

  public async getUser(username: string): Promise<UserRecord> {
    if (!this.userStorage.has(username)) {
      throw new DatabaseError(`Failed to get user with username: ${username}`,DatabaseErrorType.MissingRecord);
    }
    return clone(this.userStorage.get(username)!);
  }
  public async addUser(user: UserRecord): Promise<UserRecord> {
    if (this.userStorage.has(user.username)) {
      throw new DatabaseError(`User with username: ${user.username} already exists`,DatabaseErrorType.MissingRecord);
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

}