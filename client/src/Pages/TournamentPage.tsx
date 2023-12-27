import { useContext, useEffect, useState } from "react";
import { LoadState } from "../Utilities/LoadState";
import { Database } from "brackets-manager";
import { Match, Status } from "brackets-model";
import { TournamentState } from "@common/Models/Tournament";
import { useLocation } from "wouter";
import { matchUrl, tournamentUrl } from "../Utilities/RouteUtils";
import { SeedAssignmentTool } from "../Components/SeedAssignmentTool";
import { BracketsViewer } from "../Wrappers/BracketsViewer";

import './TournamentPage.module.css'
import { TournamentSocketAPI } from "@common/SocketAPIs/TournamentAPI";
import { TournamentAPI } from "../APIs/TournamentAPI";
import { TeamAPI } from "../APIs/TeamAPI";
import { UserContext } from "../Contexts/UserContext";

interface TournamentPageProps {
  tournamentId: string;
  assigning?: boolean;
}

export const TournamentPage: React.FC<TournamentPageProps> = (props) => {

  const [loadingState, setLoadingState] = useState<LoadState>(LoadState.LOADING);
  const [tournamentData, setTournamentData] = useState<Database>();
  const [location, setLocation] = useLocation();

  const {user} = useContext(UserContext);

  function componentWillUnmount() {
    TournamentSocketAPI.ontournamentcreated.removeListener(tournamentStateChanged);
    TournamentSocketAPI.ontournamentstarted.removeListener(tournamentStateChanged);
    TournamentSocketAPI.onmatchupdated.removeListener(onMatchUpdated);
    TournamentSocketAPI.onmatchstarted.removeListener(onMatchStarted);
  }

  function componentWillMount() {
    // This is not very efficient, however it is not common for people to be looking an uncreated tournaments.
    TournamentSocketAPI.ontournamentcreated.addListener(tournamentStateChanged);
    TournamentSocketAPI.ontournamentstarted.addListener(tournamentStateChanged);
    TournamentSocketAPI.onmatchupdated.addListener(onMatchUpdated);
    TournamentSocketAPI.onmatchstarted.addListener(onMatchStarted);

    return componentWillUnmount;
  }

  useEffect(componentWillMount, []);

  useEffect(() => {
    tournamentStateChanged();
  }, [props.tournamentId]);

  async function acceptSeeding(teamIds: (string | undefined)[]) {
    await TeamAPI.assignSeedNumbers(teamIds);
    // Go back to tournament page.
    setLocation(tournamentUrl(props.tournamentId));
  }

  function renderBracketView() {
    switch (loadingState) {
      case LoadState.LOADING:
        return <div>Getting Ready...</div>
      case LoadState.FAILED:
        return <div>Tournament doesn't exist</div>
      case LoadState.COMPLETE:
        if (tournamentData) {
          return <BracketsViewer tournamentData={tournamentData} onMatchClicked={onMatchClicked} />
        } else {
          return (
            <>
              <button
                onClick={() => TournamentAPI.startTournament(props.tournamentId)}
              >
                Start
              </button>
              <button onClick={() => setLocation(`${location}/assigning`)}>Assign Players</button>
            </>
          );
        }
    }
  }

  function render() {
    if (!!props.assigning) {
      return (
        <SeedAssignmentTool tournamentId={props.tournamentId} onAccept={acceptSeeding} />
      );
    } else {
      return renderBracketView();
    }

  }

  async function tournamentStateChanged() {
    const data = await TournamentAPI.getTournamentData(props.tournamentId);
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
    if (match.status >= Status.Ready) {
      setLocation(matchUrl(props.tournamentId, match.id as number));
    }
  }

  async function onMatchUpdated() {
    // Assert not null since this must be called when a match exists.
    const [, data] = (await TournamentAPI.getTournamentData(props.tournamentId))!;
    setTournamentData(data);
  }

  async function onMatchStarted(match: Match) {
    // Do something!
  }

  return render();
}
