export enum RegistrationResult {
  SUCCESS,
  FAILED_USER_EXISTS,
  FAILED_BAD_PASSWORD,
  FAILED_BAD_EMAIL,
  FAILED_BAD_USERNAME,
  FAILED_UNK,
}

export namespace RegistrationResult {
  export function toClientErrorMessage(result: RegistrationResult) {
    switch(result) {
      case RegistrationResult.FAILED_USER_EXISTS:
        return 'A user with that username already exists.'
      case RegistrationResult.FAILED_BAD_PASSWORD:
        return 'Password does not meet requirements.'
      case RegistrationResult.FAILED_BAD_EMAIL:
        return 'Email is not valid.'
      case RegistrationResult.FAILED_BAD_USERNAME:
        return 'Username does not meet requirements.'
      case RegistrationResult.FAILED_UNK:
        return 'An unknown error occured, please try again later.'
      default:
        return '';
    }
  }
}

export enum LoginResult {
  SUCCESS,
  INVALID_CREDENTIALS,
  SERVER_ERROR
}

export namespace AuthAPIConstants {
  export const BASE_PATH = '/api/v1/auth';

  export interface LoginRequest {
    username: string;
    password: string;
  }

  export interface AccountRegistrationRequest {
    username: string,
    password: string,
    email: string,
  }

  export interface AccountRegistrationResponse {
    result: RegistrationResult;
  }

  export const LOGIN = '/login';
  export const LOGOUT = '/logout';
  export const REGISTER = '/register';
  export const CURRENT_USER = '/get/user'
}