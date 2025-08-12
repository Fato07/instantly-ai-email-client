import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useClassifyIntent, useGenerateEmail, useStreamEmail } from '@/hooks/useAI';

export default function AIAssistantModal({ open, onClose, onGenerate, recipientEmail }) {
  const [prompt, setPrompt] = useState('');
  const [assistantType, setAssistantType] = useState(null);
  
  const classifyMutation = useClassifyIntent();
  const generateMutation = useGenerateEmail();
  const { startStreaming, isStreaming, streamedContent, error: streamError } = useStreamEmail();

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    try {
      // First, classify the intent
      const classification = await classifyMutation.mutateAsync(prompt);
      setAssistantType(classification.assistantType);

      // Then generate the email
      if (window.EventSource) {
        // Use streaming if supported
        startStreaming(prompt, classification.assistantType);
      } else {
        // Fallback to regular generation
        const generated = await generateMutation.mutateAsync({
          prompt,
          assistantType: classification.assistantType,
          recipientContext: recipientEmail
        });
        onGenerate(generated);
        handleClose();
      }
    } catch (error) {
      console.error('AI generation failed:', error);
    }
  };

  const handleAcceptStreamed = () => {
    onGenerate(streamedContent);
    handleClose();
  };

  const handleClose = () => {
    if (isStreaming || classifyMutation.isLoading || generateMutation.isLoading) return;
    setPrompt('');
    setAssistantType(null);
    onClose();
  };

  const isLoading = classifyMutation.isLoading || generateMutation.isLoading || isStreaming;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesomeIcon color="primary" />
        AI Email Assistant
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Describe what you want your email to be about, and I'll help you draft it.
          </Typography>

          <TextField
            label="What should the email be about?"
            placeholder="e.g., Meeting request for Tuesday, Follow up on our discussion, Sales pitch for our new product"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            disabled={isLoading}
            autoFocus
          />

          {assistantType && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">Assistant type:</Typography>
              <Chip 
                label={assistantType} 
                size="small" 
                color={assistantType === 'sales' ? 'primary' : 'secondary'}
              />
            </Box>
          )}

          {(classifyMutation.error || generateMutation.error || streamError) && (
            <Alert severity="error">
              Failed to generate email. Please try again.
            </Alert>
          )}

          {isStreaming && (
            <Box>
              <LinearProgress sx={{ mb: 2 }} />
              {streamedContent.subject && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Generated Subject:
                  </Typography>
                  <Typography variant="body2" sx={{ p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    {streamedContent.subject}
                  </Typography>
                </Box>
              )}
              {streamedContent.body && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Generated Body:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      p: 1, 
                      backgroundColor: '#f5f5f5', 
                      borderRadius: 1,
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {streamedContent.body}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        {streamedContent.subject && streamedContent.body ? (
          <Button
            onClick={handleAcceptStreamed}
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
          >
            Use This Email
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isLoading || !prompt.trim()}
            startIcon={isLoading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
          >
            {isLoading ? 'Generating...' : 'Generate Email'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}