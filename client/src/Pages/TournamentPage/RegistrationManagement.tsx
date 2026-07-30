import { RegistrationData } from "@common/Models/RegistrationData";
import { TeamSocketAPI } from "@common/SocketAPIs/TeamAPI";
import { Cancel, Check, Email } from "@mui/icons-material";
import { Box, Button, Container, IconButton, Option, Select, Sheet, Snackbar, Table, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { TeamAPI } from "../../APIs/TeamAPI";

import { useNavigation } from "../../Hooks/UseNavigation";
import { tournamentUrl } from "../../Utilities/RouteUtils";
import pageStyles from './RegistrationManagement.module.css';

interface RegistrationManagementProps {
  tournamentId: string;
  editable: boolean;
}

export const RegistrationManagement: React.FC<RegistrationManagementProps> = (props) => {

  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [reminderError, setReminderError] = useState<string>();

  const goBack = useNavigation(`${tournamentUrl(props.tournamentId)}/manage`);

  useEffect(() => {
    TeamAPI.getRegistrations(props.tournamentId).then(setRegistrations);
  }, [props.tournamentId]);

  useEffect(() => {
    TeamSocketAPI.onregistrationchanged.addListener(handleRegistrationChanged);
    return () => {
      TeamSocketAPI.onregistrationchanged.removeListener(handleRegistrationChanged);
    }
  }, []);

  function handleRegistrationChanged(registration: RegistrationData) {
    if (!registrations) {
      // This should be impossible.
      console.warn('Attempted to update a registration when registrations are undefined.')
      return;
    }
    const index = registrations.findIndex(reg => reg.contactEmail === registration.contactEmail);
    if (index === -1) {
      // This should be impossible.
      console.warn('Attempted to update a registration that is not present.')
      return;
    }

    registrations[index] = registration;

    setRegistrations([...registrations]);
  }

  function rejectRegistration(registration: RegistrationData) {
    TeamAPI.setRegistrationApproval(props.tournamentId, registration.contactEmail, false);
  }

  function acceptRegistration(registration: RegistrationData) {
    TeamAPI.setRegistrationApproval(props.tournamentId, registration.contactEmail, true);
  }

  function setSkillLevel(registration: RegistrationData, skillLevel: number) {
    TeamAPI.setRegistrationSkill(props.tournamentId, registration.contactEmail, skillLevel);
  }

  async function sendReminderEmail(registration: RegistrationData) {
    try {
      await TeamAPI.sendReminderEmail(props.tournamentId, registration.contactEmail);
    } catch {
      setReminderError('Failed to send reminder email. Please try again.');
    }
  }

  function renderRegistrationRowButtons(registration: RegistrationData, markMissingPartner: boolean) {
    if (props.editable && markMissingPartner) {
      return (
        <td>
          <IconButton onClick={() => sendReminderEmail(registration)}>
            <Email htmlColor="#e89715ff" />
          </IconButton>
        </td>
      )
    } else {
      return (
        <td>{registration.approved ? (
          <IconButton disabled={!props.editable} onClick={() => rejectRegistration(registration)}>
            <Cancel htmlColor="#cf4343" />
          </IconButton>
        ) : (
          <IconButton disabled={!props.editable} onClick={() => acceptRegistration(registration)}>
            <Check color='success' />
          </IconButton>
        )}</td>
      )
    }

  }

  function renderRegistrationRow(registration: RegistrationData, all: RegistrationData[]) {
    let markMissingPartner = false;

    if (registration.teamCode !== undefined) {
      const partner = all.find(r => {
        return (registration !== r) && (r.teamCode === registration.teamCode)
      });
      if (!partner) {
        markMissingPartner = true;
      }
    }



    return (
      <tr key={registration.contactEmail}>
        <td>{registration.name}</td>
        <td>{registration.contactEmail}</td>
        <td style={{ color: markMissingPartner ? 'red' : 'inherit' }}>{registration.teamCode ?? 'N/A'}</td>
        <td>
          {props.editable ? (
            <Select
              size="sm"
              value={registration.skillLevel}
              onChange={(_, value) => setSkillLevel(registration, value ?? registration.skillLevel)}
            >
              <Option value={1}>1</Option>
              <Option value={2}>2</Option>
              <Option value={3}>3</Option>
            </Select>
          ) : registration.skillLevel}
        </td>
        {renderRegistrationRowButtons(registration, markMissingPartner)}
      </tr>
    );
  }

  function renderTable(registrations: RegistrationData[], approved: boolean) {
    return (
      <Sheet variant="outlined" sx={{ overflow: 'auto', maxHeight: props.editable ? '30vh' : '70vh' }} key={String(approved)}>
        <Table stickyHeader className={pageStyles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Code</th>
              <th>Skill</th>
              <th>{approved ? 'Reject' : 'Approve'}</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map(r => renderRegistrationRow(r, registrations))}
          </tbody>
        </Table>
      </Sheet>
    )
  }

  function render(): JSX.Element {

    registrations.sort((a, b) => {
      if (a.teamCode && b.teamCode) {
        return a.teamCode.localeCompare(b.teamCode);
      } else if (a.teamCode && !b.teamCode) {
        return -1;
      } else if (!a.teamCode && b.teamCode) {
        return 1;
      } else {
        return 0;
      }
    });

    const errorSnackbar = (
      <Snackbar
        open={!!reminderError}
        color='danger'
        onClose={() => setReminderError(undefined)}
      >
        {reminderError}
      </Snackbar>
    );

    if (!props.editable) {
      return (
        <Container maxWidth='md' className={pageStyles.container}>
          <Box>
            <Button onClick={goBack}>Back</Button>
          </Box>
          <Box className={pageStyles['table-box']}>
            <Typography level='title-lg'>Registrations</Typography>
            {renderTable(registrations, false)}
          </Box>
          {errorSnackbar}
        </Container>
      );
    } else {
      return (
        <Container maxWidth='md' className={pageStyles.container}>
          <Box>
            <Button onClick={goBack}>Back</Button>
          </Box>
          <Box className={pageStyles['table-box']}>
            <Typography level='title-lg'>Unapproved Registrations</Typography>
            {renderTable(registrations.filter(r => !r.approved), false)}
          </Box>
          <Box className={pageStyles['table-box']}>
            <Typography level='title-lg'>Approved Registrations</Typography>
            {renderTable(registrations.filter(r => r.approved), true)}
          </Box>
          {errorSnackbar}
        </Container>
      );
    }


  }

  return render();
}