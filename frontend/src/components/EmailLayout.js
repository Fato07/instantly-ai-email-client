import { useState } from 'react';
import { Box, Container, Grid, Paper } from '@mui/material';
import EmailSidebar from './EmailSidebar';
import EmailViewer from './EmailViewer';
import ComposeEmail from './ComposeEmail';
import { Fab } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

export default function EmailLayout() {
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);

  const handleEmailSelect = (emailId) => {
    setSelectedEmailId(emailId);
  };

  const handleComposeOpen = () => {
    setComposeOpen(true);
  };

  const handleComposeClose = () => {
    setComposeOpen(false);
  };

  const handleEmailDeleted = () => {
    setSelectedEmailId(null);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Grid container spacing={0} sx={{ height: '100%' }}>
        {/* Email Sidebar - 30% width */}
        <Grid item xs={12} md={4} lg={3.5}>
          <Paper 
            elevation={0} 
            sx={{ 
              height: '100%', 
              borderRight: 1, 
              borderColor: 'divider',
              overflow: 'auto'
            }}
          >
            <EmailSidebar 
              selectedEmailId={selectedEmailId}
              onEmailSelect={handleEmailSelect}
            />
          </Paper>
        </Grid>

        {/* Email Viewer - 70% width */}
        <Grid item xs={12} md={8} lg={8.5}>
          <Paper 
            elevation={0} 
            sx={{ 
              height: '100%', 
              overflow: 'auto',
              backgroundColor: '#fafafa'
            }}
          >
            <EmailViewer 
              emailId={selectedEmailId} 
              onEmailDeleted={handleEmailDeleted}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Floating Action Button for Compose */}
      <Fab
        color="primary"
        aria-label="compose email"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1200
        }}
        onClick={handleComposeOpen}
      >
        <EditIcon />
      </Fab>

      {/* Compose Email Modal */}
      <ComposeEmail 
        open={composeOpen} 
        onClose={handleComposeClose}
      />
    </Box>
  );
}