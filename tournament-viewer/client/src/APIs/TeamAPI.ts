import { TeamAPIConstants } from "@common/Constants/TeamAPIConstants";
import { Team } from "@common/Models/Team";
import { HttpStatusError } from "../Errors/HttpStatusError";

export namespace TeamAPI {
  export async function getTeams(tournamentId: string): Promise<Team[]> {
    const response = await fetch(`${TeamAPIConstants.BASE_PATH}${TeamAPIConstants.GET_TEAMS(tournamentId)}`);
    if (response.ok) {
      const data = await response.json() as Team[];
      return data;
    }

    throw new HttpStatusError("Failed to get teams", response.status);
  }

  export async function assignSeedNumbers(teamIds: (string | undefined)[]) {
    const response = await fetch(`${TeamAPIConstants.BASE_PATH}${TeamAPIConstants.ASSIGN_SEED_NUMBERS()}`, {
      body: JSON.stringify(teamIds),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    });
    if (!response.ok) {
      throw new HttpStatusError("Failed to get teams", response.status);
    }
  }
}