import { TournamentAPIConstants } from "@common/Constants/TournamentAPIConstants";
import { Database } from "brackets-manager";
import { HttpStatusError } from "../Errors/HttpStatusError";
import { SerializedTournament, Tournament, TournamentOptions } from "@common/Models/Tournament";

export namespace TournamentAPI {
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
}