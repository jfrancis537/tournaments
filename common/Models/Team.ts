export interface Team {
  id: string;
  tournamentId: string;
  name: string;
  contactEmail: string;
  players: string[];
  seedNumber: number | undefined;
}