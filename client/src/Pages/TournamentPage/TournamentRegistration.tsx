import {
  Container, FormControl, FormLabel, Input,
  Button, Card, Typography, Divider,
  CardContent, Box, IconButton
} from "@mui/joy";

import pageStyles from './TournamentRegistration.module.css';
import { Validators } from "@common/Utilities/Validators";
import { useState } from "react";
import { Close } from "@mui/icons-material";
import { TeamAPI } from "../../APIs/TeamAPI";
import { TeamAPIConstants } from "@common/Constants/TeamAPIConstants";
import { useNavigation } from "../../Hooks/UseNavigation";

interface TournamentRegistrationProps {
  tournamentId: string;
}

enum RegistrationState {
  Error,
  Composing,
  Complete
}

export const TournamentRegistration: React.FC<TournamentRegistrationProps> = (props) => {

  const [teamName, setTeamName] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState(RegistrationState.Composing);
  const [errorMessage, setErrorMessage] = useState('');

  const goHome = useNavigation("/");


  function dismissError() {
    setErrorMessage('');
    setState(RegistrationState.Composing);
  }

  async function register() {

    const result = await TeamAPI.register(props.tournamentId, {
      teamName: teamName,
      contactEmail: email
    });
    const ResultType = TeamAPIConstants.TeamRegistrationResult;
    switch (result.result) {
      case ResultType.SUCCESS:
        setState(RegistrationState.Complete);
        break;
      case ResultType.INVALID_EMAIL:
      case ResultType.REGISTRATION_CLOSED:
      case ResultType.NO_SUCH_TOURNAMENT:
      case ResultType.SERVER_ERROR:
        setErrorMessage(ResultType.toErrorMessage(result.result));
        setState(RegistrationState.Error);
        break;
    }
  }

  function renderComposing(): JSX.Element {
    return (
      <Container maxWidth='sm' sx={{
        height: '100%'
      }}>
        <Card>
          <Typography level="h3">Tournament Registration</Typography>
          <Divider />
          <CardContent>
            <FormControl error={false}>
              <FormLabel>Team Name</FormLabel>
              <Input
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                type='text'
              />
            </FormControl>
            <FormControl error={!!email ? !Validators.email(email) : false}>
              <FormLabel>Email</FormLabel>
              <Input
                type='email'
                onChange={e => setEmail(e.target.value)}
              />
            </FormControl>
            <Box className={pageStyles["button-container"]}>
              <Button variant='solid' onClick={register}>Register</Button>
              <Button variant='solid' onClick={goHome}>Cancel</Button>
            </Box>
          </CardContent>
        </Card>
        <Box className={pageStyles["error-container"]}>
          {state === RegistrationState.Error && (
            <Typography
              variant="soft"
              color="danger"
              fontSize="sm"
              sx={{ '--Typography-gap': '0.5rem', p: 1 }}
              endDecorator={(
                <IconButton color="danger" size="sm" onClick={dismissError}>
                  <Close />
                </IconButton>
              )}
            >
              {errorMessage}
            </Typography>
          )}
        </Box>
      </Container>
    );
  }


  function renderComplete() {
    return (
      <Container maxWidth='sm' sx={{ height: '100%' }}>
        <Card>
          <CardContent>
            <Typography level="title-lg">Registration Confirmed!</Typography>
            <Typography level="body-md">Check your email for your details.</Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  function render() {
    switch (state) {
      case RegistrationState.Error:
      case RegistrationState.Composing:
        return renderComposing();
      case RegistrationState.Complete:
        return renderComplete();
    }
  }

  return render();
}