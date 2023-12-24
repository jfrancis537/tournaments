import { useEffect, useState } from 'react';
import { Route, useLocation } from 'wouter';
import { TournamentPage } from './Pages/TournamentPage';
import { Demo } from '../../server/src/TournamentDemo';
import { MatchPage } from './Pages/MatchPage';
import { NotFound } from './Pages/NotFound';
import { NEW_TOURNAMENT_ID, tournamentUrl } from './Utilities/RouteUtils';
import { TournamentCreatorPage } from './Pages/TournamentCreatorPage';
import { Tournament } from '@common/Models/Tournament';
import { AuthAPI } from './APIs/AuthAPI';
import { AccountRegistration } from './Pages/AccountRegistration';
import { Login } from './Pages/Login';
import { Container } from '@mui/joy';

const DemoComponent: React.FC<{ t?: Tournament }> = (props) => {

  const [, setLocation] = useLocation();

  return (
    <>
      <button onClick={async () => {
        setLocation(tournamentUrl(NEW_TOURNAMENT_ID));
      }}>Create Tournament</button>
      {props.t && (
        <button onClick={() => setLocation(tournamentUrl(props.t!.id))}>View {props.t.name}</button>
      )}
    </>
  )
}

export const App: React.FC = () => {
  const [tournament, setTournament] = useState<Tournament>();
  useEffect(() => {
    if (tournament) {
      Demo.run(tournament);
    }
  }, [tournament]);

  function render() {
    return (
      <>
        <Route path='/'>
          {/* <HomePage /> */}
          <DemoComponent t={tournament} />
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
                <TournamentCreatorPage onAccept={(t) => { setTournament(t) }} />
              )
            }
            return <TournamentPage tournamentId={params.id} />
          }}
        </Route>
        <Route path='/tournament/:tournamentId/match/:matchId'>
          {(params) => {
            const matchIdNumber = Number(params.matchId);
            if (isNaN(matchIdNumber)) {
              return <NotFound />
            }
            return <MatchPage tournamentId={params.tournamentId} matchId={matchIdNumber} />
          }}
        </Route>
      </>
    );
  }

  return render();
}