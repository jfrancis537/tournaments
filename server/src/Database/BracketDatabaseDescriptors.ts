import { DataTypes, Table } from "brackets-manager";

/**
 * Schema descriptors for the native relational storage of brackets-manager data
 * (see migration `004_brackets_tables.sql`). Kept separate from the application's
 * own table descriptors (`PostgressDatabaseDescriptors.ts`) so the bracket schema
 * stays clearly distinct.
 *
 * Column names mirror the brackets-model entity field names 1:1 (they are already
 * snake_case), so database rows map to entities with no renaming.
 */
export namespace BracketTables {

  /** The set of columns for a given table, constrained to real entity fields. */
  type ColumnList<T extends Table> = readonly (keyof DataTypes[T] & string)[];

  /** Physical table name per logical brackets-manager table. */
  export const PhysicalNames: Record<Table, string> = {
    stage: "brackets_stage",
    group: "brackets_group",
    round: "brackets_round",
    match: "brackets_match",
    match_game: "brackets_match_game",
    participant: "brackets_participant",
  };

  /** Ordered column list per table. `id` is a generated identity. */
  export const Columns: { [T in Table]: ColumnList<T> } = {
    stage: ["id", "tournament_id", "name", "type", "settings", "number"],
    group: ["id", "stage_id", "number"],
    round: ["id", "stage_id", "group_id", "number"],
    match: ["id", "stage_id", "group_id", "round_id", "number", "child_count", "status", "opponent1", "opponent2"],
    match_game: ["id", "stage_id", "parent_id", "number", "status", "opponent1", "opponent2"],
    participant: ["id", "tournament_id", "name"],
  };

  /** Columns stored as JSONB (stringified on write; parsed by node-pg on read). */
  export const JsonbColumns: Record<Table, readonly string[]> = {
    stage: ["settings"],
    group: [],
    round: [],
    match: ["opponent1", "opponent2"],
    match_game: ["opponent1", "opponent2"],
    participant: [],
  };
}
