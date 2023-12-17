import { Match, Status } from "brackets-model";
import { TournamentAPIConstants } from "./TournamentAPIConstants";

export namespace MatchAPIConstants {
  export const BASE_PATH = TournamentAPIConstants.BASE_PATH;
  export const GET_MATCH = (tournamentId = ':tid',matchId = ':mid') => {
    return `/${tournamentId}/match/get/${matchId}`;
  }

  export interface WinnerUpdate {
    winnerId: number,
    match: Match
  }

  export const SELECT_WINNER = (tournamentId = ':tid',matchId = ':mid') => {
    return `/${tournamentId}/match/update/${matchId}/winner`;
  }

  export interface ForfeitUpdate {
    forfeitId: number,
    match: Match
  }

  export const FORFEIT = (tournamentId = ':tid',matchId = ':mid') => {
    return `/${tournamentId}/match/update/${matchId}/forfeit`;
  }

  export interface ScoreUpdate {
    teamId: number;
    score: number;
    match: Match;
  }

  export const UPDATE_SCORE = (tournamentId = ':tid',matchId = ':mid') => {
    return `/${tournamentId}/match/update/${matchId}/score`
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