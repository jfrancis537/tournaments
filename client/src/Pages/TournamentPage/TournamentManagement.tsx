import { Box, Button, Card, CardContent, CircularProgress, Container, Divider, List, ListItem, ListItemDecorator, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { TournamentAPI } from "../../APIs/TournamentAPI";
import { tournamentUrl } from "../../Utilities/RouteUtils";
import { useNavigation } from "../../Hooks/UseNavigation";
import { LoadState } from "../../Utilities/LoadState";
import { Tournament, TournamentState } from "@common/Models/Tournament";
import { NotFound } from "../NotFound";
import { TournamentSocketAPI } from "@common/SocketAPIs/TournamentAPI";
import { DateTime } from "luxon";
import { AssignmentInd, EventBusy, EventAvailable, Person } from "@mui/icons-material";
import { TeamAPI } from "../../APIs/TeamAPI";
import { Team } from "@common/Models/Team";

import pageStyles from './TournamentManagement.module.css';

interface TournamentManagmentProps {
  tournamentId: string;
}

export const TournamentManagment: React.FC<TournamentManagmentProps> = (props) => {

  const navigateToAssigning = useNavigation(`${tournamentUrl(props.tournamentId)}/assigning`);
  const [tournament, setTournament] = useState<Tournament>();
  const [teams, setTeams] = useState<Team[]>();
  const [loadingState, setLoadingState] = useState<LoadState>(LoadState.LOADING);

  useEffect(() => {
    //TODO Add update for teams here.
    TournamentSocketAPI.ontournamentstateupdated.addListener(tournamentStateChanged);
    return () => {
      TournamentSocketAPI.ontournamentstateupdated.removeListener(tournamentStateChanged);
    }
  }, []);

  useEffect(() => {
    tournamentStateChanged();
    TeamAPI.getTeams(props.tournamentId).then(setTeams);
  }, [props.tournamentId]);

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
            onClick={() => TournamentAPI.setTournamentState(tournament!.id, TournamentState.RegistrationClosed)}
          >
            Close Registration
          </Button>
        )
      case TournamentState.RegistrationClosed:
        return (
          <>
            <Button
              disabled={!tournament?.playersSeeded}
              onClick={() => TournamentAPI.startTournament(props.tournamentId)}
            >
              Start
            </Button>
            <Button onClick={navigateToAssigning}>Assign Players</Button>
          </>
        );
      case TournamentState.Running:
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
        return (
          <Container maxWidth='sm'>
            <Card>
              <Typography level="title-lg">{tournament!.name}</Typography>
              <Divider />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemDecorator>
                      <Person color="primary"/>
                    </ListItemDecorator>
                    {renderPlayerCount()}
                  </ListItem>
                  <ListItem>
                    <ListItemDecorator>
                      <AssignmentInd />
                    </ListItemDecorator>
                    <Typography>
                      {TournamentState.toStatusString(tournament!.state, tournament!.registrationOpenDate)}
                    </Typography>
                  </ListItem>
                  <ListItem>
                    <ListItemDecorator>
                      <EventAvailable color='success'/>
                    </ListItemDecorator>
                    <Typography>{tournament!.startDate.toFormat('DD')}</Typography>
                  </ListItem>
                  <ListItem>
                    <ListItemDecorator>
                      <EventBusy htmlColor="#cf4343"/>
                    </ListItemDecorator>
                    <Typography>{tournament!.endDate.toFormat('DD')}</Typography>
                  </ListItem>
                </List>
              </CardContent>
              <Divider />
              <CardContent className={pageStyles["button-container"]}>
                {renderTournamentControls()}
              </CardContent>
            </Card>
          </Container>
        );
    }
  }

  return render();
}
