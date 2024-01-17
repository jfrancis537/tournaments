import { useContext, useEffect, useState } from "react";
import { LoadState } from "../../Utilities/LoadState";
import { Database as BracketsDatabase } from "brackets-manager";
import { Match, Status } from "brackets-model";
import { Tournament, TournamentState } from "@common/Models/Tournament";
import { useLocation } from "wouter";
import { matchUrl } from "../../Utilities/RouteUtils";
import { BracketsViewer } from "../../Wrappers/BracketsViewer";
import { TournamentSocketAPI } from "@common/SocketAPIs/TournamentAPI";
import { TournamentAPI } from "../../APIs/TournamentAPI";
import { UserContext } from "../../Contexts/UserContext";
import { Authenticated } from "../../Components/Authenticated";
import { MatchMetadataModal } from "../MatchPage/MatchMetadataDialog";
import { MatchMetadata } from "@common/Models/MatchMetadata";
import { MatchAPI } from "../../APIs/MatchAPI";

interface TournamentPageProps {
  tournamentId: string;
  assigning?: boolean;
}

export const TournamentViewer: React.FC<TournamentPageProps> = (props) => {

  const [loadingState, setLoadingState] = useState<LoadState>(LoadState.LOADING);
  const [tournamentData, setTournamentData] = useState<BracketsDatabase>();
  const [tournament, setTournament] = useState<Tournament>();
  const [matchToEdit, setMatchToEdit] = useState<Match>()
  const [, setLocation] = useLocation();

  const { user } = useContext(UserContext);

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

  function renderNotStarted() {
    return <h1>Tournament not started yet.</h1>
  }

  function shouldShowViewer() {
    let shouldShow = false;
    if (tournament) {
      if (user) {
        return tournament.state >= TournamentState.Finalizing;
      } else {
        return tournament.state >= TournamentState.Active;
      }
    }
    return shouldShow;
  }

  async function onMetadataChanged(metadata: MatchMetadata) {
    await MatchAPI.addMatchMetadata(metadata);
    setMatchToEdit(undefined);
  }


  function render() {
    switch (loadingState) {
      case LoadState.LOADING:
        return <div>Getting Ready...</div>;
      case LoadState.FAILED:
        return <div>Tournament doesn't exist</div>;
      case LoadState.COMPLETE:
        if (tournamentData && shouldShowViewer()) {
          return (
            <>
              <BracketsViewer
                tournamentId={props.tournamentId}
                tournamentData={tournamentData}
                onMatchClicked={onMatchClicked}
              />
              {matchToEdit && (
                <Authenticated roles={['admin']}>
                  <MatchMetadataModal
                    open={true}
                    match={matchToEdit}
                    tournamentId={props.tournamentId}
                    onAccept={onMetadataChanged}
                    onClose={() => setMatchToEdit(undefined)}
                    onCancel={() => {}}
                  />
                </Authenticated>
              )}
            </>
          )
        } else {
          return renderNotStarted();
        }
    }
  }

  async function tournamentStateChanged() {
    const data = await TournamentAPI.getTournamentData(props.tournamentId);
    if (!data) {
      setLoadingState(LoadState.FAILED);
      return;
    }
    const [t, database] = data;
    setLoadingState(LoadState.COMPLETE);
    setTournament(t);
    setTournamentData(database);
    // const requiredState = user?.role === 'admin' ? TournamentState.Finalizing : TournamentState.Active;
    // if (t.state >= requiredState) {

    // }
  }

  async function onMatchClicked(match: Match) {

    if (tournament && tournament.state === TournamentState.Finalizing) {
      setMatchToEdit(match);
      return;
    }

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
