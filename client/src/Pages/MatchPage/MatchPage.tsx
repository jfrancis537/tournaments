import { Match, Status } from "brackets-model"
import { useEffect, useState } from "react"
import { Link } from "wouter";
import { tournamentUrl } from "../../Utilities/RouteUtils";
import { TournamentSocketAPI } from "@common/SocketAPIs/TournamentAPI";
import { TeamAPI } from "../../APIs/TeamAPI";
import { Team } from "@common/Models/Team";
import { MatchAPI } from "../../APIs/MatchAPI";
import { Box, Button, Container, Divider, Grid } from "@mui/joy";

import pageStyles from './MatchPage.module.css';
import { TeamSection } from "./TeamSection";
import { Authenticated } from "../../Components/Authenticated";
import { ScoreControls } from "./ScoreControls";
import { useNavigation } from "../../Hooks/UseNavigation";

interface MatchPageProps {
  matchId: number,
  tournamentId: string
}

export const MatchPage: React.FC<MatchPageProps> = (props) => {

  const [match, setMatch] = useState<Match>();
  const [teams, setTeams] = useState<Team[]>();
  const backToTournament = useNavigation(tournamentUrl(props.tournamentId));

  useEffect(() => {
    matchChanged();
  }, [props.matchId]);

  useEffect(() => {
    matchChanged();
    TeamAPI.getTeams(props.tournamentId).then(setTeams);
  }, [props.tournamentId]);

  useEffect(() => {
    TournamentSocketAPI.onmatchupdated.addListener(matchChanged);
    TournamentSocketAPI.onmatchstarted.addListener(matchStarted);
    return () => {
      TournamentSocketAPI.onmatchupdated.removeListener(matchChanged);
      TournamentSocketAPI.onmatchupdated.removeListener(matchChanged);
    }
  }, []);

  async function matchChanged() {
    const updated = await MatchAPI.getMatch(props.tournamentId, props.matchId);

    setMatch(updated);
  }

  function matchStarted(m: Match) {
    if (m.id === props.matchId) {
      setMatch(m);
    }
  }

  async function startMatch() {
    const match = await MatchAPI.getMatch(props.tournamentId, props.matchId);
    if (match) {
      await MatchAPI.updateState(props.tournamentId, match, Status.Running);
    }
  }

  async function forfeit(participantId: number, match: Match) {
    await MatchAPI.forfeit(props.tournamentId, match, participantId);
  }

  async function selectWinner(participantId: number, match: Match) {
    await MatchAPI.selectWinner(props.tournamentId, match, participantId);
  }

  // function render_old() {
  //   if (match && teams) {
  //     // Teams are also null asserted since it would be impossible to access a match with 1 or no players.
  //     const team1 = teams.find(team => team.seedNumber === match.opponent1!.id)!;
  //     const team2 = teams.find(team => team.seedNumber === match.opponent2!.id)!;
  //     const title = `${team1.name} vs ${team2.name}`;
  //     return (
  //       <>
  //         <div>
  //           <h1>{title}</h1>
  //           <button onClick={startMatch} disabled={match.status > Status.Ready}>Start</button>
  //           <button disabled={match.status !== Status.Running} onClick={() => {
  //             MatchAPI.updateScore(props.tournamentId, match, match.opponent1!, (match.opponent1!.score ?? 0) + 1);
  //           }}>{`Increment ${team1.name}`}</button>
  //           <button disabled={match.status !== Status.Running} onClick={() => {
  //             MatchAPI.updateScore(props.tournamentId, match, match.opponent2!, (match.opponent2!.score ?? 0) + 1);
  //           }}>{`Increment ${team2.name}`}</button>
  //           <button disabled={match.status !== Status.Running} onClick={() => {
  //             MatchAPI.updateScore(props.tournamentId, match, match.opponent1!, (match.opponent1!.score ?? 0) - 1);
  //           }}>{`Decrement ${team1.name}`}</button>
  //           <button disabled={match.status !== Status.Running} onClick={() => {
  //             MatchAPI.updateScore(props.tournamentId, match, match.opponent2!, (match.opponent2!.score ?? 0) - 1);
  //           }}>{`Decrement ${team2.name}`}</button>
  //           <button disabled={match.status !== Status.Running} onClick={() => {
  //             forfeit(match.opponent1!.id as number, match);
  //           }}>{`Forfeit ${team1.name}`}</button>
  //           <button disabled={match.status !== Status.Running} onClick={() => {
  //             forfeit(match.opponent2!.id as number, match);
  //           }}>{`Forfeit ${team2.name}`}</button>
  //           <button disabled={match.status !== Status.Running} onClick={() => {
  //             selectWinner(match.opponent1!.id as number, match);
  //           }}>{`Set Winner to ${team1.name}`}</button>
  //           <button disabled={match.status !== Status.Running} onClick={() => {
  //             selectWinner(match.opponent2!.id as number, match);
  //           }}>{`Set Winner to ${team2.name}`}</button>
  //         </div>
  //         <div>
  //           <div>
  //             <div>{team1.name}</div>
  //             <div>{match.opponent1!.score ?? 0}</div>
  //           </div>
  //           <div>
  //             <div>{team2.name}</div>
  //             <div>{match.opponent2!.score ?? 0}</div>
  //           </div>
  //         </div>
  //         <Link href={tournamentUrl(props.tournamentId)}>Back to Tournament</Link>
  //       </>

  //     )
  //   } else {
  //     return (
  //       <>
  //         <Link href={tournamentUrl(props.tournamentId)}>Back to Tournament</Link>
  //         <div>Not ready yet or match doesn't exist..</div>
  //       </>
  //     )
  //   }
  // }

  function render() {
    if (match && teams) {
      const team1 = teams.find(team => team.seedNumber === match.opponent1!.id)!;
      const team2 = teams.find(team => team.seedNumber === match.opponent2!.id)!;
      return (
        <>

          <Box className={pageStyles["page-box"]}>
            <Box className={pageStyles["button-container"]}>
              <Button className={pageStyles["back-button"]} onClick={backToTournament}>Back</Button>
              <Authenticated roles={['admin']}>
                {match.status === Status.Ready &&
                  <Button className={pageStyles["start-button"]} onClick={startMatch}>Start</Button>}
              </Authenticated>
            </Box>
            <Box className={pageStyles["score-sections"]}>
              <TeamSection match={match} tournamentId={props.tournamentId} team={team1} />
              <Divider orientation="vertical" />
              <Divider />
              <TeamSection match={match} tournamentId={props.tournamentId} team={team2} />
            </Box>
          </Box>
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