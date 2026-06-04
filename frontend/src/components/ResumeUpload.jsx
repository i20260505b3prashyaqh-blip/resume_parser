import React, { useState } from 'react';
import { Box, Button, Typography, Card, CardContent, Alert, CircularProgress } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { uploadResume, storeCandidate } from '../utils/api';

export default function ResumeUpload({ onCandidateAdded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleFileChange = (e) => { setFile(e.target.files[0]); setMessage(''); };

  const handleSubmit = async () => {
    if (!file) { setMessageType('error'); setMessage('Please select a file'); return; }
    setLoading(true);
    try {
      const candidateData = await uploadResume(file);
      const atsScore = Math.min(Math.round(
        (candidateData.skills?.length || 0) * 5 +
        (candidateData.total_experience_years || 0) * 3 +
        (candidateData.education?.length || 0) * 10
      ), 100);
      await storeCandidate({ ...candidateData, ats_score: atsScore });
      setMessageType('success');
      setMessage(`${candidateData.name || 'Resume'} uploaded and stored successfully!`);
      setFile(null);
      if (onCandidateAdded) onCandidateAdded();
    } catch (error) {
      setMessageType('error');
      setMessage(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <Box maxWidth={600}>
      <Typography variant="h6" fontWeight="bold" mb={3}>Upload Resume</Typography>
      <Card elevation={2}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box
            sx={{
              border: '2px dashed #90CAF9',
              borderRadius: 2,
              p: 5,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': { borderColor: '#1565C0', bgcolor: '#E3F2FD' },
              transition: 'all 0.2s',
            }}
            onClick={() => document.getElementById('resume-input').click()}
          >
            <input type="file" accept=".pdf" onChange={handleFileChange} hidden id="resume-input" />
            <UploadFileIcon sx={{ fontSize: 48, color: '#90CAF9', mb: 1 }} />
            <Typography color="text.secondary" variant="body2" mb={1}>Click to select a PDF resume</Typography>
            <Typography fontWeight="medium">{file ? file.name : 'No file selected'}</Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={loading || !file}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <UploadFileIcon />}
            sx={{ bgcolor: '#1565C0', '&:hover': { bgcolor: '#1976D2' } }}
          >
            {loading ? 'Processing...' : 'Upload & Parse Resume'}
          </Button>

          {message && (
            <Alert
              severity={messageType === 'success' ? 'success' : 'error'}
              icon={messageType === 'success' ? <CheckCircleIcon /> : undefined}
            >
              {message}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}