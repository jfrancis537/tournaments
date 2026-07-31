import { MatchMetadata } from "@common/Models/MatchMetadata";
import { NewsPost } from "@common/Models/NewsPost";
import { RegistrationData } from "@common/Models/RegistrationData";
import { Player, Team } from "@common/Models/Team";
import { Tournament, TournamentMetadata } from "@common/Models/Tournament";
import { Values } from "@common/Utilities/TypeHelpers";
import { CrudInterface, Database as BracketsDatabase } from "brackets-manager";
import { StageSettings, StageType } from "brackets-model";
import * as pg from "pg";
import { EnvironmentVariables } from "../Utilities/EnvironmentVariables";
import { Database } from "./Database";
import { DatabaseError, DatabaseErrorType } from "./DatabaseError";
import { PostgresBracketDatabase } from "./PostgresBracketDatabase";
import { Tables } from "./PostgressDatabaseDescriptors";


type ColResult<T extends Tables.Names> = Tables.ColumnDefinitions[T]

const NIL_UUID = `00000000-0000-0000-0000-000000000000`;

export class PostgresDatabase implements Database {

  private readonly pool: pg.Pool;
  private readonly ready: Promise<boolean>;

  /** Native brackets-manager storage backed by the `brackets_*` tables. */
  public readonly bracketStorage: CrudInterface;

  constructor() {
    this.pool = new pg.Pool({
      password: EnvironmentVariables.PSQL_PASSWORD,
      database: EnvironmentVariables.PSQL_DATABASE,
      host: '127.0.0.1',
      user: EnvironmentVariables.PSQL_USERNAME
    });

    this.bracketStorage = new PostgresBracketDatabase(this.pool);
    this.ready = this.init();
  }

  // async hasUser(email: string): Promise<boolean> {
  //   const COLS = Tables.ColumnNames.Users;
  //   const result = await this.query(`SELECT ${COLS.Email} FROM ${Tables.Names.Users} WHERE ${COLS.Email} = $1`, [email]);
  //   return (!!result.rows[0]);
  // }

  // async getUser(email: string): Promise<UserRecord> {
  //   const COLS = Tables.ColumnNames.Users;
  //   const result = await this.query<ColResult<Tables.Names.Users>>
  //     (`SELECT * FROM ${Tables.Names.Users} WHERE ${COLS.Email} = $1`, [email]);
  //   if (!result.rows[0]) {
  //     throw new DatabaseError(`Failed to get user with email: ${email}`, DatabaseErrorType.MissingRecord);
  //   }

  //   const row = result.rows[0];

  //   return {
  //     email: row.email,
  //     role: row.role,
  //     salt: row.salt,
  //     hash: row.hash,
  //     createdDate: row.createddate,
  //     registrationToken: row.registrationtoken ?? undefined
  //   }
  // }

  // async addUser(user: UserRecord): Promise<UserRecord> {

  //   if (await this.hasUser(user.email)) {
  //     throw new DatabaseError(`User with email: ${user.email} already exists`, DatabaseErrorType.ExistingRecord);
  //   }

  //   const colNames = Tables.ColumnNames.Users.asArray();
  //   const result = await this.query<ColResult<Tables.Names.Users>>(`
  //   INSERT INTO ${Tables.Names.Users} (${colNames.join(',')})
  //   VALUES ($1, $2, $3, $4, $5, $6)
  //   RETURNING *;`,
  //     [user.email, user.role, user.salt, user.hash, user.createdDate, user.registrationToken ?? null]);

  //   const row = result.rows[0];

  //   if (!row) {
  //     throw new DatabaseError(`Failed to add user with email: ${user.email}`, DatabaseErrorType.Other);
  //   }

  //   return {
  //     email: row.email,
  //     role: row.role,
  //     salt: row.salt,
  //     hash: row.hash,
  //     createdDate: row.createddate,
  //     registrationToken: row.registrationtoken ?? undefined
  //   }
  // }
  // async updateUser(email: string, details: Partial<Omit<UserRecord, "email">>): Promise<UserRecord> {

  //   const existingUser = await this.getUser(email);
  //   Object.assign(existingUser, details);

  //   const COLS = Tables.ColumnNames.Users;
  //   const result = await this.query<ColResult<Tables.Names.Users>>(
  //     `UPDATE ${Tables.Names.Users}
  //     SET ${COLS.Role} = $2, ${COLS.Salt} = $3, 
  //         ${COLS.Hash} = $4, ${COLS.CreatedDate} = $5, ${COLS.RegistrationToken} = $6
  //     WHERE ${COLS.Email} = $1
  //     RETURNING *;
  //     `,
  //     [email, existingUser.role, existingUser.salt, existingUser.hash, existingUser.createdDate, existingUser.registrationToken ?? null]
  //   );

