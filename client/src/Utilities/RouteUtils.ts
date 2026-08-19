export const NEW_TOURNAMENT_ID: 'new' = 'new';

export const NEW_POST_ID = 'new' as const;

export const HOME_PAGE_URL = '/';

export const TOURNAMENTS_LIST_URL = '/tournaments/all';

export const NEWS_PAGE_URL = '/news';

export function newsPostEditUrl(id: string) {
  return `/news/edit/${id}`;
}

export function tournamentUrl(id: string) {
  return `/tournament/${id}`;
}

export function matchUrl(tournamentId: string, matchId: number) {
  return `${tournamentUrl(tournamentId)}/match/${matchId}`;
}

export function registrationUrl(id: string) {
  return `${tournamentUrl(id)}/register`;
}