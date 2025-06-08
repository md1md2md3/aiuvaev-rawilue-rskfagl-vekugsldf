import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // For unauthenticated users, show simple layout
  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box component="main" sx={{ flex: 1 }}>
          {children}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar onDrawerToggle={handleDrawerToggle} />
      
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar 
          open={isMobile ? sidebarOpen : true}
          onClose={() => setSidebarOpen(false)}
        />
        
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 3,
            marginLeft: isMobile ? 0 : sidebarOpen ? 0 : `-240px`,
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;