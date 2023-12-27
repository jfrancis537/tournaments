import { useContext, useEffect, useState } from "react";
import { AuthAPI } from "../APIs/AuthAPI";
import { HttpStatusError } from "../Errors/HttpStatusError";
import { useLocation } from "wouter";
import {
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  Input
} from "@mui/joy";

import PersonIcon from '@mui/icons-material/Person';
import Key from '@mui/icons-material/Key';
import { UserContext } from "../Contexts/UserContext";

export const Login: React.FC = () => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const {setUser} = useContext(UserContext);

  const [_, setLocation] = useLocation();

  useEffect(() => {
    window.addEventListener('keypress',handleEnterPressed);
    return () => {
      window.removeEventListener('keypress',handleEnterPressed);
    }
  },[]);

  function handleEnterPressed(event: KeyboardEvent) {
    if(event.key !== 'Enter')
    {
      return;
    }

    login();
  }

  async function login() {
    try {
      const loggedInUser = await AuthAPI.login(username, password);
      setUser(loggedInUser)
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
        }}>
          <h2>Login</h2>
          <Card>
            <CardContent>
              <FormControl>
                <Input
                  startDecorator={<PersonIcon />}
                  type='text' value={username}
                  onChange={e => setUsername(e.currentTarget.value)}
                  placeholder='Username'
                />
              </FormControl>
              <FormControl>
                <Input
                  startDecorator={<Key />}
                  value={password}
                  onChange={e => setPassword(e.currentTarget.value)}
                  type='password'
                  placeholder='Password'
                />
              </FormControl>
              <Button onClick={login}>Login</Button>
            </CardContent>
          </Card>
        </div>

      </Container>
    );
  }

  return render();
}