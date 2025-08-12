import { 
  Box, 
  Typography, 
  Paper, 
  Skeleton, 
  Alert,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { useEmail, useDeleteEmail } from '@/hooks/useEmails';
import ReplyIcon from '@mui/icons-material/Reply';
import ForwardIcon from '@mui/icons-material/Forward';
import DeleteIcon from '@mui/icons-material/Delete';

export default function EmailViewer({ emailId, onEmailDeleted }) {
  const { data: email, isLoading, error } = useEmail(emailId);
  const deleteMutation = useDeleteEmail();

  if (!emailId) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          p: 3
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Select an email to view its contents
        </Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" height={40} width="60%" />
        <Skeleton variant="text" height={30} width="40%" sx={{ mb: 2 }} />
        <Divider sx={{ my: 2 }} />
        <Skeleton variant="rectangular" height={200} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load email: {error.message}
        </Alert>
      </Box>
    );
  }

  if (!email) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Email not found</Typography>
      </Box>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(emailId);
      if (onEmailDeleted) {
        onEmailDeleted();
      }
    } catch (error) {
      console.error('Failed to delete email:', error);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Email Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderBottom: 1, 
          borderColor: 'divider',
          backgroundColor: 'white'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" gutterBottom>
              {email.subject || '(No subject)'}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              {email.to && (
                <Chip 
                  label={`To: ${email.to}`} 
                  size="small" 
                  variant="outlined"
                />
              )}
              {email.cc && (
                <Chip 
                  label={`CC: ${email.cc}`} 
                  size="small" 
                  variant="outlined"
                />
              )}
              {email.bcc && (
                <Chip 
                  label={`BCC: ${email.bcc}`} 
                  size="small" 
                  variant="outlined"
                />
              )}
            </Box>

            <Typography variant="caption" color="text.secondary">
              {new Date(email.created_at).toLocaleString()}
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Reply">
              <IconButton size="small">
                <ReplyIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Forward">
              <IconButton size="small">
                <ForwardIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton 
                size="small" 
                color="error"
                onClick={handleDelete}
                disabled={deleteMutation.isLoading}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Email Body */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3, backgroundColor: 'white' }}>
        <Typography 
          variant="body1" 
          sx={{ 
            whiteSpace: 'pre-wrap',
            lineHeight: 1.7
          }}
        >
          {email.body || '(No content)'}
        </Typography>
      </Box>
    </Box>
  );
}