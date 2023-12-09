import { useEffect, useState } from 'react';
import { Route, useLocation } from 'wouter';
import { TournamentPage } from './Pages/TournamentPage';
import { Demo } from './TournamentDemo';
import { MatchPage } from './Pages/MatchPage';
import { NotFound } from './Pages/NotFound';

const DemoComponent: React.FC = () => {

  const [id,setId] = useState<string>();
  const [,setLocation] = useLocation();

  return (
    <>
    <button onClick={async () => {
      const id = await Demo.run();
      setId(id);
    }}>Create Tournament</button>
    {id && (
      <button onClick={() => {
        setLocation(`/tournament/${id}`);
      }}>{id}</button>
    )}
    </>
  )
}

export const App: React.FC = () => {

  useEffect(() => {
    return () => {
    }
  },[]);

  function render() {
    return (
      <div>
        <Route path='/'>
          {/* <HomePage /> */}
          <DemoComponent />
        </Route>
        <Route path='/tournament/:id'>
          {(params) => <TournamentPage tournamentId={params.id}/>}
        </Route>
        <Route path='/tournament/:tournamentId/match/:matchId'>
          {(params) => {
            const matchIdNumber = Number(params.matchId);
            if(isNaN(matchIdNumber))
            {
              return <NotFound />
            }
            return <MatchPage tournamentId={params.tournamentId} matchId={matchIdNumber}/>
          }}
        </Route>
      </div>
    );
  }

  return render();
}