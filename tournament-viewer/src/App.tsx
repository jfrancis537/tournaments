import { BracketViewer } from './Components/BracketViewer';
import { useEffect, useState } from 'react';
import { TournamentManager } from './Managers/TournamentManager';
import { Tournament } from './Models/Tournament';
import { Demo } from './TournamentDemo';

export const App: React.FC = () => {

  const [demoId, setDemoId] = useState<string>();

  useEffect(() => {
    TournamentManager.instance.ontournamentstarted.addListener(onTournamentStarted);
    Demo.run();
    return () => {
      TournamentManager.instance.ontournamentstarted.removeListener(onTournamentStarted)
    }
  },[]);

  function onTournamentStarted(t: Readonly<Tournament>) {
    setDemoId(t.id);
  }

  function render() {
    if(demoId)
    {
      return (
        <div>
          <BracketViewer tournamentId={demoId}></BracketViewer>
        </div>
      )
    } else {
      return <div>Not Ready</div>
    }

  }

  return render();
}