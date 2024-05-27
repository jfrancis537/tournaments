import { RegistrationData } from "@common/Models/RegistrationData";
import { Box, Button, Card, CardContent, Checkbox, Container, Divider, List, ListItem, ListItemButton, ListItemDecorator, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { TeamAPI } from "../../APIs/TeamAPI";
import { useNavigation } from "../../Hooks/UseNavigation";
import { tournamentUrl } from "../../Utilities/RouteUtils";
import { TeamSocketAPI } from "@common/SocketAPIs/TeamAPI";

import pageStyles from './TeamAssignment.module.css';
import { Tournament } from "@common/Models/Tournament";
import { TournamentAPI } from "../../APIs/TournamentAPI";
import { useLocation } from "wouter";

interface TeamAssignmentProps {
  tournamentId: string;
}

// This will work by having the admin select two people in the unassigned list.
//  Once two items have been clicked, then the admin can click a `pair` button and 
// At that point the two names will be moved to assigned as a single item that should say
// Name1 & Name2. Clicking a team that was set using this tool can be unbound by clicking them again
// in the assigned column and clicking `unpair`. Assignment of final team codes is done after the admin
// Clicks save or apply or some similar name. Teams that chose themselves cannot be unpaired. 

export const TeamAssignment: React.FC<TeamAssignmentProps> = (props) => {

  const [tournament, setTournament] = useState<Tournament>();
  const [, setLocation] = useLocation();

  const [unpairedRegistrations, setUnpairedRegistrations] = useState<Map<string, RegistrationData>>(new Map());
  const [pairedRegistrations, setPairedRegistrations] = useState<Map<string, RegistrationData>>(new Map());
  const [prePairedCodes, setPrePairedCodes] = useState<Set<string>>(new Set());
  // Set of emails.
  const [selectedUnpairedRegistrations, setSelectedUnpairedRegistrations] = useState<Set<string>>(new Set());
  // Set of team codes.
  const [selectedPairedRegistrations, setSelectedPairedRegistrations] = useState<Set<string>>(new Set());
  const goBack = useNavigation(`${tournamentUrl(props.tournamentId)}/manage`);

  useEffect(() => {
    TeamAPI.getRegistrations(props.tournamentId).then((registrations) => {
      // const unpaired = registrations.filter(r => !r.teamCode && r.approved);
      const unpaired: RegistrationData[] = [];
      const paired: RegistrationData[] = [];
      for (const registration of registrations) {
        if (!registration.teamCode && registration.approved) {
          unpaired.push(registration);
        } else if (registration.approved && registration.teamCode) {
          paired.push(registration);
        }
      }
      setUnpairedRegistrations(new Map(unpaired.map(r => [r.contactEmail, r])));
      setPairedRegistrations(new Map(paired.map(r => [r.contactEmail, r])));
      setPrePairedCodes(new Set(paired.map(r => r.teamCode!)));
    });

    TournamentAPI.getTournament(props.tournamentId).then(setTournament);
  }, [props.tournamentId]);

  useEffect(() => {
    TeamSocketAPI.onregistrationchanged.addListener(handleRegistrationChanged);
    return () => {
      TeamSocketAPI.onregistrationchanged.removeListener(handleRegistrationChanged);
    }
  }, [unpairedRegistrations]);

  function handleRegistrationChanged(registration: RegistrationData) {
    if (!unpairedRegistrations) {
      // This should be impossible.
      console.warn('Attempted to update a registration when registrations are undefined.')
      return;
    }

    const existingUnpaired = unpairedRegistrations.get(registration.contactEmail);
    if (existingUnpaired) {
      if (!registration.approved) {
        unpairedRegistrations.delete(existingUnpaired.contactEmail);
        setUnpairedRegistrations(new Map(unpairedRegistrations));
      }

      // If the update includes a team code, 
      if(registration.teamCode)
      {
        unpairedRegistrations.delete(existingUnpaired.contactEmail);
        setUnpairedRegistrations(new Map(unpairedRegistrations));
      }
    }
    
  }

  async function pairSelectedPlayers() {

    try {
      const codeRequest = await TeamAPI.createRegistrationCode();
      for (const email of selectedUnpairedRegistrations) {
        const data = unpairedRegistrations.get(email)!;
        data.teamCode = codeRequest.code;
        unpairedRegistrations.delete(email);
        pairedRegistrations.set(email, data);
      }
      setPairedRegistrations(new Map(pairedRegistrations));
      setUnpairedRegistrations(new Map(unpairedRegistrations));
      setSelectedUnpairedRegistrations(new Set());
    } catch (err) {
      // TODO handle failed to generate code.
    }
  }

  async function unpairSelectedPlayers() {
    for (const [email, data] of pairedRegistrations) {
      if (selectedPairedRegistrations.has(data.teamCode!)) {
        data.teamCode = undefined;
        pairedRegistrations.delete(email);
        unpairedRegistrations.set(email, data);
      }
    }
    setPairedRegistrations(new Map(pairedRegistrations));
    setUnpairedRegistrations(new Map(unpairedRegistrations));
    setSelectedPairedRegistrations(new Set());
  }

  function handleUnpairedSelected(registration: RegistrationData) {

    const moreSelectionsAllowed = selectedUnpairedRegistrations.size < tournament!.teamSize;
    const isSelected = selectedUnpairedRegistrations.has(registration.contactEmail);

    if (isSelected) {
      selectedUnpairedRegistrations.delete(registration.contactEmail);
    } else {
      // Should be impossible unless a user messes with the UI.
      if (!moreSelectionsAllowed) {
        throw new Error(`Can not select more than ${tournament!.teamSize} people for a team.`)
      }
      selectedUnpairedRegistrations.add(registration.contactEmail);
    }
    setSelectedUnpairedRegistrations(new Set([...selectedUnpairedRegistrations]));
  }

  function renderUnassigned(registrations: RegistrationData[]) {
    // Moving a registration to assigned will automatically add a team code.

    const moreSelectionsAllowed = selectedUnpairedRegistrations.size < tournament!.teamSize;

    return (
      <List>
        {registrations.map(registration => {
          const isSelected = selectedUnpairedRegistrations.has(registration.contactEmail);
          const disabled = !isSelected && !moreSelectionsAllowed;
          return (
            <ListItem key={registration.contactEmail} variant="outlined">
              <ListItemButton selected={isSelected} disabled={disabled} onClick={() => handleUnpairedSelected(registration)}>
                {registration.name}
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    )
  }

  function handlePairedSelected(code: string) {
    const isSelected = selectedPairedRegistrations.has(code);
    if (isSelected) {
      selectedPairedRegistrations.delete(code);
    } else {
      selectedPairedRegistrations.add(code);
    }

    setSelectedPairedRegistrations(new Set(selectedPairedRegistrations));
  }

  function renderAssigned(registrations: RegistrationData[]) {

    if (registrations.length % tournament!.teamSize !== 0) {
      throw new Error('It is impossible to have a single member team');
    }

    // Moving a registration to assigned will automatically add a team code.
    const teams: RegistrationData[][] = [];
    registrations.sort((a, b) => {
      if (a.teamCode && b.teamCode) {
        return a.teamCode.localeCompare(b.teamCode);
      } else {
        throw new Error('Team code not set for assigned team.');
      }
    });

    for (let i = 0; i < registrations.length; i += tournament!.teamSize) {
      const team: RegistrationData[] = [];
      for (let j = i; j < (i + tournament!.teamSize); j++) {
        team.push(registrations[j]);
      }
      teams.push(team);
    }


    return (
      <List>
        {teams.map(([a, b]) => {
          const isSelected = selectedPairedRegistrations.has(a.teamCode!);
          return (
            <ListItem variant="outlined" color='neutral' key={a.teamCode!}>
              <ListItemButton
                onClick={() => handlePairedSelected(a.teamCode!)}
                selected={isSelected}
                disabled={prePairedCodes.has(a.teamCode!)}>
                {a.name + " & " + b.name}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    );
  }

  async function save() {

    const registrationsToSave: RegistrationData[] = [];
    for (const [_, data] of pairedRegistrations) {
      if (!prePairedCodes.has(data.teamCode!)) {
        registrationsToSave.push(data);
      }
    }

    try {
      await TeamAPI.assignRegistrationCodes(props.tournamentId, registrationsToSave);
      setLocation(`${tournamentUrl(props.tournamentId)}/manage`);
    } catch {
      // TODO display an error.
    }

  }

  function render() {

    if (!tournament) {
      return (
        <div>Loading...</div>
      )
    }

    const addTeamDisabled = selectedUnpairedRegistrations.size !== tournament.teamSize;
    const removeDisabled = selectedPairedRegistrations.size === 0;

    return (
      <Container maxWidth='lg' className={pageStyles["page-container"]}>
        {/* {unpaired.map(r => <div>{r.name},{r.contactEmail}</div>)} */}
        <Box>
          <Button onClick={goBack}>Back</Button>
        </Box>
        <Box className={pageStyles["card-container"]}>
          <Card>
            <Typography level="title-lg">Awaiting Assignment</Typography>
            <Divider />
            <CardContent>
              {renderUnassigned([...unpairedRegistrations.values()])}
            </CardContent>
            <Divider />
            <Button onClick={pairSelectedPlayers} disabled={addTeamDisabled}>Add</Button>
          </Card>
          <Card>
            <Typography level="title-lg">Assigned</Typography>
            <Divider />
            <CardContent>
              {renderAssigned([...pairedRegistrations.values()])}
            </CardContent>
            <Divider />
            <Button onClick={unpairSelectedPlayers} disabled={removeDisabled}>Remove</Button>
          </Card>
        </Box>
        <Box className={pageStyles['controls']}>
          <Button onClick={save}>Save</Button>
        </Box>
      </Container>
    );
  }

  return render();
};