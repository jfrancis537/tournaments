import {
  Box,
  Button, Card, CardContent,
  CircularProgress, Container, Divider,
  IconButton,
  List, ListItem, ListItemDecorator, Typography
} from "@mui/joy";
import { useEffect, useState } from "react";
import { TournamentAPI } from "../../APIs/TournamentAPI";
import { tournamentUrl } from "../../Utilities/RouteUtils";
import { useNavigation } from "../../Hooks/UseNavigation";
import { LoadState } from "../../Utilities/LoadState";
import { Tournament, TournamentState } from "@common/Models/Tournament";
import { NotFound } from "../NotFound";
import { TournamentSocketAPI } from "@common/SocketAPIs/TournamentAPI";
import { DateTime } from "luxon";
import { AssignmentInd, EventBusy, EventAvailable, Person, DeleteForeverOutlined } from "@mui/icons-material";
import { TeamAPI } from "../../APIs/TeamAPI";
import { Team } from "@common/Models/Team";

import pageStyles from './TournamentManagement.module.css';
import { useLocation } from "wouter";
import { TeamSocketAPI } from "@common/SocketAPIs/TeamAPI";
import { useSocketState } from "../../Managers/SocketManager";

interface TournamentManagmentProps {
  tournamentId: string;
}

export const TournamentManagment: React.FC<TournamentManagmentProps> = (props) => {

  const navigateToAssigning = useNavigation(`${tournamentUrl(props.tournamentId)}/assigning`);
  const navigateToTournament = useNavigation(`${tournamentUrl(props.tournamentId)}`);
  const [tournament, setTournament] = useState<Tournament>();
  const [teams, setTeams] = useState<Team[]>();
  const [loadingState, setLoadingState] = useState<LoadState>(LoadState.LOADING);
  const [, setLocation] = useLocation();
  const socketState = useSocketState();

  useEffect(() => {
    if (socketState === 'reconnected') {
      initalize();
    }
  }, [socketState]);

  useEffect(() => {
    TeamSocketAPI.onteamcreated.addListener(handleTeamCreated);
    return () => {
      TeamSocketAPI.onteamcreated.removeListener(handleTeamCreated);
    }
  }, [teams]);

  useEffect(() => {
    TournamentSocketAPI.ontournamentstateupdated.addListener(tournamentStateChanged);
    TournamentSocketAPI.ontournamentstarted.addListener(tournamentStateChanged);
    TournamentSocketAPI.ontournamentdeleted.addListener(handleTournamentDeleted);

    return () => {
      TournamentSocketAPI.ontournamentstateupdated.removeListener(tournamentStateChanged);
      TournamentSocketAPI.ontournamentstarted.removeListener(tournamentStateChanged);
      TournamentSocketAPI.ontournamentdeleted.removeListener(handleTournamentDeleted);
    }
  }, []);

  useEffect(initalize, [props.tournamentId]);


  function initalize() {
    tournamentStateChanged();
    TeamAPI.getTeams(props.tournamentId).then(setTeams).catch(() => setTeams([]));
  }


  function handleTeamCreated(team: Team) {
    if (team.tournamentId === props.tournamentId) {
      if (teams) {
        setTeams([...teams, team]);
      } else {
        setTeams([team]);
      }
    }
  }

  function handleTournamentDeleted(id: string) {
    if (props.tournamentId === id) {
      setLocation('/');
    }
  }

  async function tournamentStateChanged(t?: Tournament) {
    if (!t) {
      try {
        t = await TournamentAPI.getTournament(props.tournamentId);
      } catch {
        setLoadingState(LoadState.FAILED);
        return;
      }
    }
    setLoadingState(LoadState.COMPLETE);
    setTournament(t);
  }

  function renderTournamentControls() {
    switch (tournament!.state) {
      //@ts-ignore allow fallthrough
      case TournamentState.New:
        // If the registration open date passed, treat like registration opened instead of new.
        if (!tournament!.registrationOpenDate || tournament!.registrationOpenDate >= DateTime.now()) {
          return (
            <Button
              onClick={() => TournamentAPI.setTournamentState(tournament!.id, TournamentState.RegistrationOpen)}
            >
              Open Registration
            </Button>
          )
        }
      case TournamentState.RegistrationOpen:
        return (
          <Button
            onClick={() => TournamentAPI.setTournamentState(tournament!.id, TournamentState.Seeding)}
          >
            Close Registration
          </Button>
        )
      case TournamentState.Seeding:
        return (
          <>
            <Button
              disabled={!tournament?.playersSeeded}
              onClick={() => TournamentAPI.setTournamentState(props.tournamentId, TournamentState.Finalizing)}
            >
              Lock
            </Button>
            <Button onClick={navigateToAssigning}>Assign Players</Button>
          </>
        );
      case TournamentState.Finalizing:
        return (
          <>
          <Button
            onClick={() => TournamentAPI.startTournament(props.tournamentId)}
          >
            Start
          </Button>
          <Button onClick={navigateToTournament}>Set Match Details</Button>
        </>
        )
      case TournamentState.Active:
      // TODO have controls for when the tournament is running
      case TournamentState.Complete:
        return null;
    }
  }

  function renderPlayerCount() {
    if (teams !== undefined) {
      return (
        <Typography>{teams.length}</Typography>
      )
    } else {
      return (
        <CircularProgress size="sm" />
      )
    }
  }

  async function deleteTournament() {
    await TournamentAPI.deleteTournament(props.tournamentId);
  }

  function render() {
    switch (loadingState) {
      case LoadState.LOADING:
        return (
          <div>Getting Ready...</div>
        );
      case LoadState.FAILED:
        return (
          <NotFound />
        );
      case LoadState.COMPLETE:

        const controls = renderTournamentControls();

        return (
          <Container maxWidth='sm'>
            <Card>
              <Box className={pageStyles["title-container"]}>
                <Typography level="title-lg">{tournament!.name}</Typography>
                <IconButton onClick={deleteTournament}>
                  <DeleteForeverOutlined htmlColor="#cf4343" />
                </IconButton>
              </Box>
              <Divider />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemDecorator>
                      <Person color="primary" />
                    </ListItemDecorator>
                    {renderPlayerCount()}
                  </ListItem>
                  <ListItem>
                    <ListItemDecorator>
                      <AssignmentInd />
                    </ListItemDecorator>
                    <Typography>
                      {TournamentState.toRegistrationStatusString(tournament!.state, tournament!.registrationOpenDate)}
                    </Typography>
                  </ListItem>
                  <ListItem>
                    <ListItemDecorator>
                      <EventAvailable color='success' />
                    </ListItemDecorator>
                    <Typography>{tournament!.startDate.toFormat('DD')}</Typography>
                  </ListItem>
                  <ListItem>
                    <ListItemDecorator>
                      <EventBusy htmlColor="#cf4343" />
                    </ListItemDecorator>
                    <Typography>{tournament!.endDate.toFormat('DD')}</Typography>
                  </ListItem>
                </List>
              </CardContent>
              {!!controls && (
                <>
                  <Divider />
                  <CardContent className={pageStyles["button-container"]}>
                    {controls}
                  </CardContent>
                </>
              )}
            </Card>
          </Container>
        );
    }
  }

  return render();
}
