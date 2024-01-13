import { Route, Switch, useLocation } from 'wouter';
import { TournamentViewer } from './Pages/TournamentPage/TournamentViewer';
import { MatchPage } from './Pages/MatchPage';
import { NotFound } from './Pages/NotFound';
import { NEW_TOURNAMENT_ID } from './Utilities/RouteUtils';
import { TournamentCreator } from './Pages/TournamentPage/TournamentCreator';
import { AccountRegistration } from './Pages/AccountRegistration';
import { Login } from './Pages/Login';
import { HomePage } from './Pages/HomePage';
import { TournamentAPI } from './APIs/TournamentAPI';
import { DateTime } from 'luxon';
import { Tournament } from '@common/Models/Tournament';
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from './Contexts/UserContext';
import { User } from '@common/Models/User';
import { AuthAPI } from './APIs/AuthAPI';
import { NavBar } from './Components/NavBar';
import { SeedAssignmentTool } from './Pages/TournamentPage/SeedAssignmentTool';
import { AuthenticatedRoute } from './Components/AuthenticatedRoute';
import { TournamentManagment } from './Pages/TournamentPage/TournamentManagement';


const DemoComponent: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user } = useContext(UserContext);
  return (
    <>
      <button onClick={async () => {
        const promises: Promise<Tournament>[] = [];
        for (let i = 0; i < 5; i++) {
          promises.push(
            TournamentAPI.createNewTournament({
              name: `Sample Tournament ${i}`,
              startDate: DateTime.now(),
              endDate: DateTime.now().plus({ days: i + 1 }),
              registrationOpenDate: DateTime.now().minus({ hour: 1 }),
              stages: [
                'double_elimination'
              ],
              stageSettings: [
                { seedOrdering: ['natural'], grandFinal: 'double' },
              ],
              playersSeeded: false
            }));
        }
        await Promise.all(promises);
        setLocation('/');
      }}>Generate Tournaments</button>
    </>
  )
}

export const App: React.FC = () => {

  const [user, setUser] = useState<User>();

  useEffect(() => {
    AuthAPI.getCurrentUser().then(setUser);
  }, [])

  function render() {
    return (
      <UserContext.Provider value={{ user, setUser }}>
        <NavBar />
        <Switch>
          <Route path='/'>
            <HomePage />
          </Route>
          <Route path='/demo'>
            <DemoComponent />
          </Route>
          <Route path='/account/register'>
            <AccountRegistration />
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
      </UserContext.Provider>
    );
  }

  return render();
}