  //   const row = result.rows[0];

  //   if (!row) {
  //     throw new DatabaseError(`Failed to update user with email: ${email}`, DatabaseErrorType.Other);
  //   }

  //   return {
  //     email: row.email,
  //     role: row.role,
  //     salt: row.salt,
  //     hash: row.hash,
  //     createdDate: row.createddate,
  //     registrationToken: row.registrationtoken ?? undefined
  //   }

  // }
  // async findUser(user: Partial<UserRecord>): Promise<UserRecord | undefined> {
  //   try {
  //     return await this.getUser(user.email!)
  //   } catch (err) {
  //     if (err instanceof DatabaseError && err.type === DatabaseErrorType.MissingRecord) {
  //       return undefined;
  //     }
  //   }
  // }

  // async confirmUser(token: string): Promise<UserRecord> {

  //   const COLS = Tables.ColumnNames.Users;
  //   const colNames = Tables.ColumnNames.Users.asArray();
  //   const result =
  //     await this.query<ColResult<Tables.Names.Users>, [string]>(
  //       `SELECT ${colNames.join(',')}
  //      FROM ${Tables.Names.Users}
  //      WHERE ${COLS.RegistrationToken} = $1;
  //     `,
  //       [token]
  //     );
  //   const row = result.rows[0];

  //   if (!row) {
  //     throw new DatabaseError('No user with specified registration token exists.', DatabaseErrorType.MissingRecord);
  //   }

  //   return await this.updateUser(row.email, {
  //     registrationToken: undefined
  //   });

  // }

  async hasNewsPost(id: string): Promise<boolean> {
    const COLS = Tables.ColumnNames.NewsPosts;
    const result = await this.query(`SELECT ${COLS.Id} FROM ${Tables.Names.NewsPosts} WHERE ${COLS.Id} = $1`, [id]);
    return (!!result.rows[0]);
  }

  async addNewsPost(post: NewsPost): Promise<NewsPost> {
    if (await this.hasNewsPost(post.id)) {
      throw new DatabaseError(`Post with id: ${post.id} already exists`, DatabaseErrorType.ExistingRecord);
    }

    const colNames = Tables.ColumnNames.NewsPosts.asArray();
    const result = await this.query<ColResult<Tables.Names.NewsPosts>>(`
    INSERT INTO ${Tables.Names.NewsPosts} (${colNames.join(',')})
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *;`,
      [post.id,post.author,post.title,post.markdown,post.createdDate.toString(),post.updatedDate.toString()]);

    const row = result.rows[0];

    if (!row) {
      throw new DatabaseError(`Failed to news post with email: ${post.id}`, DatabaseErrorType.Other);
    }

    return {
      id: post.id,
      author: post.author,
      title: post.title,
      markdown: post.markdown,
      createdDate: post.createdDate,
      updatedDate: post.updatedDate
    }
  }
  async updateNewsPost(id: string, post: Omit<NewsPost, "id">): Promise<NewsPost> {

    const existing = await this.getNewsPost(id);
    Object.assign(existing, post);

    const COLS = Tables.ColumnNames.NewsPosts;
    const result = await this.query<ColResult<Tables.Names.NewsPosts>>(
      `UPDATE ${Tables.Names.NewsPosts}
      SET ${COLS.Author} = $2, ${COLS.Title} = $3, ${COLS.Markdown} = $4, 
          ${COLS.CreatedDate} = $5, ${COLS.UpdatedDate} = $6
      WHERE ${COLS.Id} = $1
      RETURNING *;
      `,
      [id, existing.author, existing.title ,existing.markdown, existing.createdDate.toString(), existing.updatedDate.toString()]
    );

    const row = result.rows[0];

    if (!row) {
      throw new DatabaseError(`Failed to update news post with id: ${id}`, DatabaseErrorType.Other);
    }

    return NewsPost.Deserialize({
      id: row.id,
      author: row.author,
      title: row.title,
      markdown: row.markdown,
      createdDate: row.createddate,
      updatedDate: row.updateddate
    });
  }
  async getNewsPost(id: string): Promise<NewsPost> {
    const COLS = Tables.ColumnNames.NewsPosts;
    const result = await this.query<ColResult<Tables.Names.NewsPosts>>
      (`SELECT * FROM ${Tables.Names.NewsPosts} WHERE ${COLS.Id} = $1`, [id]);
    if (!result.rows[0]) {
      throw new DatabaseError(`Failed to get post with id: ${id}`, DatabaseErrorType.MissingRecord);
    }

    const row = result.rows[0];

    return NewsPost.Deserialize({
      id: row.id,
      author: row.author,
      title: row.title,
      markdown: row.markdown,
      createdDate: row.createddate,
      updatedDate: row.updateddate
    });
  }
  async getNewsPosts(page: number, pageSize: number): Promise<{ posts: NewsPost[]; totalCount: number }> {
    const COLS = Tables.ColumnNames.NewsPosts;
    const offset = (page - 1) * pageSize;

    const result = await this.query<ColResult<Tables.Names.NewsPosts>, [number, number]>(
      `SELECT * FROM ${Tables.Names.NewsPosts}
       ORDER BY ${COLS.CreatedDate} DESC
       LIMIT $1 OFFSET $2;`,
      [pageSize, offset]
    );

    const countResult = await this.query<{ count: string }>(
      `SELECT COUNT(*) FROM ${Tables.Names.NewsPosts};`
    );

    const posts: NewsPost[] = [];

    for (const row of result.rows) {
      posts.push(NewsPost.Deserialize({
        id: row.id,
        author: row.author,
        title: row.title,
        markdown: row.markdown,
        createdDate: row.createddate,
        updatedDate: row.updateddate
      }));
    }

    return { posts, totalCount: Number(countResult.rows[0]?.count ?? 0) };
  }

