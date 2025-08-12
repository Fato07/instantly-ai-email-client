import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useCreateEmail } from '@/hooks/useEmails';
import AIAssistantModal from './AIAssistantModal';

export default function ComposeEmail({ open, onClose }) {
  const [emailData, setEmailData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: ''
  });
  const [aiModalOpen, setAiModalOpen] = useState(false);
  
  const createEmailMutation = useCreateEmail();

  const handleChange = (field) => (event) => {
    setEmailData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSend = async (sendImmediately = false) => {
    if (!emailData.to || !emailData.subject) {
      alert('Please fill in the To and Subject fields');
      return;
    }

    try {
      await createEmailMutation.mutateAsync({
        ...emailData,
        sendImmediately
      });
      // Reset form and close
      setEmailData({
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        body: ''
      });
      onClose();
    } catch (error) {
      console.error('Failed to send email:', error);
      alert(error.message || 'Failed to send email');
    }
  };

  const handleAIGenerate = (generatedContent) => {
    setEmailData(prev => ({
      ...prev,
      subject: generatedContent.subject || prev.subject,
      body: generatedContent.body || prev.body
    }));
  };

  const handleClose = () => {
    if (createEmailMutation.isLoading) return;
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '70vh' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Compose Email
            <Tooltip title="Use AI to generate email content">
              <Chip
                icon={<AutoAwesomeIcon />}
                label="AI"
                size="small"
                color="primary"
                onClick={() => setAiModalOpen(true)}
                sx={{ cursor: 'pointer' }}
              />
            </Tooltip>
          </Box>
          <IconButton onClick={handleClose} disabled={createEmailMutation.isLoading}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="To"
              value={emailData.to}
              onChange={handleChange('to')}
              fullWidth
              required
              variant="outlined"
              size="small"
            />
            
            <TextField
              label="CC"
              value={emailData.cc}
              onChange={handleChange('cc')}
              fullWidth
              variant="outlined"
              size="small"
            />
            
            <TextField
              label="BCC"
              value={emailData.bcc}
              onChange={handleChange('bcc')}
              fullWidth
              variant="outlined"
              size="small"
            />
            
            <TextField
              label="Subject"
              value={emailData.subject}
              onChange={handleChange('subject')}
              fullWidth
              required
              variant="outlined"
              size="small"
            />
            
            <TextField
              label="Body"
              value={emailData.body}
              onChange={handleChange('body')}
              fullWidth
              multiline
              rows={12}
              variant="outlined"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleClose} disabled={createEmailMutation.isLoading}>
            Cancel
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button
            onClick={() => handleSend(false)}
            variant="outlined"
            disabled={createEmailMutation.isLoading || !emailData.to || !emailData.subject}
          >
            Save Draft
          </Button>
          <Button
            onClick={() => handleSend(true)}
            variant="contained"
            startIcon={createEmailMutation.isLoading ? <CircularProgress size={20} /> : <SendIcon />}
            disabled={createEmailMutation.isLoading || !emailData.to || !emailData.subject}
          >
            {createEmailMutation.isLoading ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Assistant Modal */}
      <AIAssistantModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onGenerate={handleAIGenerate}
        recipientEmail={emailData.to}
      />
    </>
  );
}