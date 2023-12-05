import { useEffect, useState } from "react";
import { LoadState } from "../Utilities/LoadState";
import { Database } from "brackets-manager";
import { Match } from "brackets-model";
import { TournamentManager } from "../Managers/TournamentManager";
import { Demo } from "../TournamentDemo";

interface BracketViewerProps {
  tournamentId: string;
}

const BracketsViewer = globalThis.bracketsViewer;

export const BracketViewer: React.FC<BracketViewerProps> = (props) => {

  const [loadingState,setLoadingState] = useState<LoadState>(LoadState.LOADING);
  const [tournamentData, setTournamentData] = useState<Database>();

  function componentWillUnmount() {
    TournamentManager.instance.onmatchupdated.removeListener(onMatchUpdated);
  }

  function componentWillMount() {

    TournamentManager.instance.onmatchupdated.addListener(onMatchUpdated);

    return componentWillUnmount;
  }

  useEffect(componentWillMount,[]);

  useEffect(() => {
    TournamentManager.instance.getTournamentData(props.tournamentId).then(data => {
      if(!data)
      {
        setLoadingState(LoadState.FAILED);
        return;
      }
      setLoadingState(LoadState.COMPLETE);
      setTournamentData(data);
    });

  },[props.tournamentId]);

  useEffect(() => {
    if(tournamentData)
    {
      BracketsViewer.render({
        stages: tournamentData.stage,
        matches: tournamentData.match,
        matchGames: tournamentData.match_game,
        participants: tournamentData.participant,
        
      },{
        clear: true,
        selector: "#bracket_container",
        onMatchClick: onMatchClicked,
      });
    }
  },[tournamentData])

  function render() {
    switch(loadingState)
    {
      case LoadState.LOADING:
        return <div>Getting Ready...</div>
      case LoadState.FAILED:
        return <div>Something went wrong...</div>
      case LoadState.COMPLETE:
        return <div id="bracket_container" className="brackets-viewer"></div>
    }
  }

  async function onMatchClicked(match: Match) {
    // In the future this will take the user to the match view page.
    Demo.onClick(match);
  }

  async function onMatchUpdated()
  {
    setTournamentData(await TournamentManager.instance.getTournamentData(props.tournamentId));
  }

  return render();
}