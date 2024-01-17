import 'brackets-viewer/dist/brackets-viewer.min.css'
import url from 'brackets-viewer/dist/brackets-viewer.min.js?url'

import { Database } from 'brackets-manager';
import { useEffect, useState } from 'react';
import { Match } from 'brackets-model';
import { Box } from '@mui/joy';
import { MatchMetadata } from '@common/Models/MatchMetadata';
import { MatchAPI } from '../APIs/MatchAPI';
import { TournamentSocketAPI } from '@common/SocketAPIs/TournamentAPI';

type BracketsViewer = typeof globalThis.bracketsViewer;

// We have to shim this in since vite won't do this manipulation via index.html
function loadViewer() {
  if (globalThis.bracketsViewer) {
    // We don't have to re add the script every time.
    return Promise.resolve(globalThis.bracketsViewer);
  }
  return new Promise<BracketsViewer>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => {
      resolve(globalThis.bracketsViewer);
    }
    script.onerror = reject;
    document.head.append(script);
  });
}

loadViewer();

interface BracketViewerProps {
  tournamentId: string,
  tournamentData: Database,
  onMatchClicked: (match: Match) => void;
}
export const BracketsViewer: React.FC<BracketViewerProps> = (props) => {

  const [metadata, setMetadata] = useState<MatchMetadata[]>([]);

  useEffect(() => {
    loadViewer().then(viewerReady);
    MatchAPI.getAllMatchMetadata(props.tournamentId).then((meta) => setMetadata(meta ?? []));
  }, [props.tournamentData]);

  useEffect(() => {
    TournamentSocketAPI.onmatchmetadataupdated.addListener(onMetadataUpdated);
    applyMetadata();
    return () => {
      TournamentSocketAPI.onmatchmetadataupdated.removeListener(onMetadataUpdated);
    }
  }, [metadata])

  function onMetadataUpdated(newData: MatchMetadata) {
    const newState: MatchMetadata[] = [];
    let hit = false;
    for (let i = 0; i < metadata.length; i++) {
      if (newData.matchId === metadata[i].matchId) {
        newState.push(newData);
        hit = true;
      } else {
        newState.push(metadata[i]);
      }
    }
    if(!hit) {
      newState.push(newData);
    }
    console.log(newData,metadata,newState);
    setMetadata(newState);
  }

  function viewerReady(viewer: BracketsViewer) {
    viewer.render({
      stages: props.tournamentData.stage,
      matches: props.tournamentData.match,
      matchGames: props.tournamentData.match_game,
      participants: props.tournamentData.participant,

    }, {
      highlightParticipantOnHover: false,
      clear: true,
      selector: "#bracket_container",
      onMatchClick: props.onMatchClicked,
      separatedChildCountLabel: true,
      showSlotsOrigin: true,
      showLowerBracketSlotsOrigin: true,
    });

    applyMetadata();
  }

  function applyMetadata() {
    if (metadata) {
      for (const data of metadata) {

        if (data.tournamentId !== props.tournamentId) {
          console.warn('Trying to use match metadata in the incorrect tournament');
          continue;
        }

        const matchElement = document.querySelector(`div[data-match-id="${data.matchId}"]`);
        const titleSpan = matchElement?.querySelector('.opponents > span');
        if (titleSpan) {
          titleSpan.innerHTML = data.title;
        }
      }
    }
  }

  function render() {
    return (
      <Box sx={{
        height: "100%",
        width: "100%",
        overflow: "scroll",
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div id="bracket_container" className="brackets-viewer" />
      </Box>
    )
  }

  return render();
}