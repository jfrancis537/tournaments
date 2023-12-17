export namespace TeamAPIConstants {
  export const BASE_PATH = '/api/v1/team';
  export const ASSIGN_SEED_NUMBERS = () => {
    return `/assign_seed_numbers`;
  }
  export const GET_TEAMS = (tournamentId = ':id') => {
    return `/get/teams/${tournamentId}`;
  }
}