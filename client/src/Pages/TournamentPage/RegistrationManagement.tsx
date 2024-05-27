import { RegistrationData } from "@common/Models/RegistrationData";
import { Box, Button, Container, IconButton, Sheet, Table, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { TeamAPI } from "../../APIs/TeamAPI";
import { Cancel, Check } from "@mui/icons-material";
import { TeamSocketAPI } from "@common/SocketAPIs/TeamAPI";

import pageStyles from './RegistrationManagement.module.css';
import { useNavigation } from "../../Hooks/UseNavigation";
import { tournamentUrl } from "../../Utilities/RouteUtils";

interface RegistrationManagementProps {
  tournamentId: string;
}

export const RegistrationManagement: React.FC<RegistrationManagementProps> = (props) => {

  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);

  const goBack = useNavigation(`${tournamentUrl(props.tournamentId)}/manage`);

  useEffect(() => {
    TeamAPI.getRegistrations(props.tournamentId).then(setRegistrations);
  }, [props.tournamentId]);

  useEffect(() => {
    TeamSocketAPI.onregistrationchanged.addListener(handleRegistrationChanged);
    return () => {
      TeamSocketAPI.onregistrationchanged.removeListener(handleRegistrationChanged);
    }
  }, [registrations]);

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

  function renderRegistrationRow(registration: RegistrationData) {
    return (
      <tr key={registration.contactEmail}>
        <td>{registration.name}</td>
        <td>{registration.contactEmail}</td>
        <td>{registration.teamCode ?? 'N/A'}</td>
        <td>{registration.approved ? (
          <IconButton onClick={() => rejectRegistration(registration)}>
            <Cancel htmlColor="#cf4343" />
          </IconButton>
        ) : (
          <IconButton onClick={() => acceptRegistration(registration)}>
            <Check color='success' />
          </IconButton>
        )}</td>
      </tr>
    );
  }

  function renderTable(registrations: RegistrationData[], approved: boolean) {
    return (
      <Sheet variant="outlined" sx={{ overflow: 'auto', maxHeight: '45%' }} key={String(approved)}>
        <Table stickyHeader className={pageStyles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Code</th>
              <th>{approved ? 'Reject' : 'Approve'}</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map(r => renderRegistrationRow(r))}
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
      </Container>
    );
  }

  return render();
}