  async deletePost(id: string): Promise<void> {
    const COLS = Tables.ColumnNames.NewsPosts;
    await this.query<ColResult<Tables.Names.NewsPosts>, [string]>(
      `DELETE FROM ${Tables.Names.NewsPosts}
       WHERE ${COLS.Id} = $1`,
      [id]
    )
  }


  async getTournament(tournamentId: string): Promise<Tournament> {
    const COLS = Tables.ColumnNames.Tournaments;
    const result = await this.query<ColResult<Tables.Names.Tournaments>, [string]>(
      `SELECT ${COLS.asArray().join(',')} 
      FROM ${Tables.Names.Tournaments} 
      WHERE ${Tables.ColumnNames.Tournaments.Id} = $1`,
      [tournamentId]
    );

    if (!result.rows[0]) {
      throw new DatabaseError(`No tournament with id: ${tournamentId}`, DatabaseErrorType.MissingRecord);
    }

    const row = result.rows[0];

    return Tournament.Deserialize({
      id: row.id,
      name: row.name,
      state: row.state,
      startDate: row.startdate,
      endDate: row.enddate,
      registrationOpenDate: row.registrationopendate ?? undefined,
      stages: row.stages.split(',') as StageType[],
      stageSettings: JSON.parse(row.stagesettings) as StageSettings[],
      playersSeeded: row.playersseeded,
      teamSize: row.teamsize,
    });
  }

  async getAllTournaments(): Promise<Tournament[]> {

    const tournaments: Tournament[] = [];

    const COLS = Tables.ColumnNames.Tournaments;
    const result = await this.query<ColResult<Tables.Names.Tournaments>, [string]>(
      `SELECT ${COLS.asArray().join(',')} 
      FROM ${Tables.Names.Tournaments}`
    );

    for (const row of result.rows) {
      tournaments.push(Tournament.Deserialize({
        id: row.id,
        name: row.name,
        state: row.state,
        startDate: row.startdate,
        endDate: row.enddate,
        registrationOpenDate: row.registrationopendate ?? undefined,
        stages: row.stages.split(',') as StageType[],
        stageSettings: JSON.parse(row.stagesettings) as StageSettings[],
        playersSeeded: row.playersseeded,
        teamSize: row.teamsize,
      }));
    }

    return tournaments;
  }

