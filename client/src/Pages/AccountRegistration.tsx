import { useState } from "react"
import { AuthAPI } from "../APIs/AuthAPI";
import { RegistrationResult } from "@common/Constants/AuthAPIConstants";
import { useLocation } from "wouter";
import { Box, Button, Container, FormControl, FormLabel, IconButton, Input, Sheet, Typography } from "@mui/joy";

import pageStyles from './AccountRegistration.module.css';
import { Validators } from "@common/Utilities/Validators";
import { Close } from "@mui/icons-material";

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
        <h2>Register Account</h2>
        <Sheet variant='soft' className={pageStyles['sheet']}>
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
          <FormControl>
            <Button variant='solid' disabled={!buttonIsEnabled()} onClick={register}>Register</Button>
          </FormControl>
        </Sheet>
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

  function render() {
    switch (state) {
      case RegistrationState.Error:
      case RegistrationState.Composing:
        return renderComposing();
      case RegistrationState.Complete:
    }
  }

  return render();
}