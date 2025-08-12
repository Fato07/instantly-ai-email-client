import { 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Typography, 
  Box,
  CircularProgress,
  Alert,
  Divider,
  Skeleton
} from '@mui/material';
import { useEmails } from '@/hooks/useEmails';

export default function EmailSidebar({ selectedEmailId, onEmailSelect }) {
  const { data: emails, isLoading, error } = useEmails();

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Box key={i} sx={{ mb: 2 }}>
            <Skeleton variant="text" height={20} />
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" height={20} width="60%" />
          </Box>
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          Failed to load emails: {error.message}
        </Alert>
      </Box>
    );
  }

  if (!emails || emails.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No emails yet. Click the compose button to create your first email!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">Inbox</Typography>
      </Box>
      <List sx={{ p: 0 }}>
        {emails.map((email, index) => (
          <Box key={email.id}>
            <ListItem disablePadding>
              <ListItemButton
                selected={selectedEmailId === email.id}
                onClick={() => onEmailSelect(email.id)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {email.to || 'No recipient'}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ 
                          display: 'block',
                          fontWeight: 600,
                          mb: 0.5
                        }}
                      >
                        {email.subject || '(No subject)'}
                      </Typography>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {email.body || '(No content)'}
                      </Typography>
                    </>
                  }
                />
              </ListItemButton>
            </ListItem>
            {index < emails.length - 1 && <Divider />}
          </Box>
        ))}
      </List>
    </Box>
  );
}