  async addTournament(tournament: Tournament): Promise<Tournament> {
    let exists = true;
    try {
      await this.getTournament(tournament.id)
    } catch (err) {
      if (err instanceof DatabaseError && err.type === DatabaseErrorType.MissingRecord) {
        exists = false;
      }
    }

    if(exists) {
      throw new DatabaseError(
        `Failed to add tournament with id: ${tournament.id} and name: ${tournament.name}`,
        DatabaseErrorType.ExistingRecord
      );
    }

    const colNames = Tables.ColumnNames.Tournaments.asArray();
    const result = await this.query<ColResult<Tables.Names.Tournaments>>(`
    INSERT INTO ${Tables.Names.Tournaments} (${colNames.join(',')})
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;`,
      [
        tournament.id,
        tournament.name,
        tournament.state,
        tournament.startDate.toString(),
        tournament.endDate.toString(),
        tournament.registrationOpenDate?.toString() ?? null,
        tournament.stages.join(','),
        JSON.stringify(tournament.stageSettings),
        tournament.playersSeeded,
        tournament.teamSize
      ]);

    const row = result.rows[0];

    if (!row) {
      throw new DatabaseError(
        `Failed to add tournament with id: ${tournament.id} and name: ${tournament.name}`,
        DatabaseErrorType.Other
      );
    }

    return Tournament.Deserialize({
      id: row.id,
      name: row.name,
      state: row.state,
      startDate: row.startdate,
      endDate: row.enddate,
      registrationOpenDate: row.registrationopendate ?? undefined,
      stages: row.stages.split(',') as StageType[],
      stageSettings: JSON.parse(row.stagesettings) as StageSettings[],
      playersSeeded: row.playersseeded,
      teamSize: row.teamsize,
    });
  }

  async updateTournament(tournamentId: string, tournament: Partial<Omit<Tournament, "id">>): Promise<Tournament> {
    const existing = await this.getTournament(tournamentId);

    Object.assign(existing, tournament);
    const COLS = Tables.ColumnNames.Tournaments;
    const result = await this.query<ColResult<Tables.Names.Tournaments>>(
      `UPDATE ${Tables.Names.Tournaments}
       SET 
         ${COLS.Name} = $2,
         ${COLS.State} = $3,
         ${COLS.StartDate} = $4,
         ${COLS.EndDate} = $5,
         ${COLS.RegistrationOpenDate} = $6,
         ${COLS.Stages} = $7,
         ${COLS.StageSettings} = $8,
         ${COLS.PlayersSeeded} = $9,
         ${COLS.TeamSize} = $10
       WHERE ${COLS.Id} = $1
       RETURNING *;
      `,
      [
        tournamentId,
        existing.name,
        existing.state,
        existing.startDate.toString(),
        existing.endDate.toString(),
        existing.registrationOpenDate?.toString() ?? null,
        existing.stages.join(','),
        JSON.stringify(existing.stageSettings),
        existing.playersSeeded,
        existing.teamSize
      ]
    );

    const row = result.rows[0];

    if (!row) {
      throw new DatabaseError(
        `Failed to update tournament with id: ${existing.id} and name: ${existing.name}`,
        DatabaseErrorType.Other
      );
    }

    return Tournament.Deserialize({
      id: row.id,
      name: row.name,
      state: row.state,
      startDate: row.startdate,
      endDate: row.enddate,
      registrationOpenDate: row.registrationopendate ?? undefined,
      stages: row.stages.split(',') as StageType[],
      stageSettings: JSON.parse(row.stagesettings) as StageSettings[],
      playersSeeded: row.playersseeded,
      teamSize: row.teamsize,
    });
  }

  async deleteTournament(tournamentId: string): Promise<void> {
    const COLS = Tables.ColumnNames.Tournaments;
    await this.query<ColResult<Tables.Names.Tournaments>, [string]>(
      `DELETE FROM ${Tables.Names.Tournaments}
       WHERE ${COLS.Id} = $1`,
      [tournamentId]
    )
  }

  async setTournamentMetadata(metadata: TournamentMetadata): Promise<TournamentMetadata> {
    const colNames = Tables.ColumnNames.TournamentMetadata.asArray();
    const result = await this.query<ColResult<Tables.Names.TournamentMetadata>>(
      `INSERT INTO ${Tables.Names.TournamentMetadata} 
      (${colNames.join(',')}) 
      VALUES ($1, $2) 
      ON CONFLICT (id) 
      DO UPDATE SET 
      ${Tables.ColumnNames.TournamentMetadata.Metadata} = EXCLUDED.${Tables.ColumnNames.TournamentMetadata.Metadata}
      RETURNING *;`,
      [metadata.id, JSON.stringify(metadata)]
    )
    const row = result.rows[0];
    if (!row) {
      throw new DatabaseError("Failed to set metadata for tournament with id: " + metadata.id, DatabaseErrorType.Other);
    }

    return JSON.parse(row.metadata) as TournamentMetadata;
  }
  async getTournamentMetadata(id: string): Promise<TournamentMetadata | undefined> {
    const result = await this.query<{ metadata: string }, [string]>(
      `SELECT ${Tables.ColumnNames.TournamentMetadata.Metadata}
       FROM ${Tables.Names.TournamentMetadata}
       WHERE ${Tables.ColumnNames.TournamentMetadata.Id} = $1;
      `,
      [id]
    );

    const row = result.rows[0];
    if (!row) {
      return undefined;
    }

    return JSON.parse(row.metadata) as TournamentMetadata;
  }

