import { StageSettings, StageType } from "brackets-model";
import { DateTime } from "luxon";

export enum TournamentState {
  New,
  RegistrationOpen,
  RegistrationClosed,
  Running,
  Complete
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
}