import React, { useContext, useEffect, useState } from "react";
import { AuthAPI } from "../APIs/AuthAPI";
import { HttpStatusError } from "../Errors/HttpStatusError";
import { useLocation } from "wouter";
import {
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  Input,
  Link,
  Typography
} from "@mui/joy";

import PersonIcon from '@mui/icons-material/Person';
import Key from '@mui/icons-material/Key';
import { UserContext } from "../Contexts/UserContext";

export const Login: React.FC = () => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
      const loggedInUser = await AuthAPI.login(username, password);
      setUser(loggedInUser);
      setLocation('/');
    } catch (err) {
      if (err instanceof HttpStatusError) {
        alert(err.message);
      }
    }
  }


  function render(): JSX.Element {
    return (
      <Container maxWidth='md' sx={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          flex: 1,
          maxWidth: '400px'
        }}
        onKeyPress={handleEnterPressed}>
          <Card>
            <Typography level="h3">Login</Typography>
            <Divider />
            <CardContent>
              <FormControl>
                <Input
                  startDecorator={<PersonIcon />}
                  type='text'
                  value={username}
                  onChange={handleUsernameChanged}
                  placeholder='Username'
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

      </Container>
    );
  }

  return render();
}