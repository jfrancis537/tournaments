import { User } from '@common/Models/User';
import { Snackbar, Typography, useColorScheme } from '@mui/joy';
import React, { useEffect, useState } from 'react';
import { Route, Switch } from 'wouter';
import { AuthAPI } from './APIs/AuthAPI';
import { NavBar } from './Components/NavBar';
import { UserContext } from './Contexts/UserContext';
import { useSocketState } from './Managers/SocketManager';
import { HomePage } from './Pages/HomePage';
import { NewsPage } from './Pages/NewsPage';
import { NotFound } from './Pages/NotFound';
import { TournamentPickerPage } from './Pages/TournamentPickerPage';
import { TournamentRoutes } from './RouteGroups/TournamentRoutes';


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
  }, [setMode]);

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
          <Route path='/tournaments/all'>
            <TournamentPickerPage />
          </Route>
          {TournamentRoutes}
          <Route path={'/news'}>
            <NewsPage />
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