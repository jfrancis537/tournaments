export interface Player {
  contactEmail: string,
  name: string,
  skillLevel: number,
}

export interface Team {
  id: string;
  tournamentId: string;
  name: string;
  players: Player[];
  seedNumber: number | undefined;
}