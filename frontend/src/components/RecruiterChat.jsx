import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { recruiterSearch } from '../utils/api';

export default function RecruiterChat() {
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi! Ask me questions like "Find Python developers with 5+ years" or "Show candidates for AI roles".' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { type: 'user', text: input }]);
    setInput('');
    setLoading(true);
    try {
      const response = await recruiterSearch(input);
      setMessages(prev => [...prev, { type: 'bot', text: response.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { type: 'bot', text: `Error: ${error.message}` }]);
    }
    setLoading(false);
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <SmartToyIcon sx={{ color: '#1565C0' }} />
        <Typography variant="h5" fontWeight="bold">Recruiter Assistant</Typography>
      </Box>
      <Paper elevation={2} sx={{ display: 'flex', flexDirection: 'column', height: 560 }}>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {messages.map((msg, idx) => (
            <Box key={idx} display="flex" justifyContent={msg.type === 'user' ? 'flex-end' : 'flex-start'} alignItems="flex-end" gap={1}>
              {msg.type === 'bot' && <SmartToyIcon sx={{ fontSize: 20, color: '#1565C0', mb: 0.5 }} />}
              <Box
                sx={{
                  maxWidth: '70%',
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: msg.type === 'user' ? '#1565C0' : 'white',
                  color: msg.type === 'user' ? 'white' : 'text.primary',
                  border: msg.type === 'bot' ? '1px solid #E0E0E0' : 'none',
                  fontSize: 14,
                }}
              >
                {msg.text}
              </Box>
            </Box>
          ))}
          {loading && (
            <Box display="flex" justifyContent="flex-start" alignItems="center" gap={1}>
              <SmartToyIcon sx={{ fontSize: 20, color: '#1565C0' }} />
              <Box sx={{ px: 2, py: 1.5, borderRadius: 2, bgcolor: 'white', border: '1px solid #E0E0E0' }}>
                <CircularProgress size={16} />
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Box sx={{ p: 2, borderTop: '1px solid #E0E0E0', display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about candidates..."
            disabled={loading}
          />
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            endIcon={<SendIcon />}
            sx={{ bgcolor: '#1565C0', '&:hover': { bgcolor: '#1976D2' }, px: 3 }}
          >
            Send
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ px: 2, pb: 1.5 }}>
          Try: "Find Python developers" · "Show senior engineers" · "Candidates for data science"
        </Typography>
      </Paper>
    </Box>
  );
}