
import { useEffect, useState } from "react";
import { Team } from "@common/Models/Team";
import styles from "./SeedAssignmentTool.module.css";
import { nextPowerOf2 } from "../../../../common/Utilities/Math";
import { TeamAPI } from "../../APIs/TeamAPI";
import { Box, Button, Card, CardContent, Container, Divider, Grid, Sheet } from "@mui/joy";
import { v4 as uuid } from "uuid";
import { useLocation } from "wouter";
import { tournamentUrl } from "../../Utilities/RouteUtils";
import { TournamentSocketAPI } from "@common/SocketAPIs/TournamentAPI";

interface SeedAssignmentToolProps {
  tournamentId: string;
}

export const SeedAssignmentTool: React.FC<SeedAssignmentToolProps> = (props) => {

  const [assigned, setAssigned] = useState<(string | undefined)[]>([]);
  const [teams, setTeams] = useState<Team[]>();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Don't list for team changes since this page should only be visited when no more registrations are allowed.
    TeamAPI.getTeams(props.tournamentId).then(setTeams);
    TournamentSocketAPI.ontournamentdeleted.addListener(handleTournamentDeleted);
    return () => {
      TournamentSocketAPI.ontournamentdeleted.removeListener(handleTournamentDeleted);
    }
  }, [props.tournamentId])

  function handleTournamentDeleted(id: string) {
    if (props.tournamentId === id) {
      setLocation('/');
    }
  }

  async function acceptSeeding(teamIds: (string | undefined)[]) {
    await TeamAPI.assignSeedNumbers(props.tournamentId, teamIds);
    // Go back to tournament page.
    setLocation(`${tournamentUrl(props.tournamentId)}/manage`);
  }

  function handleDragStart(event: React.DragEvent<HTMLDivElement>, team: Team) {
    event.dataTransfer.setData('text/plain', team.id);
    event.dataTransfer.dropEffect = 'move';
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function handleDropOnEmpty(event: React.DragEvent<HTMLDivElement>, seedNumber: number) {
    event.preventDefault();

    const id = event.dataTransfer.getData('text/plain');
    if (id == '') {
      return;
    }

    //TeamManager.instance.assignSeedNumber(id, seedNumber);
    assigned[seedNumber] = id;
    setAssigned([...assigned]);
  }

  function handleDropOnOccupied(event: React.DragEvent<HTMLDivElement>, existingId: string, seedNumber: number) {
    event.preventDefault();

    const id = event.dataTransfer.getData('text/plain');
    if (id == '') {
      return;
    }

    assigned[seedNumber] = id;
    setAssigned([...assigned]);
  }

  function renderUnassignedTeam(team: Team) {
    if (assigned.includes(team.id)) {
      return (
        <Sheet>
          <Box
            key={uuid()}
            className={styles["unassigned-team"]}
          >
          </Box>
        </Sheet>
      )
    }

    else {
      return (
        <Sheet variant='soft'>
          <Box
            key={team.id}
            className={styles["unassigned-team"]}
            draggable
            onDragStart={(event) => handleDragStart(event, team)}>
            {team.name}
          </Box>
        </Sheet>
      )
    }
  }

  function renderAssignedTeam(teams: Team[], index: number, id?: string) {
    if (id) {
      // This won't be null since we loaded it from real teams.
      const team = teams.find(team => id === team.id)!;
      return (
        <Sheet variant='soft' className={styles['assigned']}>
          <Box
            key={`${index}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDropOnOccupied(e, id, index)}
          >
            {team.name}
          </Box>
        </Sheet>
      )
    } else {
      return (
        <Sheet variant='soft' className={styles['assigned']}>
          <Box
            key={`${index}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDropOnEmpty(e, index)}
          >
          </Box>
        </Sheet>
      )
    }
  }

  function renderAssignedTeams(teams: Team[]) {
    const elements: JSX.Element[] = [];
    const numSpots = nextPowerOf2(teams.length);
    let matchNum = 0;
    for (let i = 0; i < numSpots; i += 2) {
      const firstId = assigned[i];
      const secondId = assigned[i + 1];
      matchNum++;
      elements.push(
        <div style={{
          display: 'flex'
        }}>
          <div className={styles["number-box"]}>
            <h2>{matchNum}</h2>
          </div>
          <div className={styles["match-container"]}>
            {renderAssignedTeam(teams, i, firstId)}
            <Divider />
            {renderAssignedTeam(teams, i + 1, secondId)}
          </div>
        </div>
      )
    }
    return elements;
  }

  function render(): JSX.Element {
    if (!teams) {
      return (
        <div>Loading...</div>
      );
    }

    return (
      <Container disableGutters>
        <Grid container columnSpacing={2} columnGap={2} columns={{ xs: 2 }}>
          <Card size='md' className={styles.card}>
            <CardContent className={styles.content}>
              {teams!.map(renderUnassignedTeam)}
            </CardContent>
          </Card>
          <Card size='md' className={styles.card}>
            <CardContent className={styles.content}>
              {renderAssignedTeams(teams!)}
            </CardContent>
          </Card>
        </Grid>
        <Box className={styles["accept-button-container"]}>
          <Button
            onClick={() => acceptSeeding(assigned)}
          >
            Accept</Button>
        </Box>
      </Container>
    )
  }

  return render();
}