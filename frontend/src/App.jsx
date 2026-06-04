import React, { useState, useCallback } from 'react';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton, ListItemText, CssBaseline, Chip, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import WorkIcon from '@mui/icons-material/Work';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import ChatIcon from '@mui/icons-material/Chat';
import ResumeUpload from './components/ResumeUpload';
import JDUpload from './components/JDUpload';
import RankingTable from './components/RankingTable';
import RecruiterChat from './components/RecruiterChat';
import Dashboard from './components/Dashboard';
import { getHealth } from './utils/api';

const DRAWER_WIDTH = 230;

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon fontSize="small" /> },
  { id: 'resume', label: 'Upload Resume', icon: <UploadFileIcon fontSize="small" /> },
  { id: 'jd', label: 'Job Description', icon: <WorkIcon fontSize="small" /> },
  { id: 'rankings', label: 'Rankings', icon: <LeaderboardIcon fontSize="small" /> },
  { id: 'chat', label: 'Recruiter Chat', icon: <ChatIcon fontSize="small" /> },
];

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [rankedCandidates, setRankedCandidates] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [backendStatus, setBackendStatus] = useState('checking');

  React.useEffect(() => {
    const checkBackend = async () => {
      try {
        await getHealth();
        setBackendStatus('connected');
      } catch {
        setBackendStatus('disconnected');
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCandidateAdded = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleRanked = useCallback((candidates) => {
    setRankedCandidates(candidates);
    setActivePage('rankings');
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard refreshTrigger={refreshTrigger} />;
      case 'resume': return <ResumeUpload onCandidateAdded={handleCandidateAdded} />;
      case 'jd': return <JDUpload onRanked={handleRanked} />;
      case 'rankings': return <RankingTable rankedCandidates={rankedCandidates} refreshTrigger={refreshTrigger} />;
      case 'chat': return <RecruiterChat />;
      default: return <Dashboard refreshTrigger={refreshTrigger} />;
    }
  };

  const statusColor = backendStatus === 'connected' ? 'success' : backendStatus === 'checking' ? 'warning' : 'error';
  const statusLabel = backendStatus === 'connected' ? 'Backend Connected' : backendStatus === 'checking' ? 'Checking...' : 'Backend Disconnected';

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#1565C0' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight="bold">ATS Resume Matcher</Typography>
          <Chip label={statusLabel} color={statusColor} size="small" sx={{ color: 'white', fontWeight: 'bold' }} />
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', bgcolor: '#F5F5F5' },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {navItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                selected={activePage === item.id}
                onClick={() => setActivePage(item.id)}
                sx={{
                  '&.Mui-selected': { bgcolor: '#1565C0', color: 'white' },
                  '&.Mui-selected:hover': { bgcolor: '#1976D2' },
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5,
                  gap: 1.5,
                }}
              >
                <Box sx={{ color: activePage === item.id ? 'white' : '#1565C0' }}>
                  {item.icon}
                </Box>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 4, mt: 8 }}>
        {renderPage()}
      </Box>
    </Box>
  );
}