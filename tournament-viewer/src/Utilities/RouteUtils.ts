export function tournamentUrl(id: string) {
  return `/tournament/${id}`;
}

export function matchUrl(tournamentId: string, matchId: number) {
  return `${tournamentUrl(tournamentId)}/match/${matchId}`;
}