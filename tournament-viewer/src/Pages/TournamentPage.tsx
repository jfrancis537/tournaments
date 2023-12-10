import { useEffect, useState } from "react";
import { LoadState } from "../Utilities/LoadState";
import { Database } from "brackets-manager";
import { Match, Status } from "brackets-model";
import { TournamentManager } from "../Managers/TournamentManager";
import { TournamentState } from "../Models/Tournament";
import { useLocation } from "wouter";
import { matchUrl } from "../Utilities/RouteUtils";
import { SeedAssignmentTool } from "../Components/SeedAssignmentTool";
import { TeamManager } from "../Managers/TeamManager";
import { BracketsViewer } from "../Wrappers/BracketsViewer";

import './TournamentPage.module.css'

interface TournamentPageProps {
  tournamentId: string;
}

export const TournamentPage: React.FC<TournamentPageProps> = (props) => {

  const [loadingState, setLoadingState] = useState<LoadState>(LoadState.LOADING);
  const [assigning, setAssigning] = useState(false);
  const [tournamentData, setTournamentData] = useState<Database>();
  const [, setLocation] = useLocation();

  function componentWillUnmount() {
    TournamentManager.instance.ontournamentcreated.removeListener(tournamentStateChanged);
    TournamentManager.instance.ontournamentstarted.removeListener(tournamentStateChanged);
    TournamentManager.instance.onmatchupdated.removeListener(onMatchUpdated);
    TournamentManager.instance.onmatchstarted.removeListener(onMatchStarted);
  }

  function componentWillMount() {
    TournamentManager.instance.ontournamentcreated.addListener(tournamentStateChanged);
    TournamentManager.instance.ontournamentstarted.addListener(tournamentStateChanged);
    TournamentManager.instance.onmatchupdated.addListener(onMatchUpdated);
    TournamentManager.instance.onmatchstarted.addListener(onMatchStarted);

    return componentWillUnmount;
  }

  useEffect(componentWillMount, []);

  useEffect(() => {
    tournamentStateChanged();
  }, [props.tournamentId]);

  useEffect(() => {
    if (tournamentData) {
      BracketsViewer.instance.render({
        stages: tournamentData.stage,
        matches: tournamentData.match,
        matchGames: tournamentData.match_game,
        participants: tournamentData.participant,

      }, {
        clear: true,
        selector: "#bracket_container",
        onMatchClick: onMatchClicked,
      });
    }
  }, [tournamentData])

  function renderAssigning() {
    const teams = TeamManager.instance.getTeams(props.tournamentId);
    if (!teams) {
      return <div>An error occurred.</div>
    }
    return (
      <SeedAssignmentTool teams={teams} onAccept={acceptSeeding} />
    );
  }

  function acceptSeeding(teamIds: (string|undefined)[]) {
    for (let i = 0; i < teamIds.length;i++) {

      const id = teamIds[i];
      if(id) {
        TeamManager.instance.assignSeedNumber(id, i);
      }

    }
    setAssigning(false);
  }

  function renderBracketView() {
    switch (loadingState) {
      case LoadState.LOADING:
        return <div>Getting Ready...</div>
      case LoadState.FAILED:
        return <div>Tournament doesn't exist</div>
      case LoadState.COMPLETE:
        if (tournamentData) {
          return <div id="bracket_container" className="brackets-viewer"></div>
        } else {
          return (
            <>
              <button
                onClick={() => TournamentManager.instance.startTournament(props.tournamentId)}
              >
                Start
              </button>
              <button onClick={() => { setAssigning(!assigning) }}>Assign Players</button>
            </>
          );
        }
    }
  }

  function render() {
    if (assigning) {
      return renderAssigning();
    } else {
      return renderBracketView();
    }

  }

  async function tournamentStateChanged() {
    const data = await TournamentManager.instance.getTournamentData(props.tournamentId);
    if (!data) {
      setLoadingState(LoadState.FAILED);
      return;
    }
    const [tournament, database] = data;
    setLoadingState(LoadState.COMPLETE);
    if (tournament.state >= TournamentState.Running) {
      setTournamentData(database);
    }
  }

  async function onMatchClicked(match: Match) {
    if(match.status >= Status.Ready)
    {
      setLocation(matchUrl(props.tournamentId, match.id as number));
    }
  }

  async function onMatchUpdated() {
    // Assert not null since this must be called when a match exists.
    const [, data] = (await TournamentManager.instance.getTournamentData(props.tournamentId))!;
    setTournamentData(data);
  }

  async function onMatchStarted(match: Match) {
    // Do something!
  }

  return render();
}
