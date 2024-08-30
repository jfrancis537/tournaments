import {
  Box,
  Button, ButtonGroup, Card, CardContent,
  CircularProgress, Container, Divider, Grid, List, ListItem, ListItemDecorator, Typography
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
import { Add, AssignmentInd, EventAvailable, EventBusy } from "@mui/icons-material";
import { Authenticated } from "../Components/Authenticated";
import { TournamentSocketAPI } from "@common/SocketAPIs/TournamentAPI";
import { useSocketState } from "../Managers/SocketManager";

enum TabName {
  Active = 'active',
  Upcoming = 'upcoming',
  Past = 'past'
}

export const HomePage: React.FC = () => {

  const [loadState, setLoadState] = useState(LoadState.LOADING);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [tab, setTab] = useState(TabName.Active);
  const socketState = useSocketState();
  const [, setLocation] = useLocation();

  const { user } = useContext(UserContext);

  useEffect(() => {
    TournamentAPI.getAllTournaments().then((tournaments) => {
      setTournaments(tournaments);
      setLoadState(LoadState.COMPLETE);
    }).catch(() => setLoadState(LoadState.FAILED));
  }, []);

  useEffect(() => {
    if (socketState === 'reconnected') {
      TournamentAPI.getAllTournaments().then((tournaments) => {
        setTournaments(tournaments);
        setLoadState(LoadState.COMPLETE);
      }).catch(() => setLoadState(LoadState.FAILED));
    }
  }, [socketState]);

  useEffect(() => {
    TournamentSocketAPI.ontournamentcreated.addListener(handleTournamentCreated);
    TournamentSocketAPI.ontournamentdeleted.addListener(handleTournamentDeleted);
    TournamentSocketAPI.ontournamentstateupdated.addListener(handleTournamentStateChanged);
    TournamentSocketAPI.ontournamentstarted.addListener(handleTournamentStateChanged);
    return () => {
      TournamentSocketAPI.ontournamentcreated.removeListener(handleTournamentCreated);
      TournamentSocketAPI.ontournamentdeleted.removeListener(handleTournamentDeleted);
      TournamentSocketAPI.ontournamentstateupdated.removeListener(handleTournamentStateChanged);
      TournamentSocketAPI.ontournamentstarted.removeListener(handleTournamentStateChanged);
    }
  }, [tournaments]);



  function handleTournamentCreated(tournament: Tournament) {
    setTournaments([...tournaments, tournament]);
  }

  function handleTournamentDeleted(id: string) {
    setTournaments(tournaments.filter(t => t.id !== id));
  }

  function handleTournamentStateChanged(tournament: Tournament) {
    const index = tournaments.findIndex(t => tournament.id === t.id);
    // Replace in the current list
    tournaments[index] = tournament;
    // Copy to a new list for react.
    setTournaments([...tournaments]);
  }

  function navigateTo(location: string) {
    return (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      setLocation(location);
    }
  }

  function renderTournament(tournament: Tournament) {

    const registrationOpen = Tournament.isRegistrationOpen(tournament);
    const canView = tournament.state >= TournamentState.Finalizing;

    const allowManagement = !!user && user.role === 'admin';

    return (
      <Card key={tournament.id} onClick={() => {
        setLocation(tournamentUrl(tournament.id));
      }}>
        <Typography level="title-lg">{tournament.name}</Typography>
        <Divider />
        <CardContent>
          <List>
            {tournament.state < TournamentState.Active && (
              <ListItem>
                <ListItemDecorator>
                  <AssignmentInd />
                </ListItemDecorator>
                <Typography>
                  {TournamentState.toRegistrationStatusString(tournament!.state, tournament!.registrationOpenDate)}
                </Typography>
              </ListItem>
            )}
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
        {(registrationOpen || allowManagement) && (
          <>
            <Divider />
            <ButtonGroup variant="solid" color="primary" sx={{
              justifyContent: 'flex-end'
            }}>
              {canView &&
                <Button onClick={navigateTo(`${tournamentUrl(tournament.id)}`)}>View</Button>
              }
              {registrationOpen &&
                <Button onClick={navigateTo(`${tournamentUrl(tournament.id)}/register`)}>Register</Button>}
              {allowManagement &&
                <Button onClick={navigateTo(`${tournamentUrl(tournament.id)}/manage`)}>Manage</Button>
              }
            </ButtonGroup>
          </>
        )}
      </Card>
    )
  }

  function renderActive(all: Tournament[]) {
    const tournamentsToRender = all.filter((t) => {
      return t.state === TournamentState.Active
    });
    return (
      <div className={pageStyles["column-content"]}>
        {tournamentsToRender.map(renderTournament)}
      </div>
    );
  }

  function renderUpcoming(all: Tournament[]) {
    const tournamentsToRender = all.filter((t) => {
      return t.state < TournamentState.Active
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

  function renderNoTournaments() {
    return (
      <Container maxWidth="md" className={pageStyles["page-container"]}>
        <Box className={pageStyles["centered-content"]}>
          <Typography level="title-lg">No Tournaments available</Typography>
        </Box>
      </Container>
    );
  }

  function renderForLoadState() {
    let component: JSX.Element;
    switch (loadState) {
      case LoadState.LOADING:
        component = (
          <Container maxWidth="md" className={pageStyles["page-container"]}>
            <Box className={pageStyles["centered-content"]}>
              <CircularProgress size="lg" />
            </Box>
          </Container>
        )
        break;
      case LoadState.FAILED:
        component = <span>Error Loading</span>
        break;
      case LoadState.COMPLETE:
        if (tournaments.length === 0) {
          component = renderNoTournaments()
        } else {
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
        }

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