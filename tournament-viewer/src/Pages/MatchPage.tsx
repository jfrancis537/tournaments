import { Match, ParticipantResult, Status } from "brackets-model"
import { useEffect, useState } from "react"
import { TournamentManager } from "../Managers/TournamentManager";
import { TeamManager } from "../Managers/TeamManager";
import { Link } from "wouter";
import { tournamentUrl } from "../Utilities/RouteUtils";

interface MatchPageProps {
  matchId: number,
  tournamentId: string
}

export const MatchPage: React.FC<MatchPageProps> = (props) => {

  const [match, setMatch] = useState<Match>();

  useEffect(() => {
    matchChanged();
  }, [props.matchId, props.tournamentId]);

  useEffect(() => {
    TournamentManager.instance.onmatchupdated.addListener(matchChanged);
    TournamentManager.instance.onmatchstarted.addListener(matchStarted);
    return () => {
      TournamentManager.instance.onmatchupdated.removeListener(matchChanged);
      TournamentManager.instance.onmatchupdated.removeListener(matchChanged);
    }
  },[]);

  async function matchChanged() {
    const updated = await TournamentManager.instance.getMatch(props.tournamentId, props.matchId);

    setMatch(updated);
  }

  function matchStarted(m: Match) {
    if(m.id === props.matchId) {
      console.log(match === m);
      setMatch(m);
    }
  }

  async function startMatch() {
    const match = await TournamentManager.instance.getMatch(props.tournamentId,props.matchId);
    if(match)
    {
      TournamentManager.instance.startMatch(props.tournamentId,match);
    }
  }

  function updateTeamScore(match: Match,team: ParticipantResult, score: number)
  {
    TournamentManager.instance.updateScore(team.id as number,match,score);
  }

  function render() {
    if (match) {
      // Null assertions since it is impossible for there to be a match without a tournament id.
      const teams = TeamManager.instance.getTeams(props.tournamentId)!;
      // Teams are also null asserted since it would be impossible to access a match with 1 or no players.
      const team1 = teams.find(team => team.seedNumber === match.opponent1!.id)!;
      const team2 = teams.find(team => team.seedNumber === match.opponent2!.id)!;
      const title = `${team1.name} vs ${team2.name}`;
      return (
        <>
          <div>
            <h1>{title}</h1>
            <button onClick={startMatch} disabled={match.status > Status.Ready}>Start</button>
            <button disabled={match.status !== Status.Running} onClick={() => {
              updateTeamScore(match,match.opponent1!,(match.opponent1!.score ?? 0) + 1);
            }}>{`Increment ${team1.name}`}</button>
            <button disabled={match.status !== Status.Running} onClick={() => {
              updateTeamScore(match,match.opponent2!,(match.opponent2!.score ?? 0) + 1);
            }}>{`Increment ${team2.name}`}</button>
            <button disabled={match.status !== Status.Running} onClick={() => {
              updateTeamScore(match,match.opponent1!,(match.opponent1!.score ?? 0) - 1);
            }}>{`Decrement ${team1.name}`}</button>
            <button disabled={match.status !== Status.Running} onClick={() => {
              updateTeamScore(match,match.opponent2!,(match.opponent2!.score ?? 0) - 1);
            }}>{`Decrement ${team2.name}`}</button>
            <button disabled={match.status !== Status.Running} onClick={() => {
              TournamentManager.instance.forfeit(match.opponent1!.id as number,match);
            }}>{`Forfeit ${team1.name}`}</button>
            <button disabled={match.status !== Status.Running} onClick={() => {
              TournamentManager.instance.forfeit(match.opponent2!.id as number,match);
            }}>{`Forfeit ${team2.name}`}</button>
            <button disabled={match.status !== Status.Running} onClick={() => {
              TournamentManager.instance.selectWinner(match.opponent1!.id as number,match);
            }}>{`Set Winner to ${team1.name}`}</button>
            <button disabled={match.status !== Status.Running} onClick={() => {
              TournamentManager.instance.selectWinner(match.opponent2!.id as number,match);
            }}>{`Set Winner to ${team2.name}`}</button>
          </div>
          <div>
            <div>
              <div>{team1.name}</div>
              <div>{match.opponent1!.score ?? 0}</div>
            </div>
            <div>
            <div>{team2.name}</div>
              <div>{match.opponent2!.score ?? 0}</div>
            </div>
          </div>
          <Link href={tournamentUrl(props.tournamentId)}>Back to Tournament</Link>
        </>

      )
    } else {
      return (
        <>
          <Link href={tournamentUrl(props.tournamentId)}>Back to Tournament</Link>
          <div>Not ready yet or match doesn't exist..</div>
        </>
      )
    }
  }

  return render();
}