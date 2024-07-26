import { CrudInterface, DataTypes, OmitId, Table } from "brackets-manager";
import { InMemoryDatabase } from "brackets-memory-db";
import { Id } from "brackets-model";
import { Database } from "./Database";

export class MemoryDatabaseShim implements CrudInterface {

  private memorydb: InMemoryDatabase;
  private saveFunction: () => Promise<void>;
  private pendingSave?: Promise<void>;

  constructor(db: InMemoryDatabase, saveFunction: () => Promise<void>) {
    this.memorydb = db;
    this.saveFunction = saveFunction;
  }

  insert<T extends Table>(table: T, value: OmitId<DataTypes[T]>): Promise<number>;
  insert<T extends Table>(table: T, values: OmitId<DataTypes[T]>[]): Promise<boolean>;
  async insert<T extends Table>(table: T, values: OmitId<DataTypes[T]>[]): Promise<number | boolean> {
    const result = await this.memorydb.insert(table, values);
    await this.save();
    return result;
  }

  select<T extends Table>(table: T): Promise<DataTypes[T][] | null>;
  select<T extends Table>(table: T, id: Id): Promise<DataTypes[T] | null>;
  select<T extends Table>(table: T, filter: Partial<DataTypes[T]>): Promise<DataTypes[T][] | null>;
  async select<T extends Table>(table: T, filterOrId?: Id | Partial<DataTypes[T]>): Promise<DataTypes[T] | DataTypes[T][] | null> {
    // @ts-ignore Poor interface construction on part of library.
    const result = await this.memorydb.select(table, filterOrId);
    await this.save();
    // @ts-ignore Poor interface construction on part of library.
    return result;
  }
  update<T extends Table>(table: T, id: Id, value: DataTypes[T]): Promise<boolean>;
  update<T extends Table>(table: T, filter: Partial<DataTypes[T]>, value: Partial<DataTypes[T]>): Promise<boolean>;
  async update<T extends Table>(table: T, filterOrId: Id | Partial<DataTypes[T]>, value: DataTypes[T] | Partial<DataTypes[T]>): Promise<boolean> {
    // @ts-ignore id causes issues.
    const result = await this.memorydb.update(table, filterOrId, value);
    await this.save();
    return result;
  }
  delete<T extends Table>(table: T): Promise<boolean>;
  delete<T extends Table>(table: T, filter: Partial<DataTypes[T]>): Promise<boolean>;
  async delete<T extends Table>(table: T, filter?: Partial<DataTypes[T]>): Promise<boolean> {
    let result: boolean;
    if (filter) {
      result = await this.memorydb.delete(table, filter);
    } else {
      result = await this.memorydb.delete(table);
    }
    await this.save(true);
    return result;
  }

  
  private async save(force = false) {
    if(!this.pendingSave) {
      this.pendingSave = new Promise((resolve) => {
        setTimeout(() => {
          this.saveFunction().then(() => {
            this.pendingSave = undefined;
            resolve();
          });
        },force ? 0 : 5000);
      });
    }
  }

}