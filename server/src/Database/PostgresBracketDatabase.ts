import { CrudInterface, DataTypes, OmitId, Table } from "brackets-manager";
import { Id } from "brackets-model";
import * as pg from "pg";
import { DatabaseError, DatabaseErrorType } from "./DatabaseError";
import { BracketTables } from "./BracketDatabaseDescriptors";

/**
 * Native Postgres implementation of brackets-manager's `CrudInterface`.
 *
 * Each brackets-manager entity (stage/group/round/match/match_game/participant)
 * is stored in its own relational `brackets_*` table rather than as a single
 * JSON blob. This replaces the in-memory `MemoryDatabaseShim` + periodic-save
 * flush for the Postgres path, giving durable, per-row queryable bracket data.
 *
 * The overloaded operations are narrowed here on the argument shape, so unlike
 * the shim this needs no `@ts-ignore`s.
 */
export class PostgresBracketDatabase implements CrudInterface {

  private readonly pool: pg.Pool;

  constructor(pool: pg.Pool) {
    this.pool = pool;
  }

  insert<T extends Table>(table: T, value: OmitId<DataTypes[T]>): Promise<number>;
  insert<T extends Table>(table: T, values: OmitId<DataTypes[T]>[]): Promise<boolean>;
  async insert<T extends Table>(table: T, values: OmitId<DataTypes[T]> | OmitId<DataTypes[T]>[]): Promise<number | boolean> {
    const isBulk = Array.isArray(values);
    const rows = (isBulk ? values : [values]) as Record<string, unknown>[];
    if (rows.length === 0) {
      return true;
    }

    const jsonb = new Set(BracketTables.JsonbColumns[table]);
    // Every column except the generated `id`.
    const cols = BracketTables.Columns[table].filter((c) => c !== "id");

    const params: unknown[] = [];
    const tuples: string[] = [];
    for (const row of rows) {
      const placeholders: string[] = [];
      for (const col of cols) {
        placeholders.push(this.pushValue(params, col, row[col], jsonb));
      }
      tuples.push(`(${placeholders.join(", ")})`);
    }

    const result = await this.query<{ id: number }>(
      `INSERT INTO ${BracketTables.PhysicalNames[table]} (${cols.join(", ")})
       VALUES ${tuples.join(", ")}
       RETURNING id;`,
      params
    );

    if (isBulk) {
      return true;
    }
    return result.rows[0].id;
  }

  select<T extends Table>(table: T): Promise<DataTypes[T][] | null>;
  select<T extends Table>(table: T, id: Id): Promise<DataTypes[T] | null>;
  select<T extends Table>(table: T, filter: Partial<DataTypes[T]>): Promise<DataTypes[T][] | null>;
  async select<T extends Table>(table: T, filterOrId?: Id | Partial<DataTypes[T]>): Promise<DataTypes[T] | DataTypes[T][] | null> {
    const cols = BracketTables.Columns[table];
    const base = `SELECT ${cols.join(", ")} FROM ${BracketTables.PhysicalNames[table]}`;

    // Select all.
    if (filterOrId === undefined) {
      const result = await this.query(base);
      return result.rows as DataTypes[T][];
    }

    // Select by id.
    if (typeof filterOrId === "number" || typeof filterOrId === "string") {
      const result = await this.query(`${base} WHERE id = $1;`, [filterOrId]);
      return (result.rows[0] as DataTypes[T]) ?? null;
    }

    // Select by filter.
    const params: unknown[] = [];
    const where = this.buildFilter(filterOrId as Record<string, unknown>, params);
    const result = await this.query(`${base}${where};`, params);
    return result.rows as DataTypes[T][];
  }

  update<T extends Table>(table: T, id: Id, value: DataTypes[T]): Promise<boolean>;
  update<T extends Table>(table: T, filter: Partial<DataTypes[T]>, value: Partial<DataTypes[T]>): Promise<boolean>;
  async update<T extends Table>(table: T, filterOrId: Id | Partial<DataTypes[T]>, value: DataTypes[T] | Partial<DataTypes[T]>): Promise<boolean> {
    const jsonb = new Set(BracketTables.JsonbColumns[table]);

    const params: unknown[] = [];
    const assignments: string[] = [];
    for (const [col, val] of Object.entries(value as Record<string, unknown>)) {
      if (col === "id") {
        continue; // never reassign the identity
      }
      assignments.push(`${col} = ${this.pushValue(params, col, val, jsonb)}`);
    }

    if (assignments.length === 0) {
      return false;
    }

    let where: string;
    if (typeof filterOrId === "number" || typeof filterOrId === "string") {
      params.push(filterOrId);
      where = ` WHERE id = $${params.length}`;
    } else {
      where = this.buildFilter(filterOrId as Record<string, unknown>, params);
    }

    const result = await this.query(
      `UPDATE ${BracketTables.PhysicalNames[table]} SET ${assignments.join(", ")}${where};`,
      params
    );
    return (result.rowCount ?? 0) > 0;
  }

  delete<T extends Table>(table: T): Promise<boolean>;
  delete<T extends Table>(table: T, filter: Partial<DataTypes[T]>): Promise<boolean>;
  async delete<T extends Table>(table: T, filter?: Partial<DataTypes[T]>): Promise<boolean> {
    if (!filter) {
      // Empty the table completely (mirrors the in-memory store's semantics).
      await this.query(`DELETE FROM ${BracketTables.PhysicalNames[table]};`);
      return true;
    }

    const params: unknown[] = [];
    const where = this.buildFilter(filter as Record<string, unknown>, params);
    await this.query(`DELETE FROM ${BracketTables.PhysicalNames[table]}${where};`, params);
    return true;
  }

  /**
   * Appends a value as a bound parameter and returns its placeholder. JSONB
   * columns are stringified (or bound as SQL NULL when null/undefined).
   */
  private pushValue(params: unknown[], column: string, value: unknown, jsonb: Set<string>): string {
    if (jsonb.has(column)) {
      params.push(value === undefined || value === null ? null : JSON.stringify(value));
      return `$${params.length}::jsonb`;
    }
    params.push(value === undefined ? null : value);
    return `$${params.length}`;
  }

  /**
   * Builds a `WHERE` clause from a scalar filter object, appending bound
   * parameters. All brackets-manager filters are scalar id/number columns;
   * a non-scalar filter is rejected rather than silently mishandled.
   */
  private buildFilter(filter: Record<string, unknown>, params: unknown[]): string {
    const clauses: string[] = [];
    for (const [column, value] of Object.entries(filter)) {
      if (value === undefined) {
        continue;
      }
      if (value !== null && typeof value === "object") {
        throw new DatabaseError(
          `Unsupported non-scalar bracket filter on column '${column}'`,
          DatabaseErrorType.Other
        );
      }
      if (value === null) {
        clauses.push(`${column} IS NULL`);
      } else {
        params.push(value);
        clauses.push(`${column} = $${params.length}`);
      }
    }
    return clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
  }

  private async query<R extends pg.QueryResultRow = pg.QueryResultRow>(text: string, params?: unknown[]) {
    try {
      return await this.pool.query<R>(text, params as unknown[]);
    } catch (err) {
      console.error("[PostgresBracketDatabase] query failed:", text);
      throw err;
    }
  }
}
