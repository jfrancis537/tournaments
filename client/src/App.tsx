import { Route, Switch } from 'wouter';
import { TournamentViewer } from './Pages/TournamentPage/TournamentViewer';
import { MatchPage } from './Pages/MatchPage/MatchPage';
import { NotFound } from './Pages/NotFound';
import { NEW_TOURNAMENT_ID } from './Utilities/RouteUtils';
import { TournamentCreator } from './Pages/TournamentPage/TournamentCreator';
import { AccountRegistration } from './Pages/AccountRegistration';
import { Login } from './Pages/Login';
import { HomePage } from './Pages/HomePage';
import React, { useEffect, useState } from 'react';
import { UserContext } from './Contexts/UserContext';
import { User } from '@common/Models/User';
import { AuthAPI } from './APIs/AuthAPI';
import { NavBar } from './Components/NavBar';
import { SeedAssignmentTool } from './Pages/TournamentPage/SeedAssignmentTool';
import { AuthenticatedRoute } from './Components/AuthenticatedRoute';
import { TournamentManagment } from './Pages/TournamentPage/TournamentManagement';
import { Snackbar, Typography, useColorScheme } from '@mui/joy';
import { ConfirmRegistration } from './Pages/ConfirmRegistration';
import { useSocketState } from './Managers/SocketManager';
import { TournamentRegistration } from './Pages/TournamentPage/TournamentRegistration';

export const App: React.FC = () => {

  const [user, setUser] = useState<User>();
  const [connectionMessageOpen, setConnectionMessageOpen] = useState(false);

  const { setMode } = useColorScheme();
  const socketState = useSocketState();

  useEffect(() => {
    if (socketState !== 'initial') {
      setConnectionMessageOpen(true);
    }
  }, [socketState]);

  useEffect(() => {
    AuthAPI.getCurrentUser().then(setUser);
    setMode('light');
  }, []);

  function closeConnectionMessage() {
    setConnectionMessageOpen(false);
  }

  function renderConnectionNotification() {

    const color = socketState === 'reconnected' ? 'success' : 'danger';
    const message = socketState === 'reconnected' ? 'Successfully reconnected.' : 'Connection lost, functionality may be limited.';

    return (
      <Snackbar
        variant='soft'
        open={connectionMessageOpen}
        color={color}
        onClose={closeConnectionMessage}
        autoHideDuration={2000}
      >
        <Typography color={color}>{message}</Typography>
      </Snackbar>
    );
  }

  function render() {
    return (
      <UserContext.Provider value={{ user, setUser }}>
        <NavBar />
        <Switch>
          <Route path='/'>
            <HomePage />
          </Route>
          <Route path='/account/register'>
            <AccountRegistration />
          </Route>
          <Route path='/account/confirm/:token'>
            {(params) => (
              <ConfirmRegistration token={params.token} />
            )}
          </Route>
          <Route path='/account/login'>
            <Login />
          </Route>
          <Route path='/tournament/:id'>
            {(params) => {
              if (params.id === NEW_TOURNAMENT_ID) {
                return (
                  <TournamentCreator />
                )
              }
              return <TournamentViewer tournamentId={params.id} />
            }}
          </Route>
          <Route path='/tournament/:id/register'>
            {(params) => {
              if (params.id === NEW_TOURNAMENT_ID) {
                return (
                  <NotFound />
                )
              }
              return <TournamentRegistration tournamentId={params.id} />
            }}
          </Route>
          <AuthenticatedRoute roles={['admin']} path='/tournament/:id/manage'>
            {(params) => {
              if (params.id === NEW_TOURNAMENT_ID) {
                return (
                  <NotFound />
                )
              }
              return <TournamentManagment tournamentId={params.id} />
            }}
          </AuthenticatedRoute>
          <AuthenticatedRoute roles={['admin']} path='/tournament/:id/assigning'>
            {(params) => {
              if (params.id === NEW_TOURNAMENT_ID) {
                return (
                  <NotFound />
                )
              }
              return <SeedAssignmentTool tournamentId={params.id} />
            }}
          </AuthenticatedRoute>
          <Route path='/tournament/:tournamentId/match/:matchId'>
            {(params) => {
              const matchIdNumber = Number(params.matchId);
              if (isNaN(matchIdNumber)) {
                return <NotFound />
              }
              return <MatchPage tournamentId={params.tournamentId} matchId={matchIdNumber} />
            }}
          </Route>
          <Route>
            <NotFound />
          </Route>
        </Switch>
        {renderConnectionNotification()}
      </UserContext.Provider>
    );
  }

  return render();
}