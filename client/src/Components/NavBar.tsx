import MenuIcon from '@mui/icons-material/Menu'
import { Box, Button, Typography } from '@mui/joy';

import navStyles from './NavBar.module.css';
import { useContext } from 'react';
import { UserContext } from '../Contexts/UserContext';
import { useLocation } from 'wouter';


const NavBarButton: React.FC<{url: string, children: string}> = (props) => {
  const [, setLocation] = useLocation();

  return (
    <Button variant='plain' onClick={() => {
      setLocation(props.url);
    }}>{props.children}</Button>
  )
}

export const NavBar: React.FC = () => {

  const { user } = useContext(UserContext);

  function renderUserOrLogin() {
    if (user) {
      return (
        <Typography sx={{display: 'inline'}}>Hello {user.username}</Typography>
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
          <h4>Kingsgate Pickleball</h4>
        </Box>
        <Box>
          <NavBarButton url='/'>Home</NavBarButton>
          {renderUserOrLogin()}
        </Box>

      </div>
    );
  }

  return render();
}