  async deleteTournamentMetadata(id: string): Promise<void> {
    await this.query(
      `DELETE FROM ${Tables.ColumnNames.TournamentMetadata.Metadata}
       WHERE ${Tables.ColumnNames.TournamentMetadata.Id} = $1; 
      `,
      [id]
    );
  }


  async addMatchMetadata(metadata: MatchMetadata): Promise<void> {
    const COLS = Tables.ColumnNames.MatchMetadata;
    const colNames = COLS.asArray();
    await this.query<ColResult<Tables.Names.MatchMetadata>>(
      `INSERT INTO ${Tables.Names.MatchMetadata}
      (${colNames.join(',')})
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (${COLS.TournamentId}, ${COLS.MatchId})
      DO UPDATE SET
        ${COLS.Title} = EXCLUDED.${COLS.Title},
        ${COLS.Location} = EXCLUDED.${COLS.Location},
        ${COLS.ScheduledTime} = EXCLUDED.${COLS.ScheduledTime};`,
      [metadata.tournamentId, metadata.matchId, metadata.title, metadata.location ?? null, metadata.scheduledTime ?? null]
    )
  }

  async bulkUpsertMatchMetadata(entries: MatchMetadata[]): Promise<void> {
    if (entries.length === 0) return;
    const COLS = Tables.ColumnNames.MatchMetadata;
    await this.query(
      `INSERT INTO ${Tables.Names.MatchMetadata} (${COLS.TournamentId}, ${COLS.MatchId}, ${COLS.Title}, ${COLS.Location}, ${COLS.ScheduledTime})
       SELECT * FROM UNNEST($1::uuid[], $2::int[], $3::text[], $4::text[], $5::text[])
         AS t(${COLS.TournamentId}, ${COLS.MatchId}, ${COLS.Title}, ${COLS.Location}, ${COLS.ScheduledTime})
       ON CONFLICT (${COLS.TournamentId}, ${COLS.MatchId})
       DO UPDATE SET
         ${COLS.Title} = EXCLUDED.${COLS.Title},
         ${COLS.Location} = EXCLUDED.${COLS.Location},
         ${COLS.ScheduledTime} = EXCLUDED.${COLS.ScheduledTime};`,
      [
        entries.map(e => e.tournamentId),
        entries.map(e => e.matchId),
        entries.map(e => e.title),
        entries.map(e => e.location ?? null),
        entries.map(e => e.scheduledTime ?? null),
      ]
    );
  }

  async deleteMatchMetadata(tournamentId: string): Promise<void> {
    const COLS = Tables.ColumnNames.MatchMetadata;
    await this.query<ColResult<Tables.Names.MatchMetadata>, [string]>(
      `DELETE FROM ${Tables.Names.MatchMetadata}
       WHERE ${COLS.TournamentId} = $1`,
      [tournamentId]
    );
  }

  public async getMatchMetadata(tournamentId: string): Promise<MatchMetadata[]>
  public async getMatchMetadata(tournamentId: string, matchId: number): Promise<MatchMetadata>
  public async getMatchMetadata(tournamentId: string, matchId?: number): Promise<MatchMetadata | MatchMetadata[]> {
    const COLS = Tables.ColumnNames.MatchMetadata;
    const allMetadataQueryResult = await this.query<ColResult<Tables.Names.MatchMetadata>, [string]>(
      `SELECT * FROM ${Tables.Names.MatchMetadata}
       WHERE ${COLS.TournamentId} = $1
      `,
      [tournamentId]
    );

    if (matchId === undefined) {
      const metadata: MatchMetadata[] = [];
      for (const row of allMetadataQueryResult.rows) {
        metadata.push({
          tournamentId: row.tournamentid,
          matchId: row.matchid,
          title: row.title,
          location: row.location ?? undefined,
          scheduledTime: row.scheduled_time ?? undefined,
        });
      }
      return metadata;
    } else {
      const row = allMetadataQueryResult.rows.find((r => r.matchid === matchId));
      if (row) {
        return {
          tournamentId: row.tournamentid,
          matchId: row.matchid,
          title: row.title,
          location: row.location ?? undefined,
          scheduledTime: row.scheduled_time ?? undefined,
        }
      } else {
        throw new DatabaseError(`match: ${matchId} does not have metadata for tournament: ${tournamentId}`
          , DatabaseErrorType.MissingRecord);
      }
    }
  }

