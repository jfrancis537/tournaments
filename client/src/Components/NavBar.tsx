import { Box, Button, Dropdown, Menu, MenuButton, MenuItem, Typography } from '@mui/joy';

import { Person } from '@mui/icons-material';
import { useContext } from 'react';
import { useLocation } from 'wouter';
import { UserContext } from '../Contexts/UserContext';
import navStyles from './NavBar.module.css';


const NavBarButton: React.FC<{ url: string, children: string }> = (props) => {
  const [, setLocation] = useLocation();

  return (
    <Button variant='plain' onClick={() => {
      setLocation(props.url);
    }}>{props.children}</Button>
  )
}

function login() {
  window.location.href = '/api/v1/auth/login';
}

export const NavBar: React.FC = () => {

  const { user } = useContext(UserContext);

  async function logout() {
    window.location.href = '/oidc/logout';
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
        <Button variant='plain' onClick={login}>Login</Button>
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
          <NavBarButton url='/tournaments/all'>Tournaments</NavBarButton>
          <NavBarButton url='/news'>News</NavBarButton>
          {renderUserOrLogin()}
        </Box>
      </div>
    );
  }

  return render();
}