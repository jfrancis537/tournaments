import { Team } from "@common/Models/Team";
import { Box, Button, ButtonGroup, IconButton, Tooltip } from "@mui/joy";
import { Match, Status } from "brackets-model";
import { MatchAPI } from "../../APIs/MatchAPI";

import pageStyles from "./MatchPage.module.css";
import { Add, EmojiEvents, HighlightOff, Remove } from "@mui/icons-material";
import { useState } from "react";

interface ScoreControlProps {
  match: Match,
  tournamentId: string,
  team: Team,
  score: number,
}

export const ScoreControls: React.FC<ScoreControlProps> = (props) => {

  const { match, team } = props;
  const [waiting, setWaiting] = useState(false);

  async function updateScore(delta: number) {
    setWaiting(true);
    await MatchAPI.updateScore(props.tournamentId, match, team.seedNumber!, delta);
    setWaiting(false);
  }

  async function forfeit() {
    setWaiting(true);
    await MatchAPI.forfeit(props.tournamentId, match, team.seedNumber!);
    setWaiting(false);
  }

  async function win() {
    setWaiting(true);
    await MatchAPI.selectWinner(props.tournamentId, match, team.seedNumber!);
    setWaiting(false);
  }

  function render() {
    return (
      <ButtonGroup className={pageStyles.controls}>
        <Tooltip title="Increase Score" placement="top">
          <IconButton
            disabled={match.status !== Status.Running || waiting}
            onClick={() => updateScore(1)}>
            <Add />
          </IconButton>
        </Tooltip>
        <Tooltip title="Set Winner" placement="top">
          <IconButton onClick={win}>
            <EmojiEvents />
          </IconButton>
        </Tooltip>
        <Tooltip title="Forfeit" placement="top">
          <IconButton onClick={forfeit}>
            <HighlightOff />
          </IconButton>
        </Tooltip>
        <Tooltip title="Decrease Score" placement="top">
          <IconButton
            disabled={match.status !== Status.Running || waiting}
            onClick={() => updateScore(-1)}>
            <Remove />
          </IconButton>
        </Tooltip>
      </ButtonGroup>
    );
  }

  return render();
}