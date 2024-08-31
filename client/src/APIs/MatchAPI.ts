import { MatchAPIConstants } from "@common/Constants/MatchAPIConstants";
import { Match, Status } from "brackets-model";
import { HttpStatusError } from "../Errors/HttpStatusError";
import { MatchMetadata } from "@common/Models/MatchMetadata";


export namespace MatchAPI {
  export async function getMatch(tournamentId: string, matchId: number): Promise<Match> {
    const resp = await fetch(`${MatchAPIConstants.BASE_PATH}${MatchAPIConstants.GET_MATCH(tournamentId, matchId.toString())}`);
    if (resp.ok) {
      return (await resp.json()) as Match;
    } else {
      throw new HttpStatusError("Failed to get match.", resp.status);
    }
  }

  // Not all matches have metadata do undefined is a correct return type.
  export async function getMatchMetadata(tournamentId: string, matchId: number): Promise<MatchMetadata | undefined> {

    const resp = await fetch(
      `${MatchAPIConstants.BASE_PATH}${MatchAPIConstants.GET_MATCH_METADATA(tournamentId, matchId.toString())}`
    );

    if (resp.ok) {
      return (await resp.json()) as MatchMetadata;
    } else if (resp.status === 404) {
      return undefined;
    } else {
      throw new HttpStatusError("Failed to get match metadata.", resp.status);
    }
  }

  export async function getAllMatchMetadata(tournamentId: string): Promise<MatchMetadata[] | undefined> {

    const resp = await fetch(
      `${MatchAPIConstants.BASE_PATH}${MatchAPIConstants.GET_ALL_MATCH_METADATA(tournamentId)}`
    );

    if (resp.ok) {
      return (await resp.json()) as MatchMetadata[];
    } else if (resp.status === 404) {
      return undefined;
    } else {
      throw new HttpStatusError("Failed to get match metadata.", resp.status);
    }
  }

  export async function addMatchMetadata(metadata: MatchMetadata) {
    const resp = await fetch(
      `${MatchAPIConstants.BASE_PATH}${MatchAPIConstants.ADD_MATCH_METADATA(metadata.tournamentId, metadata.matchId.toString())}`
      , {
        method: 'PUT',
        body: JSON.stringify(metadata),
        headers: {
          'Content-Type': 'application/json'
        }
      });

    if (!resp.ok) {
      throw new HttpStatusError("Failed to add match metadata.", resp.status);
    }
  }

  export async function updateScore(tournamentId: string, match: Match, seedNumber: number, delta: number) {
    const body: MatchAPIConstants.ScoreUpdate = {
      teamId: seedNumber,
      delta: delta
    }

    const resp = await fetch(`${MatchAPIConstants.BASE_PATH}${MatchAPIConstants.UPDATE_SCORE(tournamentId, match.id.toString())}`, {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'PUT'
    });

    if (!resp.ok) {
      throw new HttpStatusError("Failed to update match score.", resp.status);
    }
  }

  export async function updateState(tournamentId: string, match: Match, state: Status) {
    const body: MatchAPIConstants.StateUpdate = {
      match: match,
      state: state
    }

    const resp = await fetch(`${MatchAPIConstants.BASE_PATH}${MatchAPIConstants.UPDATE_STATE(tournamentId, match.id.toString())}`, {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'PUT'
    });

    if (!resp.ok) {
      throw new HttpStatusError("Failed to update match score.", resp.status);
    }
  }

  export async function resetMatch(tournamentId: string, match: Match) {
    const resp = await fetch(`${MatchAPIConstants.BASE_PATH}${MatchAPIConstants.RESET_MATCH(tournamentId, match.id.toString())}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!resp.ok) {
      throw new HttpStatusError("Failed to reset match.", resp.status);
    }
  }

  export async function selectWinner(tournamentId: string, match: Match, participantId: number) {
    const body: MatchAPIConstants.WinnerUpdate = {
      winnerId: participantId
    };

    const resp = await fetch(`${MatchAPIConstants.BASE_PATH}${MatchAPIConstants.SELECT_WINNER(tournamentId, match.id.toString())}`, {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'PUT'
    });

    if (!resp.ok) {
      throw new HttpStatusError("Failed to select match winner.", resp.status);
    }
  }

  export async function forfeit(tournamentId: string, match: Match, participantId: number) {
    const body: MatchAPIConstants.ForfeitUpdate = {
      forfeitId: participantId
    };

    const resp = await fetch(`${MatchAPIConstants.BASE_PATH}${MatchAPIConstants.FORFEIT(tournamentId, match.id.toString())}`, {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'PUT'
    });

    if (!resp.ok) {
      throw new HttpStatusError("Failed to forfeit", resp.status);
    }
  }

  export async function update(tournamentId: string, match: Match, update: Partial<Match>) {
    const resp = await fetch(`${MatchAPIConstants.BASE_PATH}${MatchAPIConstants.UPDATE(tournamentId, match.id.toString())}`, {
      body: JSON.stringify(update),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'PUT'
    });

    if (!resp.ok) {
      throw new HttpStatusError("Failed to update match score.", resp.status);
    }
  }
}