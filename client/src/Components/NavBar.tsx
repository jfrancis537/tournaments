import MenuIcon from '@mui/icons-material/Menu'
import { Box, Button, Dropdown, Menu, MenuButton, MenuItem, Typography } from '@mui/joy';

import navStyles from './NavBar.module.css';
import { useContext, useEffect } from 'react';
import { UserContext } from '../Contexts/UserContext';
import { useLocation } from 'wouter';
import { Person } from '@mui/icons-material';
import { AuthAPI } from '../APIs/AuthAPI';
import { useSocketState } from '../Managers/SocketManager';


const NavBarButton: React.FC<{ url: string, children: string }> = (props) => {
  const [, setLocation] = useLocation();

  return (
    <Button variant='plain' onClick={() => {
      setLocation(props.url);
    }}>{props.children}</Button>
  )
}

export const NavBar: React.FC = () => {

  const { user, setUser } = useContext(UserContext);
  const [, setLocation] = useLocation();

  async function logout() {
    await AuthAPI.logout();
    setUser(undefined);
    setLocation('/');
  }

  function renderUserOrLogin() {
    if (user) {
      return (
        <Dropdown>
          <MenuButton
            color="neutral"
            variant='plain'
            endDecorator={<Person />}
          >
            {user.email}
          </MenuButton>
          <Menu>
            <MenuItem
              onClick={logout}
            >
              Logout
            </MenuItem>
          </Menu>
        </Dropdown>

      )
    } else {
      return (
        <NavBarButton url='/account/login'>Login</NavBarButton>
      )
    }
  }

  function render() {
    return (
      <div className={navStyles['nav']}>
        <Box>
          <Typography level='h4'>{import.meta.env.VITE_APP_TITLE}</Typography>
        </Box>
        <Box sx={{display: 'flex'}}>
          <NavBarButton url='/'>Home</NavBarButton>
          {renderUserOrLogin()}
        </Box>
      </div>
    );
  }

  return render();
}