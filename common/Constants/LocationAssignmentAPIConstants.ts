export namespace LocationAssignmentAPIConstants {
  export const BASE_PATH = '/api/v1/location-assignment';

  export const PREVIEW = '/preview';
  export const CONFIRM = '/confirm';

  export interface PreviewRequest {
    tournamentIds: string[];
    locations: string[];
    matchDurationMinutes: number;
    gapMinutes: number;
    windowStartHour: number;
    windowStartMinute: number;
    windowEndHour: number;
    windowEndMinute: number;
  }

  export interface MatchAssignment {
    tournamentId: string;
    tournamentName: string;
    matchId: number;
    location: string;
    scheduledTime: string;
  }

  export type PreviewResponse = MatchAssignment[];

  export interface ConfirmRequest {
    assignments: MatchAssignment[];
  }
}
