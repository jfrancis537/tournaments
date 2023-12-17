export namespace TournamentAPIConstants {
  export const BASE_PATH = '/api/v1/tournament';
  export const GET_TOURNAMENT_DATA = (id = ':id') => {
    return `/getData/${id}`;
  }
  export const START_TOURNAMENT = (id = ':id') => {
    return `/start/${id}`;
  }
  export const CREATE_TOURNAMENT = () => {
    return `/create`
  }

  export const GET_TEAMS = (id = ':id') => {
    return `/get/teams/${id}`
  }
}