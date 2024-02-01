export interface Player {
  contactEmail: string,
  name: string
}

export interface Team {
  id: string;
  tournamentId: string;
  name: string;
  players: Player[];
  seedNumber: number | undefined;
}