  async setBracketData(data: BracketsDatabase): Promise<void> {
    const COLS = Tables.ColumnNames.BracketsData;
    const colNames = COLS.asArray();
    await this.query<ColResult<Tables.Names.BracketsData>>(
      `INSERT INTO ${Tables.Names.BracketsData}
       (${colNames.join(',')})
       VALUES ($1, $2)
       ON CONFLICT (${COLS.TournamentId}) 
       DO UPDATE SET ${COLS.Data} = EXCLUDED.${COLS.Data};`,
      [NIL_UUID, JSON.stringify(data)]
    )
  }

  async getBracketData(): Promise<BracketsDatabase> {
    const result = await this.query<ColResult<Tables.Names.BracketsData>, [string]>(
      `SELECT ${Tables.ColumnNames.BracketsData.Data}
       FROM ${Tables.Names.BracketsData}
       WHERE ${Tables.ColumnNames.BracketsData.TournamentId} = $1;
      `,
      [NIL_UUID]
    )

    const row = result.rows[0];
    if (!row) {
      await this.setBracketData({
        group: [],
        match: [],
        match_game: [],
        round: [],
        stage: [],
        participant: []
      });
      return await this.getBracketData();
    }
    return JSON.parse(row.data);
  }

  async addTeam(team: Team): Promise<Team> {

    let exists = true;
    try {
      await this.getTeam(team.id);
    } catch {
      exists = false;
    }

    if (exists) {
      throw new DatabaseError(`Team with id: ${team.id} already exists`, DatabaseErrorType.ExistingRecord);
    }

    const colNames = Tables.ColumnNames.Teams.asArray();
    const teamInsertResult = await this.query<ColResult<Tables.Names.Teams>>(`
    INSERT INTO ${Tables.Names.Teams} (${colNames.join(',')})
    VALUES ($1, $2, $3, $4)
    RETURNING *;`,
      [team.id, team.tournamentId, team.name, team.seedNumber ?? null]);

    const teamRow = teamInsertResult.rows[0];
    if (!teamRow) {
      throw new DatabaseError(`Failed to add team with id: ${team.id}`, DatabaseErrorType.Other);
    }

    const players: Player[] = [];
    for (const player of team.players) {
      const playerCols = Tables.ColumnNames.Players.asArray();
      const insertResult = await this.query<ColResult<Tables.Names.Players>>(
        `INSERT INTO ${Tables.Names.Players} (${playerCols.join(',')})
           VALUES ($1, $2, $3, $4)
           RETURNING *;
          `,
        [player.contactEmail, team.id, player.name, player.skillLevel]
      )

      const playerRow = insertResult.rows[0];
      if (!playerRow) {
        throw new DatabaseError(`Failed to add player with team id: ${team.id} and email: ${player.contactEmail}`, DatabaseErrorType.Other);
      }

      players.push({
        contactEmail: playerRow.contactemail,
        name: playerRow.name,
        skillLevel: playerRow.skilllevel,
      });
    }

    return {
      id: teamRow.id,
      tournamentId: teamRow.tournamentid,
      players: players,
      seedNumber: teamRow.seednumber ?? undefined,
      name: teamRow.name
    }

  }

  async setTeamSeedNumber(id: string, seed: number | undefined): Promise<Team> {
    const result = await this.query<ColResult<Tables.Names.Teams>>(
      `UPDATE ${Tables.Names.Teams}
       SET 
         ${Tables.ColumnNames.Teams.SeedNumber} = $2
       WHERE ${Tables.ColumnNames.Teams.Id} = $1
       RETURNING *;
      `,
      [id, seed ?? null]
    );

    const row = result.rows[0];
    if (!row) {
      throw new DatabaseError(`No team with id: ${id}`, DatabaseErrorType.MissingRecord);
    }

    const team: Team = {
      id: row.id,
      tournamentId: row.tournamentid,
      name: row.name,
      seedNumber: row.seednumber ?? undefined,
      players: []
    };

    const playerSelection = await this.getPlayers(id);

    for (const playerRow of playerSelection.rows) {
      team.players.push({
        contactEmail: playerRow.contactemail,
        name: playerRow.name,
        skillLevel: playerRow.skilllevel
      });
    }

    return team;


  }

  private async getPlayers(teamId: string) {
    const playerCols = Tables.ColumnNames.Players.asArray();
    const playerSelection = await this.query<ColResult<Tables.Names.Players>, string[]>(
      `SELECT ${playerCols.join(',')} FROM ${Tables.Names.Players} 
       WHERE ${Tables.ColumnNames.Players.TeamId} = $1;
      `,
      [teamId]
    );
    return playerSelection;
  }

