import { Team } from "@common/Models/Team"
import { Box, Sheet, Typography } from "@mui/joy"
import { Match } from "brackets-model";

import pageStyles from './MatchPage.module.css';
import { Authenticated } from "../../Components/Authenticated";
import { ScoreControls } from "./ScoreControls";

interface TeamSectionProps {
  match: Match,
  tournamentId: string,
  team: Team,
}

export const TeamSection: React.FC<TeamSectionProps> = (props) => {

  let score: number;
  if (props.team.seedNumber === props.match.opponent1?.id) {
    score = props.match.opponent1?.score ?? 0;
  } else {
    score = props.match.opponent2?.score ?? 0;
  }

  function render() {
    return (
      <Box className={pageStyles["team-section-container"]}>
        <Authenticated roles={['admin']}>
          <ScoreControls {...props} score={score} />
        </Authenticated>
        <Sheet variant="soft" className={pageStyles["team-section"]}>
          <Box className={pageStyles["team-heading-container"]}>
            <Typography level="h2">{props.team.name}</Typography>
          </Box>
          <Box className={pageStyles.score}>
            <Typography level="h1">{score}</Typography>
          </Box>
        </Sheet>
      </Box>
    )
  }

  return render();
}