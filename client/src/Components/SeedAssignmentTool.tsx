
import { useEffect, useState } from "react";
import { Team } from "@common/Models/Team";
import styles from "./SeedAssignmentTool.module.css";
import { nextPowerOf2 } from "../../../common/Utilities/Math";
import { TeamAPI } from "../APIs/TeamAPI";

interface SeedAssignmentToolProps {
  tournamentId: string;
  onAccept: (item: (string | undefined)[]) => void;
}

export const SeedAssignmentTool: React.FC<SeedAssignmentToolProps> = (props) => {

  const [assigned, setAssigned] = useState<(string | undefined)[]>([]);
  const [teams,setTeams] = useState<Team[]>();

  useEffect(() => {
    TeamAPI.getTeams(props.tournamentId).then(setTeams);
  },[props.tournamentId])

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

    // // Erase the existing id and it's seed number
    // TeamManager.instance.assignSeedNumber(existingId, undefined);
    // // Assign it to the new one.
    // TeamManager.instance.assignSeedNumber(id, seedNumber);
    assigned[seedNumber] = id;
    setAssigned([...assigned]);
  }

  function renderUnassignedTeam(team: Team) {
    return (
      <div
        key={team.id}
        className={styles["unassigned-team"]}
        draggable
        onDragStart={(event) => handleDragStart(event, team)}>
        {team.name}
      </div>
    )
  }

  function renderAssignedTeams(teams: Team[]) {
    const elements: JSX.Element[] = [];
    const numSpots = nextPowerOf2(teams.length);
    for (let i = 0; i < numSpots; i++) {
      const id = assigned[i];
      const style = i % 2 === 0 ? styles['assigned-team-top'] : styles["assigned-team-bottom"];
      if (id) {
        // This won't be null since we loaded it from real teams.
        const team = teams.find(team => id === team.id)!;
        elements.push(
          <div
            key={`${i}`}
            className={style}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDropOnOccupied(e, id, i)}
          >
            {team.name}
          </div>
        );
      } else {
        elements.push(
          <div
            key={`${i}`}
            className={style}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDropOnEmpty(e, i)}
          >
          </div>
        );
      }

    }
    return elements;
  }

  function render(): JSX.Element {
    if(!teams)
    {
      return (
        <div>Loading...</div>
      );
    }
    
    return (
      <div className={styles["primary-container"]}>
        <div className={styles["unassigned-teams-container"]}>
          {teams!.filter(team => !assigned.includes(team.id)).map(renderUnassignedTeam)}
        </div>
        <div className={styles["assigned-teams-container"]}>
          {renderAssignedTeams(teams!)}
        </div>
        <button
          onClick={() => props.onAccept(assigned)}
          // disabled={assigned.filter(item => item !== undefined).length !== props.teams.length}
        >
          Accept</button>
      </div>
    )
  }

  return render();
}