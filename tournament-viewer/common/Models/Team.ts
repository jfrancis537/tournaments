export interface Team {
  id: string;
  tournamentId: string;
  name: string;
  players: number;
  seedNumber: number | undefined;
}