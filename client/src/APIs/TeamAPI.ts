import { TeamAPIConstants } from "@common/Constants/TeamAPIConstants";
import { Team } from "@common/Models/Team";
import { HttpStatusError } from "../Errors/HttpStatusError";
import { RegistrationData } from "@common/Models/RegistrationData";

export namespace TeamAPI {

  export async function register(tournamentId: string, request: TeamAPIConstants.TeamRegistrationRequest) {
    const response = await fetch(`${TeamAPIConstants.BASE_PATH}${TeamAPIConstants.REGISTER_TEAM(tournamentId)}`, {
      method: 'PUT',
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return await response.json() as TeamAPIConstants.TeamRegistrationResponse;
  }

  export async function createRegistrationCode() {
    const response = await fetch(`${TeamAPIConstants.BASE_PATH}${TeamAPIConstants.CREATE_REGISTRATION_CODE}`);
    if(response.ok) {
      return await response.json() as TeamAPIConstants.RegistrationCodeResponse;
    } else {
      throw new HttpStatusError("Failed to get registration code", response.status);
    }
  }

  export async function getRegistrations(tournamentId: string): Promise<RegistrationData[]> {
    const response = await fetch(`${TeamAPIConstants.BASE_PATH}${TeamAPIConstants.GET_REGISTRATIONS(tournamentId)}`);
    if (response.ok) {
      const data = await response.json() as RegistrationData[];
      return data;
    }

    throw new HttpStatusError("Failed to get registrations", response.status);
  }

  export async function getTeams(tournamentId: string): Promise<Team[]> {
    const response = await fetch(`${TeamAPIConstants.BASE_PATH}${TeamAPIConstants.GET_TEAMS(tournamentId)}`);
    if (response.ok) {
      const data = await response.json() as Team[];
      return data;
    }

    throw new HttpStatusError("Failed to get teams", response.status);
  }

  export async function assignSeedNumbers(tournamentId: string,teamIds: (string | undefined)[]) {
    const response = await fetch(`${TeamAPIConstants.BASE_PATH}${TeamAPIConstants.ASSIGN_SEED_NUMBERS(tournamentId)}`, {
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