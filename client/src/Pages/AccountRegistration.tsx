import { useState } from "react"
import { AuthAPI } from "../APIs/AuthAPI";
import { RegistrationResult } from "@common/Constants/AuthAPIConstants";
import { useLocation } from "wouter";
import { Box, Button, ButtonGroup, Card, CardContent, Container, Divider, FormControl, FormLabel, IconButton, Input, Sheet, Typography } from "@mui/joy";

import pageStyles from './AccountRegistration.module.css';
import { Validators } from "@common/Utilities/Validators";
import { Close } from "@mui/icons-material";
import { useNavigation } from "../Hooks/UseNavigation";

enum RegistrationState {
  Error,
  Composing,
  Complete
}

export const AccountRegistration: React.FC = () => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [state, setState] = useState(RegistrationState.Composing);

  const goHome = useNavigation("/");

  function buttonIsEnabled(): boolean {
    return !!username && !!password && !!email && password === confirmPassword;
  }

  async function register() {
    const reason = await AuthAPI.register({
      username,
      password,
      email
    });

    if (reason.result !== RegistrationResult.SUCCESS) {
      setErrorMessage(RegistrationResult.toClientErrorMessage(reason.result));
      setState(RegistrationState.Error);
      return;
    }

    setState(RegistrationState.Complete);
  }

  function dismissError() {
    setErrorMessage('');
    setState(RegistrationState.Composing);
  }

  function renderComposing() {
    return (
      <Container maxWidth='md' sx={{
        height: '100%'
      }}>
        <Card>
          <Typography level="h3">Register Account</Typography>
          <Divider />
          <CardContent>
            <FormControl error={!!username ? !Validators.username(username) : false}>
              <FormLabel>Username</FormLabel>
              <Input
                type='text'
                value={username}
                onChange={e => setUsername(e.currentTarget.value)} />
            </FormControl>
            <FormControl error={(!!password ? !Validators.password(password) : false)}>
              <FormLabel>Password</FormLabel>
              <Input value={password} onChange={e => setPassword(e.currentTarget.value)} type='password' />
            </FormControl>
            <FormControl error={(!!confirmPassword ? confirmPassword !== password : false)}>
              <FormLabel>Confirm Password</FormLabel>
              <Input value={confirmPassword} onChange={e => setConfirmPassword(e.currentTarget.value)} type='password' />
            </FormControl>
            <FormControl error={!!email ? !Validators.email(email) : false}>
              <FormLabel>Email</FormLabel>
              <Input value={email} type="email" onChange={e => setEmail(e.currentTarget.value)} />
            </FormControl>
            <Box className={pageStyles["button-container"]}>
              <Button variant='solid' disabled={!buttonIsEnabled()} onClick={register}>Register</Button>
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
    )
  }

  function renderComplete() {
    return (
      <Container maxWidth='sm' sx={{ height: '100%' }}>
        <Card className={pageStyles.card}>
          <CardContent className={pageStyles["card-content"]}>
            <Typography level="title-lg">Registration Started!</Typography>
            <Typography level="body-md">Check your email for a confirmation link.</Typography>
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