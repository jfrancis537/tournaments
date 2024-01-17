import { Match, Status } from "brackets-model";
import { TournamentAPIConstants } from "./TournamentAPIConstants";

export namespace MatchAPIConstants {
  export const BASE_PATH = TournamentAPIConstants.BASE_PATH;
  export const GET_MATCH = (tournamentId = ':tid',matchId = ':mid') => {
    return `/${tournamentId}/match/get/${matchId}`;
  }

  export function GET_MATCH_METADATA(tournamentId: string,matchId: string): string
  export function GET_MATCH_METADATA(): '/:tid/match/get/metadata/:mid'
  export function GET_MATCH_METADATA(tournamentId = ':tid',matchId = ':mid') {
    return `/${tournamentId}/match/get/metadata/${matchId}`;
  }

  export function GET_ALL_MATCH_METADATA(tournamentId: string): string
  export function GET_ALL_MATCH_METADATA(): '/:tid/get/all/metadata'
  export function GET_ALL_MATCH_METADATA(tournamentId = ':tid') {
    return `/${tournamentId}/get/all/metadata`;
  }

  export function ADD_MATCH_METADATA(tournamentId: string,matchId: string): string
  export function ADD_MATCH_METADATA(): '/:tid/match/set/:mid/metadata'
  export function ADD_MATCH_METADATA(tournamentId = ':tid',matchId = ':mid') {
    return `/${tournamentId}/match/set/${matchId}/metadata`;
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