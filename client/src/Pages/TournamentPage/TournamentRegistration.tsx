import {
  Container, FormControl, FormLabel, Input,
  Button, Card, Typography, Divider,
  CardContent, Box, IconButton, CircularProgress, RadioGroup, Radio,
  Textarea
} from "@mui/joy";

import pageStyles from './TournamentRegistration.module.css';
import { Validators } from "@common/Utilities/Validators";
import React, { useContext, useEffect, useState } from "react";
import { Close, ContentCopy, CopyAll } from "@mui/icons-material";
import { TeamAPI } from "../../APIs/TeamAPI";
import { TeamAPIConstants } from "@common/Constants/TeamAPIConstants";
import { useNavigation } from "../../Hooks/UseNavigation";
import { UserContext } from "../../Contexts/UserContext";
import { Tournament, TournamentMetadata } from "@common/Models/Tournament";
import { TournamentAPI } from "../../APIs/TournamentAPI";
import { copy } from "../../Utilities/Clipboard";

interface TournamentRegistrationProps {
  tournamentId: string;
}

enum RegistrationState {
  Error,
  Composing,
  Complete
}

enum CodeChoice {
  NONE = 'none',
  NEW = 'new',
  EXISTING = 'existing'
}

interface CodeState {
  choice: CodeChoice,
  code?: string,
}

const CODE_LENGTH = 5;

export const TournamentRegistration: React.FC<TournamentRegistrationProps> = (props) => {


  const { user } = useContext(UserContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [codeState, setCodeState] = useState<CodeState>({ choice: CodeChoice.NONE });
  const [enteredCode, setEnteredCode] = useState('');
  const [state, setState] = useState(RegistrationState.Composing);
  const [errorMessage, setErrorMessage] = useState('');
  const [tournament, setTournament] = useState<Tournament>();
  const [waitingForCode, setWaitingForCode] = useState(false);
  const [details,setDetails] = useState("");
  const [tournamentMetadata, setTournamentMetadata] = useState<TournamentMetadata>();

  const goHome = useNavigation("/");

  useEffect(() => {
    TournamentAPI.getTournament(props.tournamentId).then(t => setTournament(t))
      .then(async () => {
        const md = await TournamentAPI.getTournamentMetadata(props.tournamentId);
        setTournamentMetadata(md);
        setDetails(md?.registrationData["details"] ?? "");
      });
  }, [props.tournamentId]);

  useEffect(() => {
    setEmail(user?.email ?? '');
  }, [user]);

  async function handleCodeStateChanged(event: React.ChangeEvent<HTMLInputElement>) {
    const choice = event.currentTarget.value as CodeChoice;
    switch (choice) {
      case CodeChoice.NONE:
        setCodeState({
          choice
        });
        break;
      case CodeChoice.NEW:
        setWaitingForCode(true);
        const code = (await TeamAPI.createRegistrationCode()).code;
        setCodeState({
          choice,
          code
        });
        setWaitingForCode(false);
        break;
      case CodeChoice.EXISTING:
        setCodeState({
          choice
        });
        break;
    }
  }


  function dismissError() {
    setErrorMessage('');
    setState(RegistrationState.Composing);
  }

  function enteredCodeIsInValid() {
    return codeState.choice === CodeChoice.EXISTING && enteredCode.length > 0 && enteredCode.length < 5;
  }

  function registerButtonEnabled() {
    return !enteredCodeIsInValid() && name !== '' && Validators.email(email) && !waitingForCode;
  }

  async function register() {
    const result = await TeamAPI.register(props.tournamentId, {
      name: name,
      contactEmail: email,
      teamCode: codeState.choice === CodeChoice.EXISTING ? enteredCode : codeState.code,
      details: details
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
              <FormLabel>Name</FormLabel>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                type='text'
              />
            </FormControl>
            <FormControl error={!!email ? !Validators.email(email) : false}>
              <FormLabel>Email</FormLabel>
              <Input
                value={email}
                disabled={!!user}
                type='email'
                onChange={e => setEmail(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Textarea
                value={details}
                disabled={!tournamentMetadata}
                onChange={e => setDetails(e.target.value)}
              />
            </FormControl>
            {tournament!.teamSize > 1 && (
              <FormControl sx={{ marginTop: '1rem' }}>
                <FormLabel>Team Information</FormLabel>
                <RadioGroup value={codeState.choice} onChange={handleCodeStateChanged} size="sm">
                  <Radio label="I don't have a team." value={CodeChoice.NONE} />
                  <Radio label="My teammate gave me a code." value={CodeChoice.EXISTING} />
                  <Radio label="I want to setup a new team." value={CodeChoice.NEW} />
                </RadioGroup>
              </FormControl>
            )}
            {codeState.choice === CodeChoice.EXISTING && (
              <FormControl error={false}>
                <FormLabel>Code</FormLabel>
                <Input
                  error={enteredCodeIsInValid()}
                  value={enteredCode}
                  onChange={e => setEnteredCode(e.currentTarget.value.toLocaleUpperCase())}
                  type='text'
                  slotProps={{ input: { maxLength: CODE_LENGTH } }}
                />
              </FormControl>
            )}
            <Box className={pageStyles["button-container"]}>
              <Button disabled={!registerButtonEnabled()} variant='solid' onClick={register}>Register</Button>
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
            <Typography level="title-lg">Registration Submitted!</Typography>
            <Typography level="body-md">You will get an email when your registration is confirmed.</Typography>
          </CardContent>
          {codeState.choice === CodeChoice.NEW && (
            <>
              <Divider />
              <CardContent>
                <Box sx={{ display: 'flex', flexFlow: 'row', alignItems: 'center' }}>
                  <Typography level="h2">{codeState.code}</Typography>
                  <IconButton onClick={() => copy(codeState.code ?? '')} sx={{ marginLeft: '1rem' }}>
                    <ContentCopy />
                  </IconButton>
                </Box>
                <Typography level="body-md">
                  Be sure to save this code and share it with your teammate.
                  If you lose it contact <a href="mailto:admin@kgpb.us">admin@kgpb.us</a>.
                </Typography>
              </CardContent>
            </>
          )}
        </Card>
      </Container>
    );
  }

  function renderLoading() {
    return (
      <Container maxWidth='sm' sx={{ height: '100%' }}>
        <Card>
          <CardContent>
            <CircularProgress size='lg' />
          </CardContent>
        </Card>
      </Container>
    )
  }

  function render() {

    if (!tournament) {
      return renderLoading();
    }

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