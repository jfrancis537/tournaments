import { Match, Status } from "brackets-model";
import { TournamentAPIConstants } from "./TournamentAPIConstants";

export namespace MatchAPIConstants {
  export const BASE_PATH = TournamentAPIConstants.BASE_PATH;
  export const GET_MATCH = (tournamentId = ':tid',matchId = ':mid') => {
    return `/${tournamentId}/match/get/${matchId}`;
  }

  export interface WinnerUpdate {
    winnerId: number
  }

  export const SELECT_WINNER = (tournamentId = ':tid',matchId = ':mid') => {
    return `/${tournamentId}/match/update/${matchId}/winner`;
  }

  export interface ForfeitUpdate {
    forfeitId: number
  }

  export const FORFEIT = (tournamentId = ':tid',matchId = ':mid') => {
    return `/${tournamentId}/match/update/${matchId}/forfeit`;
  }

  export interface ScoreUpdate {
    teamId: number;
    delta: number;
  }

  export function UPDATE_SCORE(): '/:tid/match/update/:mid/score';
  export function UPDATE_SCORE(tournamentId: string, matchId: string): string; 
  export function UPDATE_SCORE(tournamentId = ':tid',matchId = ':mid') {
    return `/${tournamentId}/match/update/${matchId}/score`;
  }

  export interface StateUpdate {
    match: Match;
    state: Status;
  }

  export const UPDATE_STATE = (tournamentId = ':tid',matchId = ':mid') => {
    return `/${tournamentId}/match/update/${matchId}/state`
  }

  export const UPDATE = (tournamentId = ':tid',matchId = ':mid') => {
    return `/${tournamentId}/match/update/${matchId}`
  }
}