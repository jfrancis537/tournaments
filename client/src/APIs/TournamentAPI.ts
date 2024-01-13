import { TournamentAPIConstants } from "@common/Constants/TournamentAPIConstants";
import { Database } from "brackets-manager";
import { HttpStatusError } from "../Errors/HttpStatusError";
import { SerializedTournament, Tournament, TournamentOptions, TournamentState } from "@common/Models/Tournament";

export namespace TournamentAPI {

  export async function getAllTournaments(): Promise<Tournament[]> {
    const resp = await fetch(`${TournamentAPIConstants.BASE_PATH}${TournamentAPIConstants.GET_ALL_TOURNAMENTS}`);
    if(resp.ok) {
      const tournaments = await resp.json() as SerializedTournament[];

      return tournaments.map(Tournament.Deserialize);
    }
    throw new HttpStatusError("Error occured while fetching tournaments.", resp.status);
  }

  export async function getTournament(id: string): Promise<Tournament> {
    const resp = await fetch(`${TournamentAPIConstants.BASE_PATH}${TournamentAPIConstants.GET_TOURNAMENT(id)}`);
    if(resp.ok) {
      const st = await resp.json() as SerializedTournament;
      return Tournament.Deserialize(st);
    }
    throw new HttpStatusError("Error occured while fetching tournament data.", resp.status);
  }

  export async function getTournamentData(id: string): Promise<[Tournament,Database]> {
    const resp = await fetch(`${TournamentAPIConstants.BASE_PATH}${TournamentAPIConstants.GET_TOURNAMENT_DATA(id)}`);
    if(resp.ok) {
      const [st,db] = await resp.json() as [SerializedTournament,Database];
      return [Tournament.Deserialize(st),db];
    }
    throw new HttpStatusError("Error occured while fetching tournament data.", resp.status);
  }

  export async function startTournament(id: string): Promise<void> {
    const resp = await fetch(`${TournamentAPIConstants.BASE_PATH}${TournamentAPIConstants.START_TOURNAMENT(id)}`,{
      method: 'POST'
    });
    if(!resp.ok) {
      throw new HttpStatusError("Error occured while starting tournament.", resp.status);
    }
  }

  export async function setTournamentState(id: string, state: TournamentState) {
    const body: TournamentAPIConstants.SetTournamentStateRequest = {
      state
    };
    const resp = await fetch(`${TournamentAPIConstants.BASE_PATH}${TournamentAPIConstants.SET_STATE(id)}`,{
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if(resp.status === 404) {
      throw new HttpStatusError("Tried to update state of tournament that doesn't exist.", resp.status);
    } else if (resp.status === 400) {
      throw new HttpStatusError("Attempted to update to invalid state.", resp.status);
    } else if(!resp.ok){
      throw new HttpStatusError("Error occured while setting tournament state", resp.status);
    }
  }

  export async function createNewTournament(options: TournamentOptions) {
    const resp = await fetch(`${TournamentAPIConstants.BASE_PATH}${TournamentAPIConstants.CREATE_TOURNAMENT()}`,{
      body: JSON.stringify(options),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'PUT'
    });
    if(!resp.ok)
    {
      throw new HttpStatusError("Error occured while creating tournament.", resp.status);
    }

    const serialized: SerializedTournament = await resp.json();
    return Tournament.Deserialize(serialized);
  }

  export async function registerForTournament() {
    
  }
}