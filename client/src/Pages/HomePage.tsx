import {
  Box,
  Button, ButtonGroup, Card, CardContent,
  CircularProgress, Container, Grid, Typography
} from "@mui/joy";
import { LoadState } from "../Utilities/LoadState";
import { useContext, useEffect, useState } from "react";
import { Tournament, TournamentState } from "@common/Models/Tournament";
import { TournamentAPI } from "../APIs/TournamentAPI";
import { useLocation } from "wouter";
import { tournamentUrl } from "../Utilities/RouteUtils";

import pageStyles from './HomePage.module.css';
import mobileHelper from '../Styles/mobilehelper.module.css';
import { classes } from "../Styles/StyleHelper";
import { UserContext } from "../Contexts/UserContext";
import { DateTime } from "luxon";
import { Add } from "@mui/icons-material";
import { Authenticated } from "../Components/Authenticated";
import { useNavigation } from "../Hooks/UseNavigation";

enum TabName {
  Active = 'active',
  Upcoming = 'upcoming',
  Past = 'past'
}

export const HomePage: React.FC = () => {

  const [loadState, setLoadState] = useState(LoadState.LOADING);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [tab, setTab] = useState(TabName.Upcoming);
  const [, setLocation] = useLocation();
  const { user } = useContext(UserContext);

  useEffect(() => {
    TournamentAPI.getAllTournaments().then((tournaments) => {
      setTournaments(tournaments);
      setLoadState(LoadState.COMPLETE);
    }).catch(() => setLoadState(LoadState.FAILED));
  }, []);

  function navigateTo(location: string) {
    return (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      setLocation(location);
    }
  }

  function renderTournament(tournament: Tournament) {

    let registrationOpen = (tournament.registrationOpenDate ?
      tournament.registrationOpenDate <= DateTime.now() :
      tournament.state === TournamentState.RegistrationOpen) &&
      tournament.state <= TournamentState.RegistrationOpen;

    const allowManagement = !!user && user.role === 'admin';

    return (
      <Card key={tournament.id} onClick={() => {
        setLocation(tournamentUrl(tournament.id));
      }}>
        <CardContent>
          <Typography level="title-lg">{tournament.name}</Typography>
          <Typography level="body-sm">{tournament.startDate.toFormat('DDD')}</Typography>
          {(registrationOpen || allowManagement) && (
            <ButtonGroup variant="solid" color="primary" sx={{
              justifyContent: 'flex-end'
            }}>
              {registrationOpen &&
                <Button>Register</Button>}
              {allowManagement &&
                <Button onClick={navigateTo(`${tournamentUrl(tournament.id)}/manage`)}>Manage</Button>
              }
            </ButtonGroup>
          )}
        </CardContent>
      </Card>
    )
  }

  function renderActive(all: Tournament[]) {
    const tournamentsToRender = all.filter((t) => {
      return t.state === TournamentState.Running
    });
    return (
      <div className={pageStyles["column-content"]}>
        {tournamentsToRender.map(renderTournament)}
      </div>
    );
  }

  function renderUpcoming(all: Tournament[]) {
    const tournamentsToRender = all.filter((t) => {
      return t.state < TournamentState.Running
    });
    return (
      <div className={pageStyles["column-content"]}>
        {tournamentsToRender.map(renderTournament)}
      </div>
    );
  }

  function renderPast(all: Tournament[]) {
    const tournamentsToRender = all.filter((t) => {
      return t.state === TournamentState.Complete
    });
    return (
      <div className={pageStyles["column-content"]}>
        {tournamentsToRender.map(renderTournament)}
      </div>
    );
  }

  function getClassesForColumn(isActiveTab: boolean) {
    const classList = [pageStyles.column];
    if (!isActiveTab) {
      classList.push(mobileHelper["desktop-only"]);
    }
    return classes(classList);
  }

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
          <>
            <Container disableGutters className={pageStyles["content-container"]}>
              <Grid
                container
                columnSpacing={2}
                columnGap={2}
                columns={{ xs: 3 }}
                className={pageStyles["tournament-grid"]}>
                <div className={getClassesForColumn(tab === TabName.Active)}>
                  <Typography
                    className={mobileHelper["desktop-only"]}
                    level="title-lg">
                    Active
                  </Typography>
                  {renderActive(tournaments)}
                </div>
                <div className={getClassesForColumn(tab === TabName.Upcoming)}>
                  <Typography
                    className={mobileHelper["desktop-only"]}
                    level="title-lg">
                    Upcoming
                  </Typography>
                  {renderUpcoming(tournaments)}
                </div>
                <div className={getClassesForColumn(tab === TabName.Past)}>
                  <Typography
                    className={mobileHelper["desktop-only"]}
                    level="title-lg">
                    Past
                  </Typography>
                  {renderPast(tournaments)}
                </div>
              </Grid>
              <Grid
                container
                columnSpacing={2}
                columnGap={2}
                columns={{ xs: 3 }}
                className={mobileHelper["mobile-only"]}
              >
                <ButtonGroup
                  variant="soft"
                  aria-label="Tournament Type tabs"
                  buttonFlex="1"
                  className={pageStyles.tabs}
                >
                  <Button
                    variant={tab === TabName.Active ? "solid" : undefined}
                    onClick={() => setTab(TabName.Active)}>
                    Active
                  </Button>
                  <Button
                    variant={tab === TabName.Upcoming ? "solid" : undefined}
                    onClick={() => setTab(TabName.Upcoming)}>
                    Upcoming
                  </Button>
                  <Button
                    variant={tab === TabName.Past ? "solid" : undefined}
                    onClick={() => setTab(TabName.Past)}>
                    Past
                  </Button>
                </ButtonGroup>
              </Grid>
            </Container>
          </>
        );
        break;
    }
    return component;
  }


  function render(): JSX.Element {
    return (
      <>
        <Authenticated roles={['admin']}>
          <Box className={pageStyles["admin-controls"]}>
            <Button
              color="primary"
              variant="outlined"
              startDecorator={<Add />}
              onClick={() => setLocation(tournamentUrl('new'))}
            >
              New Tournament
            </Button>
          </Box>
        </Authenticated>
        <Container disableGutters className={pageStyles["page-container"]}>
          {renderForLoadState()}
        </Container>
      </>

    );
  }

  return render();
}