import { Database as BracketsDatabase } from "brackets-manager";
import { Button, Container, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { TournamentAPI } from "../../APIs/TournamentAPI";
import { tournamentUrl } from "../../Utilities/RouteUtils";
import { useNavigation } from "../../Hooks/UseNavigation";
import { LoadState } from "../../Utilities/LoadState";
import { Tournament, TournamentState } from "@common/Models/Tournament";
import { NotFound } from "../NotFound";
import { TournamentSocketAPI } from "@common/SocketAPIs/TournamentAPI";
import { DateTime } from "luxon";

interface TournamentManagmentProps {
  tournamentId: string;
}

export const TournamentManagment: React.FC<TournamentManagmentProps> = (props) => {

  const navigateToAssigning = useNavigation(`${tournamentUrl(props.tournamentId)}/assigning`);
  const [tournament, setTournament] = useState<Tournament>();
  const [loadingState, setLoadingState] = useState<LoadState>(LoadState.LOADING);

  useEffect(() => {
    TournamentSocketAPI.ontournamentstateupdated.addListener(tournamentStateChanged);
    return () => {
      TournamentSocketAPI.ontournamentstateupdated.removeListener(tournamentStateChanged);
    }
  }, []);

  useEffect(() => {
    tournamentStateChanged();
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
          <Container disableGutters maxWidth='sm'>
            <Typography level="title-lg">Tournament Settings</Typography>
            <Typography level="body-md">{tournament!.name}</Typography>
            {renderTournamentControls()}
          </Container>
        );
    }
  }

  return render();
}