  async getTeam(id: string): Promise<Team> {
    const teamSelection = await this.query<ColResult<Tables.Names.Teams>>(
      `SELECT * FROM ${Tables.Names.Teams} WHERE ${Tables.ColumnNames.Teams.Id} = $1;`,
      [id]
    );

    const row = teamSelection.rows[0];

    if (!row) {
      throw new DatabaseError(`No team with id: ${id}`, DatabaseErrorType.MissingRecord);
    }

    const team: Team = {
      id: row.id,
      tournamentId: row.tournamentid,
      name: row.name,
      seedNumber: row.seednumber ?? undefined,
      players: []
    };

    const playerSelection = await this.getPlayers(id);

    for (const playerRow of playerSelection.rows) {
      team.players.push({
        contactEmail: playerRow.contactemail,
        name: playerRow.name,
        skillLevel: playerRow.skilllevel
      });
    }

    return team;
  }

  async getTeams(tournamentId: string): Promise<Team[]> {
    const teamSelection = await this.query<ColResult<Tables.Names.Teams>>(
      `SELECT * FROM ${Tables.Names.Teams} WHERE ${Tables.ColumnNames.Teams.TournamentId} = $1;`,
      [tournamentId]
    );

    const teams = new Map<string, Team>();
    for (const row of teamSelection.rows) {
      teams.set(row.id, {
        id: row.id,
        name: row.name,
        tournamentId: row.tournamentid,
        seedNumber: row.seednumber ?? undefined,
        players: []
      });
    }

    const valuePlaceholders: string[] = [];
    for (let i = 1; i <= teams.size; i++) {
      valuePlaceholders.push(`$${i}`);
    }

    const playerCols = Tables.ColumnNames.Players.asArray();
    const playerSelection = await this.query<ColResult<Tables.Names.Players>, string[]>(
      `SELECT ${playerCols.join(',')} FROM ${Tables.Names.Players} 
       WHERE ${Tables.ColumnNames.Players.TeamId} IN (${valuePlaceholders.join(',')});
      `,
      [...teams.keys()]
    );

    for (const row of playerSelection.rows) {
      const team = teams.get(row.teamid);
      if (!team) {
        throw new DatabaseError('Something unusual happended with players and teams', DatabaseErrorType.Other);
      }
      team.players.push({
        contactEmail: row.contactemail,
        name: row.name,
        skillLevel: row.skilllevel
      });
    }

    return [...teams.values()];

  }
  async deleteTeams(tournamentId: string): Promise<void> {
    await this.query<ColResult<Tables.Names.Teams>>(
      `DELETE FROM ${Tables.Names.Teams} WHERE ${Tables.ColumnNames.Teams.TournamentId} = $1;`,
      [tournamentId]
    );
  }

  async getRegistration(tournamentId: string, email: string): Promise<RegistrationData> {

    const COLS = Tables.ColumnNames.Registrations;
    const result = await this.query<ColResult<Tables.Names.Registrations>, [string, string]>(
      `SELECT * FROM ${Tables.Names.Registrations}
       WHERE ${COLS.Email} = $1 AND ${COLS.TournamentId} = $2;
      `,
      [email, tournamentId]
    );

    if (!result.rows[0]) {
      throw new DatabaseError(`No registration in tournament with id: ${tournamentId} and email: ${email}`, DatabaseErrorType.MissingRecord);
    }

    const row = result.rows[0];

    return {
      contactEmail: row.contactemail,
      name: row.name,
      details: row.details,
      approved: row.approved,
      teamCode: row.teamcode ?? undefined,
      tournamentId: row.tournamentid,
      skillLevel: row.skilllevel
    }

  }
  async getRegistrations(tournamentId: string): Promise<RegistrationData[]> {
    const COLS = Tables.ColumnNames.Registrations;
    const result = await this.query<ColResult<Tables.Names.Registrations>, [string]>(
      `SELECT * FROM ${Tables.Names.Registrations}
       WHERE ${COLS.TournamentId} = $1;
      `,
      [tournamentId]
    );

    const registrations: RegistrationData[] = [];

    for (const row of result.rows) {
      registrations.push({
        contactEmail: row.contactemail,
        details: row.details,
        name: row.name,
        approved: row.approved,
        teamCode: row.teamcode ?? undefined,
        tournamentId: row.tournamentid,
        skillLevel: row.skilllevel
      });
    }

    return registrations;
  }

