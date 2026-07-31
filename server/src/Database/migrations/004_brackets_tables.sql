-- Native relational storage for brackets-manager data.
-- One table per brackets-manager entity, prefixed `brackets_` to keep them
-- distinct from the application's own tables. Column names mirror the
-- brackets-model entity fields 1:1 (snake_case); nested fields are JSONB.
-- IDs are database-generated identities so `insert` can RETURNING id.

CREATE TABLE IF NOT EXISTS brackets_participant (
  id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tournament_id TEXT NOT NULL,
  name          TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS brackets_participant_tournament_id_idx
  ON brackets_participant (tournament_id);

CREATE TABLE IF NOT EXISTS brackets_stage (
  id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tournament_id TEXT NOT NULL,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL,
  settings      JSONB NOT NULL,
  number        INT NOT NULL
);
CREATE INDEX IF NOT EXISTS brackets_stage_tournament_id_idx
  ON brackets_stage (tournament_id);

CREATE TABLE IF NOT EXISTS brackets_group (
  id       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  stage_id INT NOT NULL,
  number   INT NOT NULL
);
CREATE INDEX IF NOT EXISTS brackets_group_stage_id_idx
  ON brackets_group (stage_id);

CREATE TABLE IF NOT EXISTS brackets_round (
  id       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  stage_id INT NOT NULL,
  group_id INT NOT NULL,
  number   INT NOT NULL
);
CREATE INDEX IF NOT EXISTS brackets_round_stage_id_idx
  ON brackets_round (stage_id);
CREATE INDEX IF NOT EXISTS brackets_round_group_id_idx
  ON brackets_round (group_id);

CREATE TABLE IF NOT EXISTS brackets_match (
  id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  stage_id    INT NOT NULL,
  group_id    INT NOT NULL,
  round_id    INT NOT NULL,
  number      INT NOT NULL,
  child_count INT NOT NULL,
  status      INT NOT NULL,
  opponent1   JSONB,
  opponent2   JSONB
);
CREATE INDEX IF NOT EXISTS brackets_match_stage_id_idx
  ON brackets_match (stage_id);
CREATE INDEX IF NOT EXISTS brackets_match_group_id_idx
  ON brackets_match (group_id);
CREATE INDEX IF NOT EXISTS brackets_match_round_id_idx
  ON brackets_match (round_id);

CREATE TABLE IF NOT EXISTS brackets_match_game (
  id        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  stage_id  INT NOT NULL,
  parent_id INT NOT NULL,
  number    INT NOT NULL,
  status    INT NOT NULL,
  opponent1 JSONB,
  opponent2 JSONB
);
CREATE INDEX IF NOT EXISTS brackets_match_game_parent_id_idx
  ON brackets_match_game (parent_id);
CREATE INDEX IF NOT EXISTS brackets_match_game_stage_id_idx
  ON brackets_match_game (stage_id);
