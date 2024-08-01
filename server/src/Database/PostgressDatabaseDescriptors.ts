import { TournamentState } from "@common/Models/Tournament";
import { UserRole } from "@common/Models/User";

export namespace Tables {
  export enum Names {
    Users = 'users',
    Tournaments = 'tournaments',
    TournamentMetadata = 'tournament_metadata',
    MatchMetadata = 'match_metadata',
    BracketsData = 'bracket_data',
    Teams = 'teams',
    Players = 'players',
    Registrations = 'registrations'
  }

  export namespace Names {
    export function asArray() {
      return [
        Names.Users,
        Names.Tournaments,
        Names.TournamentMetadata,
        Names.MatchMetadata,
        Names.BracketsData,
        Names.Teams,
        Names.Players,
        Names.Registrations
      ]
    }
  }

  export namespace ColumnNames {
    export enum Users {
      Email = 'email',
      Role = 'role',
      Salt = 'salt',
      Hash = 'hash',
      CreatedDate = 'createddate',
      RegistrationToken = 'registrationtoken'
    }
    export namespace Users {
      export function asArray() {
        return [
          Users.Email,
          Users.Role,
          Users.Salt,
          Users.Hash,
          Users.CreatedDate,
          Users.RegistrationToken
        ]
      }
    }

    export enum Tournaments {
      Id = 'id',
      Name = 'name',
      State = 'state',
      StartDate = 'startdate',
      EndDate = 'enddate',
      RegistrationOpenDate = 'registrationopendate',
      Stages = 'stages',
      StageSettings = 'stagesettings',
      PlayersSeeded = 'playersseeded',
      TeamSize = 'teamsize',
    }
    export namespace Tournaments {
      export function asArray() {
        return [
          Tournaments.Id,
          Tournaments.Name,
          Tournaments.State,
          Tournaments.StartDate,
          Tournaments.EndDate,
          Tournaments.RegistrationOpenDate,
          Tournaments.Stages,
          Tournaments.StageSettings,
          Tournaments.PlayersSeeded,
          Tournaments.TeamSize,
        ];
      }
    }

    export enum TournamentMetadata {
      Id = 'id',
      Metadata = 'metadata',
    }
    export namespace TournamentMetadata {
      export function asArray() {
        return [
          TournamentMetadata.Id,
          TournamentMetadata.Metadata
        ]
      }
    }

    export enum MatchMetadata {
      TournamentId = 'tournamentid',
      MatchId = 'matchid',
      Title = 'title'
    }
    export namespace MatchMetadata {
      export function asArray() {
        return [
          MatchMetadata.TournamentId,
          MatchMetadata.MatchId,
          MatchMetadata.Title
        ]
      }
    }

    export enum BracketsData {
      TournamentId = 'tournamentid',
      Data = 'data',
    }
    export namespace BracketsData {
      export function asArray() {
        return [
          BracketsData.TournamentId,
          BracketsData.Data
        ]
      }
    }

    export enum Teams {
      Id = 'id',
      TournamentId = 'tournamentid',
      Name = 'name',
      SeedNumber = 'seednumber'
    }
    export namespace Teams {
      export function asArray() {
        return [
          Teams.Id,
          Teams.TournamentId,
          Teams.Name,
          Teams.SeedNumber
        ]
      }
    }

    export enum Players {
      Email = 'contactemail',
      TeamId = 'teamid',
      Name = 'name',
    }
    export namespace Players {
      export function asArray() {
        return [
          Players.Email,
          Players.TeamId,
          Players.Name
        ]
      }
    }

    export enum Registrations {
      Name = 'name',
      Email = 'contactemail',
      Details = 'details',
      TournamentId = 'tournamentid',
      TeamCode = 'teamcode',
      Approved = 'approved'
    }

    export namespace Registrations {
      export function asArray() {
        return [
          Registrations.Name,
          Registrations.Email,
          Registrations.Details,
          Registrations.TournamentId,
          Registrations.TeamCode,
          Registrations.Approved,
        ];
      }
    }
  }

  export interface ColumnDefinitions {
    [Names.Users]: {
      [ColumnNames.Users.Email]: string;
      [ColumnNames.Users.Role]: UserRole;
      [ColumnNames.Users.Salt]: string;
      [ColumnNames.Users.Hash]: string;
      [ColumnNames.Users.CreatedDate]: string;
      [ColumnNames.Users.RegistrationToken]: string | null;
    },
    [Names.Tournaments]: {
      [ColumnNames.Tournaments.Id]: string;
      [ColumnNames.Tournaments.Name]: string;
      [ColumnNames.Tournaments.State]: TournamentState;
      [ColumnNames.Tournaments.StartDate]: string;
      [ColumnNames.Tournaments.EndDate]: string;
      [ColumnNames.Tournaments.RegistrationOpenDate]: string | null;
      [ColumnNames.Tournaments.Stages]: string; // CSV
      [ColumnNames.Tournaments.StageSettings]: string; // JSON
      [ColumnNames.Tournaments.PlayersSeeded]: boolean;
      [ColumnNames.Tournaments.TeamSize]: number;
    },
    [Names.TournamentMetadata]: {
      [ColumnNames.TournamentMetadata.Id]: string,
      [ColumnNames.TournamentMetadata.Metadata]: string,
    }
    [Names.MatchMetadata]: {
      [ColumnNames.MatchMetadata.TournamentId]: string,
      [ColumnNames.MatchMetadata.MatchId]: number,
      [ColumnNames.MatchMetadata.Title]: string,
    },
    [Names.BracketsData]: {
      [ColumnNames.BracketsData.TournamentId]: string,
      [ColumnNames.BracketsData.Data]: string,
    },
    [Names.Teams]: {
      [ColumnNames.Teams.Id]: string,
      [ColumnNames.Teams.TournamentId]: string,
      [ColumnNames.Teams.Name]: string,
      [ColumnNames.Teams.SeedNumber]: number | null,
    },
    [Names.Players]: {
      [ColumnNames.Players.Email]: string,
      [ColumnNames.Players.TeamId]: string,
      [ColumnNames.Players.Name]: string,
    },
    [Names.Registrations]: {
      [ColumnNames.Registrations.Name]: string,
      [ColumnNames.Registrations.Email]: string,
      [ColumnNames.Registrations.Details]: string,
      [ColumnNames.Registrations.TournamentId]: string,
      [ColumnNames.Registrations.TeamCode]: string | null,
      [ColumnNames.Registrations.Approved]: boolean
    }
  }
}