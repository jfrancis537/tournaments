import 'brackets-viewer/dist/brackets-viewer.min.css'
import url from 'brackets-viewer/dist/brackets-viewer.min.js?url'

import { Database } from 'brackets-manager';
import { useEffect, useState } from 'react';
import { Match } from 'brackets-model';
import { Box } from '@mui/joy';

type BracketsViewer = typeof globalThis.bracketsViewer;

// We have to shim this in since vite won't do this manipulation via index.html
function loadViewer() {
  if (globalThis.bracketsViewer) {
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
  tournamentData: Database,
  onMatchClicked: (match: Match) => void;
}

export const BracketsViewer: React.FC<BracketViewerProps> = (props) => {

  useEffect(() => {
    loadViewer().then(viewerReady);
  }, [props.tournamentData]);

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