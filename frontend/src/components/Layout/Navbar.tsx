import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  Settings,
  AccountCircle,
  Logout,
  Dashboard,
  School,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  onDrawerToggle?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onDrawerToggle }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleClose();
  };

  if (!isAuthenticated) {
    return (
      <AppBar position="static\" elevation={1}>
        <Toolbar>
          <School sx={{ mr: 2, color: 'white' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            EduLycée
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/login')}
              sx={{ 
                textTransform: 'none',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Se connecter
            </Button>
            <Button 
              color="inherit" 
              variant="outlined"
              onClick={() => navigate('/register')}
              sx={{ 
                textTransform: 'none',
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': { 
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)' 
                }
              }}
            >
              S'inscrire
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        {isMobile && onDrawerToggle && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <School sx={{ mr: 2, color: 'white' }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          EduLycée
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!isMobile && (
            <>
              <Button
                color="inherit"
                startIcon={<Dashboard />}
                onClick={() => navigate('/dashboard')}
                sx={{ 
                  textTransform: 'none',
                  backgroundColor: location.pathname === '/dashboard' ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Tableau de bord
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/library')}
                sx={{ 
                  textTransform: 'none',
                  backgroundColor: location.pathname === '/library' ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Bibliothèque
              </Button>
            </>
          )}

          <Tooltip title="Notifications">
            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Paramètres">
            <IconButton color="inherit" onClick={() => navigate('/settings')}>
              <Settings />
            </IconButton>
          </Tooltip>

          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
            sx={{ ml: 1 }}
          >
            <Avatar sx={{ width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' }}>
              {user?.username?.charAt(0).toUpperCase() || <AccountCircle />}
            </Avatar>
          </IconButton>
          
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem sx={{ minWidth: 200 }}>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user?.username}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/profile')}>
              <AccountCircle sx={{ mr: 2 }} />
              Profil
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/settings')}>
              <Settings sx={{ mr: 2 }} />
              Paramètres
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 2 }} />
              Déconnexion
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;