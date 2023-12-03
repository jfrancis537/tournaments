import { CrudInterface, DataTypes, OmitId, Table } from 'brackets-manager'
import { Id } from 'brackets-model'

const storageMap = new Map();

class MapStorage implements CrudInterface {

  private storageObject: { [K in Table]: [OmitId<DataTypes[K]>][] }

  constructor() {
    this.storageObject = {
      stage: [],
      group: [],
      round: [],
      match: [],
      match_game: [],
      participant: [],
    }
  }

  insert<T extends Table>(table: T, value: OmitId<DataTypes[T]>): Promise<number>
  insert<T extends Table>(table: T, values: OmitId<DataTypes[T]>[]): Promise<boolean>
  async insert<T extends Table>(table: T, values: OmitId<DataTypes[T]> | OmitId<DataTypes[T]>[]): Promise<number | boolean> {
    if (values instanceof Array) {
      if (table === 'group') {

      }
      return 1;
    } else {
      return false;
    }
  }
  select<T extends keyof DataTypes>(table: T): Promise<DataTypes[T][] | null>
  select<T extends keyof DataTypes>(table: T, id: Id): Promise<DataTypes[T] | null>
  select<T extends keyof DataTypes>(table: T, filter: Partial<DataTypes[T]>): Promise<DataTypes[T][] | null>
  select(table: unknown, filter?: unknown): Promise<unknown> {
    throw new Error('Method not implemented.')
  }
  update<T extends keyof DataTypes>(table: T, id: Id, value: DataTypes[T]): Promise<boolean>
  update<T extends keyof DataTypes>(table: T, filter: Partial<DataTypes[T]>, value: Partial<DataTypes[T]>): Promise<boolean>
  update(table: unknown, filter: unknown, value: unknown): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
  delete<T extends keyof DataTypes>(table: T): Promise<boolean>
  delete<T extends keyof DataTypes>(table: T, filter: Partial<DataTypes[T]>): Promise<boolean>
  delete(table: unknown, filter?: unknown): Promise<boolean> {
    throw new Error('Method not implemented.')
  }

}

