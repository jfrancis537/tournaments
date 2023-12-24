import { useState } from "react";
import { AuthAPI } from "../APIs/AuthAPI";
import { HttpStatusError } from "../Errors/HttpStatusError";
import { useLocation } from "wouter";
import {
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  FormLabel,
  Input
} from "@mui/joy";

import PersonIcon from '@mui/icons-material/Person';
import Key from '@mui/icons-material/Key';

export const Login: React.FC = () => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [_, setLocation] = useLocation();

  async function login() {
    try {
      await AuthAPI.login(username, password);
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