import { TournamentState } from "../Models/Tournament";

export namespace TournamentAPIConstants {
  export const BASE_PATH = '/api/v1/tournament';

  export const GET_ALL_TOURNAMENTS = '/get/all'

  export function GET_TOURNAMENT(): '/get/:id';
  export function GET_TOURNAMENT(id: string): string;
  export function GET_TOURNAMENT(id = ':id') {
    return `/get/${id}`;
  }

  export const GET_TOURNAMENT_DATA = (id = ':id') => {
    return `/get/data/${id}`;
  }

  export const START_TOURNAMENT = (id = ':id') => {
    return `/start/${id}`;
  }

  export interface SetTournamentStateRequest {
    state: TournamentState;
  }

  export function SET_STATE(): `/set/state/:id`;
  export function SET_STATE(id: string): string;
  export function SET_STATE(id = ':id') {
    return `/set/state/${id}`;
  }
  export function DELETE_TOURNAMENT(id: string): string;
  export function DELETE_TOURNAMENT(): '/delete/:id';
  export function DELETE_TOURNAMENT(id = ':id') {
    return `/delete/${id}`;
  }

  export const CREATE_TOURNAMENT = () => {
    return `/create`
  }

  export const GET_TEAMS = (id = ':id') => {
    return `/get/teams/${id}`
  }
}