import { Match, Status } from "brackets-model"
import { useEffect, useState } from "react"
import { Link } from "wouter";
import { tournamentUrl } from "../../Utilities/RouteUtils";
import { TournamentSocketAPI } from "@common/SocketAPIs/TournamentAPI";
import { TeamAPI } from "../../APIs/TeamAPI";
import { Team } from "@common/Models/Team";
import { MatchAPI } from "../../APIs/MatchAPI";
import { Box, Button, ButtonGroup, Divider } from "@mui/joy";

import pageStyles from './MatchPage.module.css';
import { TeamSection } from "./TeamSection";
import { Authenticated } from "../../Components/Authenticated";
import { useNavigation } from "../../Hooks/UseNavigation";
import { MatchMetadataModal } from "./MatchMetadataDialog";
import { MatchMetadata } from "@common/Models/MatchMetadata";

interface MatchPageProps {
  matchId: number,
  tournamentId: string
}

export const MatchPage: React.FC<MatchPageProps> = (props) => {

  const [match, setMatch] = useState<Match>();
  const [teams, setTeams] = useState<Team[]>();
  const [editing, setEditing] = useState(false);
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

  function editMatch() {
    setEditing(true);
  }

  async function onMetadataChanged(metadata: MatchMetadata) {
    await MatchAPI.addMatchMetadata(metadata);
  }

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
                <ButtonGroup buttonFlex='0 1 30%' className={pageStyles['start-edit-button-container']} >
                  {match.status === Status.Ready &&
                    <Button onClick={startMatch}>Start</Button>}
                  <Button onClick={editMatch}>Edit</Button>
                </ButtonGroup>
              </Authenticated>
            </Box>
            <Box className={pageStyles["score-sections"]}>
              <TeamSection match={match} tournamentId={props.tournamentId} team={team1} />
              <Divider orientation="vertical" sx={{marginTop: '4%'}}/>
              <Divider />
              <TeamSection match={match} tournamentId={props.tournamentId} team={team2} />
            </Box>
          </Box>
          <Authenticated roles={['admin']}>
            <MatchMetadataModal
              tournamentId={props.tournamentId}
              match={match}
              open={editing}
              onAccept={onMetadataChanged}
              onCancel={() => {}}
              onClose={() => setEditing(false)} />
          </Authenticated>
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