export enum DatabaseErrorType {
  MissingRecord,
  ExistingRecord,
}

export class DatabaseError extends Error{
  public readonly type: DatabaseErrorType;
  constructor(msg: string, type : DatabaseErrorType) {
    super(msg);
    this.type = type;
  }
}