  async addRegistration(reg: RegistrationData): Promise<RegistrationData> {
    let exists = true;
    try {
      await this.getRegistration(reg.tournamentId, reg.contactEmail)
    } catch {
      exists = false;
    }

    if (exists) {
      throw new DatabaseError(
        `Registration in tournament with id: ${reg.tournamentId} and email: ${reg.contactEmail} already exists`, DatabaseErrorType.ExistingRecord
      );
    }


    const colNames = Tables.ColumnNames.Registrations.asArray();
    const result = await this.query<ColResult<Tables.Names.Registrations>>(`
    INSERT INTO ${Tables.Names.Registrations} (${colNames.join(',')})
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;`,
      [
        reg.name,
        reg.contactEmail,
        reg.details,
        reg.tournamentId,
        reg.teamCode ?? null,
        reg.approved,
        reg.skillLevel
      ]);

    const row = result.rows[0];

    if (!row) {
      throw new DatabaseError(
        `Failed to add registration in tournament with id: ${reg.tournamentId} using email: ${reg.contactEmail}`,
        DatabaseErrorType.Other
      );
    }

    return {
      contactEmail: row.contactemail,
      details: row.details,
      name: row.name,
      approved: row.approved,
      teamCode: row.teamcode ?? undefined,
      tournamentId: row.tournamentid,
      skillLevel: row.skilllevel
    }
  }

  async updateRegistration(tournamentId: string, email: string, update: Partial<Omit<RegistrationData, "contactEmail">>): Promise<RegistrationData> {
    const existing = await this.getRegistration(tournamentId, email);
    if (!existing) {
      throw new DatabaseError(
        `Registration in tournament with id: ${tournamentId} and email: ${email} doesn't exist`, DatabaseErrorType.MissingRecord
      );
    }

    Object.assign(existing, update);
    const COLS = Tables.ColumnNames.Registrations;
    const result = await this.query<ColResult<Tables.Names.Registrations>>(
      `UPDATE ${Tables.Names.Registrations}
       SET
         ${COLS.Name} = $3,
         ${COLS.Details} = $4,
         ${COLS.TeamCode} = $5,
         ${COLS.Approved} = $6,
         ${COLS.SkillLevel} = $7
       WHERE ${COLS.TournamentId} = $1 AND ${COLS.Email} = $2
       RETURNING *;
      `,
      [
        tournamentId,
        email,
        existing.name,
        existing.details,
        existing.teamCode ?? null,
        existing.approved,
        existing.skillLevel
      ]
    );

    const row = result.rows[0];

    if (!row) {
      throw new DatabaseError(
        `Failed to update registration in tournament with id: ${existing.tournamentId} and email: ${existing.contactEmail}`,
        DatabaseErrorType.Other
      );
    }

    return {
      contactEmail: row.contactemail,
      details: row.details,
      name: row.name,
      approved: row.approved,
      teamCode: row.teamcode ?? undefined,
      tournamentId: row.tournamentid,
      skillLevel: row.skilllevel
    }
  }

  async deleteRegistrations(tournamentId: string): Promise<void> {
    const COLS = Tables.ColumnNames.Registrations;
    await this.query<ColResult<Tables.Names.Registrations>, [string]>(
      `DELETE FROM ${Tables.Names.Registrations}
       WHERE ${COLS.TournamentId} = $1;
      `,
      [tournamentId]
    );
  }
  async deleteRegistration(tournamentId: string, email: string): Promise<void> {
    const COLS = Tables.ColumnNames.Registrations;
    await this.query<ColResult<Tables.Names.Registrations>, [string, string]>(
      `DELETE FROM ${Tables.Names.Registrations}
       WHERE ${COLS.Email} = $1 AND ${COLS.TournamentId} = $2;
      `,
      [email, tournamentId]
    );
  }

  private async query<T extends pg.QueryResultRow, P extends any[] = Values<T>>(text: string, params?: P) {
    await this.ready;
    try {
      return await this.pool.query<T>(text, params);
    } catch (err) {
      console.log(text);
      throw err;
    }

  }

  private async init() {
    // await this.query(
    //   `CREATE TABLE IF NOT EXISTS ${ANONYMOUS_TABLE_NAME} (
    //   ${ColumnNames.Endpoint} TEXT PRIMARY KEY,
    //   ${ColumnNames.Subscription} TEXT NOT NULL,
    //   ${ColumnNames.Preferences} TEXT NOT NULL,
    //   ${ColumnNames.Topics} TEXT NOT NULL
    // );
    // `);
    return true;
  }

}