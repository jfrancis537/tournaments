import { useState } from "react"
import { AuthAPI } from "../APIs/AuthAPI";
import { AuthAPIConstants, RegistrationResult } from "@common/Constants/AuthAPIConstants";
import { useLocation } from "wouter";
import { Button, Container, FormControl, FormLabel, Input, Sheet } from "@mui/joy";

import pageStyles from './AccountRegistration.module.css';
import { Validators } from "@common/Utilities/Validators";

export const AccountRegistration: React.FC = () => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');

  const [_, setLocation] = useLocation();

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
      alert(RegistrationResult.toClientErrorMessage(reason.result));
      return;
    }

    setLocation('/');

  }

  function render() {
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

      </Container>
    )
  }

  return render();
}