import { RegistrationData } from "../Models/RegistrationData";

export namespace TeamAPIConstants {
  export const BASE_PATH = '/api/v1/team';

  export type TeamRegistrationRequest = Omit<Omit<Omit<RegistrationData,'id'>,'tournamentId'>, 'approved'>

  export enum TeamRegistrationResult {
    SUCCESS,
    REGISTRATION_CLOSED,
    NO_SUCH_TOURNAMENT,
    INVALID_EMAIL,
    SERVER_ERROR,
  }

  export namespace TeamRegistrationResult {
    export function toErrorMessage(val: TeamRegistrationResult) {
      switch(val) {
        case TeamRegistrationResult.SUCCESS:
          return '';
        case TeamRegistrationResult.REGISTRATION_CLOSED:
          return 'Registration for this tournament is closed.';
        case TeamRegistrationResult.NO_SUCH_TOURNAMENT:
          return 'The tournament being registered for does not exist.'
        case TeamRegistrationResult.INVALID_EMAIL:
          return 'A registration for this tournament has already been created under that email.';
        case TeamRegistrationResult.SERVER_ERROR:
          return 'Failed to register for unknown reason. Please try again later.';
      }
    }
  }

  export interface TeamRegistrationResponse {
    result: TeamRegistrationResult;
  }

  export function REGISTER_TEAM(): '/register/:id'
  export function REGISTER_TEAM(tournamentId: string): string;
  export function REGISTER_TEAM(tournamentId = ':id') {
    return `/register/${tournamentId}`;
  }

  export const ASSIGN_SEED_NUMBERS = (tournamentId = ':id') => {
    return `/assign_seed_numbers/${tournamentId}`;
  }
  export const GET_TEAMS = (tournamentId = ':id') => {
    return `/get/teams/${tournamentId}`;
  }

  export enum RegistrationUpdateResult {
    SUCCESS,
    ERROR,
    NO_SUCH_REGISTRATION
  }

  export function GET_REGISTRATIONS(): '/get/registrations/:id'
  export function GET_REGISTRATIONS(tournamentId: string): string
  export function GET_REGISTRATIONS(tournamentId = ':id') {
    return `/get/registrations/${tournamentId}`;
  }

  export interface RegistrationCodeResponse {
    code: string;
  }
  export const CREATE_REGISTRATION_CODE = '/create/registration_code';

  export const SET_REGISTRATION_APPROVAL = '/set/registration_approval';

  export interface SetRegistrationApprovalRequest {
    contactEmail: string,
    approval: boolean,
    tournamentId: string,
  }

  export const SET_REGISTRATION_CODES = '/set/registration_codes';

  export interface SetRegistrationCodesRequest {
    tournamentId: string,
    registrations: RegistrationData[];
  }
}