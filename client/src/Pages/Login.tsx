import React, { useContext, useEffect, useState } from "react";
import { AuthAPI } from "../APIs/AuthAPI";
import { HttpStatusError } from "../Errors/HttpStatusError";
import { useLocation } from "wouter";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  IconButton,
  Input,
  Link,
  Typography
} from "@mui/joy";

import PersonIcon from '@mui/icons-material/Person';
import Key from '@mui/icons-material/Key';
import { UserContext } from "../Contexts/UserContext";
import { Close, Email } from "@mui/icons-material";

import pageStyles from './Login.module.css';

export const Login: React.FC = () => {

  const [email, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  const { setUser } = useContext(UserContext);

  const [_, setLocation] = useLocation();

  async function handleEnterPressed(event: React.KeyboardEvent) {
    if (event.key !== 'Enter') {
      return;
    }
    await login();
  }

  function handleUsernameChanged(event: React.ChangeEvent<HTMLInputElement>) {
    setUsername(event.target.value);
  }

  function handlePasswordChanged(event: React.ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
  }

  async function login() {
    try {
      const loggedInUser = await AuthAPI.login(email, password);
      setUser(loggedInUser);
      setLocation('/');
    } catch (err) {
      if (err instanceof HttpStatusError) {
        setErrorMessage(err.message);
      }
    }
  }

  function dismissError() {
    setErrorMessage('');
  }

  function render(): JSX.Element {
    return (
      <Container maxWidth='sm' sx={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexFlow: 'column'
      }}>
        <div style={{
          width: '100%'
        }}
        onKeyPress={handleEnterPressed}>
          <Card className={pageStyles.card}>
            <Typography level="h3">Login</Typography>
            <Divider />
            <CardContent>
              <FormControl>
                <Input
                  startDecorator={<Email />}
                  type='text'
                  value={email}
                  onChange={handleUsernameChanged}
                  placeholder='Email'
                />
              </FormControl>
              <FormControl>
                <Input
                  startDecorator={<Key />}
                  value={password}
                  onChange={handlePasswordChanged}
                  type='password'
                  placeholder='Password'
                />
              </FormControl>
              <Link onClick={() => setLocation('/account/register')}>Register</Link>
              <Button onClick={login}>Login</Button>
            </CardContent>
          </Card>
        </div>
        <Box className={pageStyles["error-container"]}>
          {errorMessage !== '' && (
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

  return render();
}