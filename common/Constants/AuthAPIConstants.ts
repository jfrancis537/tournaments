export namespace AuthAPIConstants {
  export const BASE_PATH = '/api/v1/auth';

  export interface LoginRequest {
    username: string;
    password: string;
  }

  export const LOGIN = '/login';
  export const LOGOUT = '/logout';
  export const CURRENT_USER = '/get/user'
}