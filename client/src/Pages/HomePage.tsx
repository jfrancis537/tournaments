import { Card, CardContent, CardOverflow, CircularProgress, Container, Divider, Sheet } from "@mui/joy";
import { LoadState } from "../Utilities/LoadState";
import { useEffect, useState } from "react";
import { Tournament, TournamentState } from "@common/Models/Tournament";
import { TournamentAPI } from "../APIs/TournamentAPI";
import { useLocation } from "wouter";
import { tournamentUrl } from "../Utilities/RouteUtils";

export const HomePage: React.FC = () => {

  const [loadState, setLoadState] = useState(LoadState.LOADING);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [, setLocation] = useLocation();

  useEffect(() => {
    TournamentAPI.getAllTournaments().then((tournaments) => {
      setTournaments(tournaments);
      setLoadState(LoadState.COMPLETE);
    }).catch(() => setLoadState(LoadState.FAILED));
  }, []);

  function renderTournament(tournament: Tournament) {
    return (
      <Card key={tournament.id} onClick={() => {
        setLocation(tournamentUrl(tournament.id));
      }}>
        <CardOverflow>
          <h3>{tournament.name}</h3>
          <Divider />
          <CardContent>
            {tournament.startDate.toFormat('DDD')}
          </CardContent>
        </CardOverflow>
      </Card>
    )
  }

  function renderActive(all: Tournament[]) {
    const activeTournaments = all.filter((t) => {
      return t.state === TournamentState.Running
    });
    return activeTournaments.map(renderTournament);
  }

  function renderUpcoming(all: Tournament[]) {
    const activeTournaments = all.filter((t) => {
      return t.state < TournamentState.Running
    });
    return activeTournaments.map(renderTournament);
  }

  function renderPast(all: Tournament[]) {
    const activeTournaments = all.filter((t) => {
      return t.state === TournamentState.Complete
    });
    return activeTournaments.map(renderTournament);
  }


  // TODO: Render each group of tournaments as cards in a grid. They can probably be accordion elements.
  function renderForLoadState() {
    let component: JSX.Element;
    switch (loadState) {
      case LoadState.LOADING:
        component = <CircularProgress />
        break;
      case LoadState.FAILED:
        component = <span>Error Loading</span>
        // TODO ERROR
        break;
      case LoadState.COMPLETE:
        component = (
          <Sheet>
            <h3>Active</h3>
            {renderActive(tournaments)}
            <h3>Upcoming</h3>
            {renderUpcoming(tournaments)}
            <h3>Past</h3>
            {renderPast(tournaments)}
          </Sheet>
        );
        break;
    }
    return component;
  }


  function render(): JSX.Element {
    return (
      <Container>
        {renderForLoadState()}
      </Container>
    );
  }

  return render();
}