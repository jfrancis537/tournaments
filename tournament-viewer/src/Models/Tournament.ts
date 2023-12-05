import { StageSettings, StageType } from "brackets-model";

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
  startDate: Date;
  endDate: Date;
  registrationOpenDate?: Date;
  stages: StageType[];
  stageSettings: StageSettings[];
}