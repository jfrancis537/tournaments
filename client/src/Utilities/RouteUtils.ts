export const NEW_TOURNAMENT_ID: 'new' = 'new';

export const HOME_PAGE_URL = '/';

export function tournamentUrl(id: string) {
  return `/tournament/${id}`;
}

export function matchUrl(tournamentId: string, matchId: number) {
  return `${tournamentUrl(tournamentId)}/match/${matchId}`;
}