import { Tournament, TournamentState } from "@common/Models/Tournament";
import { TournamentSocketAPI } from "@common/SocketAPIs/TournamentAPI";
import { AssignmentInd, DeleteForeverOutlined, EventAvailable, EventBusy, Person } from "@mui/icons-material";
import {
  Box,
  Button, Card, CardContent,
  CircularProgress, Container, Divider,
  IconButton,
  List, ListItem, ListItemDecorator, Typography
} from "@mui/joy";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { TeamAPI } from "../../APIs/TeamAPI";
import { TournamentAPI } from "../../APIs/TournamentAPI";
import { useNavigation } from "../../Hooks/UseNavigation";
import { LoadState } from "../../Utilities/LoadState";
import { tournamentUrl } from "../../Utilities/RouteUtils";
import { NotFound } from "../NotFound";

import { RegistrationData } from "@common/Models/RegistrationData";
import { TeamSocketAPI } from "@common/SocketAPIs/TeamAPI";
import { useLocation } from "wouter";
import { useSocketState } from "../../Managers/SocketManager";
import pageStyles from './TournamentManagement.module.css';

interface TournamentManagmentProps {
  tournamentId: string;
}

export const TournamentManagment: React.FC<TournamentManagmentProps> = (props) => {

  const navigateToAssigning = useNavigation(`${tournamentUrl(props.tournamentId)}/assigning`);
  const navigateToReview = useNavigation(`${tournamentUrl(props.tournamentId)}/review-seeding`);
  const navigateToTournament = useNavigation(`${tournamentUrl(props.tournamentId)}`);
  const gotoRegistrationApproval = useNavigation(`${tournamentUrl(props.tournamentId)}/registration-approval`);
  const gotoRegistrationViewer = useNavigation(`${tournamentUrl(props.tournamentId)}/registrations`);
  const gotoTeamAssignment = useNavigation(`${tournamentUrl(props.tournamentId)}/team-assignment`);
  const [tournament, setTournament] = useState<Tournament>();
  const [registrations, setRegistrations] = useState<RegistrationData[]>();
  const [loadingState, setLoadingState] = useState<LoadState>(LoadState.LOADING);
  const [, setLocation] = useLocation();
  const socketState = useSocketState();

  useEffect(() => {
    if (socketState === 'reconnected') {
      initalize();
    }
  }, [socketState]);

  useEffect(() => {
    TeamSocketAPI.onregistrationcreated.addListener(handleNewRegistration);
    return () => {
      TeamSocketAPI.onregistrationcreated.removeListener(handleNewRegistration);
    }
  }, [registrations]);

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
    TeamAPI.getRegistrations(props.tournamentId).then(setRegistrations).catch(() => setRegistrations([]));
  }


  function handleNewRegistration(regData: RegistrationData) {
    if (regData.tournamentId === props.tournamentId) {
      if (registrations) {
        setRegistrations([...registrations, regData]);
      } else {
        setRegistrations([regData]);
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
        break;
      case TournamentState.RegistrationOpen:
        return (
          <Button
            onClick={() => TournamentAPI.setTournamentState(tournament!.id, TournamentState.RegistrationConfirmation)}
          >
            Close Registration
          </Button>
        )
      case TournamentState.RegistrationConfirmation:
        return (
          <>
            <Button
              onClick={() => TournamentAPI.setTournamentState(props.tournamentId, TournamentState.Seeding)}
            >
              Confirm Registrations
            </Button>
            <Button onClick={gotoRegistrationApproval}>Approve Registrations</Button>
            {tournament!.teamSize > 1 && <Button onClick={gotoTeamAssignment}>Assign Teams</Button>}
          </>
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
            <Button disabled={!tournament?.playersSeeded} onClick={navigateToReview}>Review</Button>
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
      case TournamentState.Complete:
        // TODO have controls for when the tournament is running
        return null;
    }
  }

  function renderPlayerCount() {
    if (registrations !== undefined) {
      return (
        <Typography>{registrations.length}</Typography>
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
        {

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
                    <ListItem onClick={gotoRegistrationViewer} className={pageStyles['registration-counter']}>
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
  }

  return render();
}
