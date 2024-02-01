import { StageSettings, StageType } from "brackets-model";
import { DateTime } from "luxon";

export type TournamentOptions = Omit<Omit<Tournament, 'id'>, 'state'>;

export enum TournamentState {
  New,
  RegistrationOpen,
  RegistrationConfirmation,
  Seeding,
  Finalizing,
  Active,
  Complete
}

export namespace TournamentState {
  export function toRegistrationStatusString(state: TournamentState, registrationOpenDate?: DateTime) {
    switch (state) {
      case TournamentState.New:
        if (registrationOpenDate) {
          return `Registration opens on: ${registrationOpenDate.toFormat('DD')}`
        }
        return 'Registration is not open yet.';
      case TournamentState.RegistrationOpen:
        return 'Registration is open.'
      case TournamentState.RegistrationConfirmation:
      case TournamentState.Seeding:
      case TournamentState.Finalizing:
      case TournamentState.Active:
      case TournamentState.Complete:
        return "Registration is closed."
    }
  }
}

export interface Tournament {
  id: string;
  name: string;
  state: TournamentState;
  startDate: DateTime;
  endDate: DateTime;
  registrationOpenDate?: DateTime;
  stages: StageType[];
  stageSettings: StageSettings[];
  playersSeeded: boolean;
  teamSize: number;
}

export interface SerializedTournament {
  id: string;
  name: string;
  state: TournamentState;
  startDate: string;
  endDate: string;
  registrationOpenDate?: string;
  stages: StageType[];
  stageSettings: StageSettings[];
  playersSeeded: boolean;
  teamSize: number;
}

export namespace Tournament {
  export function Deserialize(data: SerializedTournament): Tournament {
    return {
      id: data.id,
      name: data.name,
      state: data.state,
      startDate: DateTime.fromISO(data.startDate),
      endDate: DateTime.fromISO(data.endDate),
      registrationOpenDate: data.registrationOpenDate ? DateTime.fromISO(data.registrationOpenDate) : undefined,
      stages: data.stages,
      stageSettings: data.stageSettings,
      playersSeeded: !!data.playersSeeded,
      teamSize: data.teamSize,
    }
  }

  export function Serialize(data: Tournament): SerializedTournament {
    return JSON.parse(JSON.stringify(data));
  }

  export function isRegistrationOpen(tournament: Tournament): boolean {
    switch (tournament.state) {
      case TournamentState.New:
        if (tournament.registrationOpenDate && tournament.registrationOpenDate <= DateTime.now()) {
          return true;
        } else {
          return false;
        }
      case TournamentState.RegistrationOpen:
        return true;
      case TournamentState.RegistrationConfirmation:
      case TournamentState.Seeding:
      case TournamentState.Finalizing:
      case TournamentState.Active:
      case TournamentState.Complete:
        return false;
    }
  }
}