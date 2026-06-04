import React, { useState } from 'react';
import { Box, Button, Typography, Card, CardContent, Alert, CircularProgress, Chip } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { uploadJD, rankCandidates, getCandidates } from '../utils/api';

export default function JDUpload({ onRanked }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [jdData, setJdData] = useState(null);

  const handleFileChange = (e) => { setFile(e.target.files[0]); setMessage(''); };

  const handleSubmit = async () => {
    if (!file) { setMessageType('warning'); setMessage('Please select a JD file'); return; }
    setLoading(true);
    try {
      const extracted = await uploadJD(file);
      setJdData(extracted);
      const allCandidates = await getCandidates();
      if (allCandidates.candidates?.length > 0) {
        const ranked = await rankCandidates({
          required_skills: extracted.required_skills || [],
          required_experience: extracted.min_experience || 0,
          required_education: extracted.education || 'Any',
          jd_text: extracted.required_skills?.join(', ') || '',
        });
        onRanked(ranked.candidates);
        setMessageType('success');
        setMessage('Candidates ranked! Check the Rankings page.');
      } else {
        setMessageType('warning');
        setMessage('No candidates found. Upload resumes first.');
      }
      setFile(null);
    } catch (error) {
      setMessageType('error');
      setMessage(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <Box maxWidth={600}>
      <Typography variant="h5" fontWeight="bold" mb={3}>Upload Job Description</Typography>
      <Card elevation={2}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box
            sx={{
              border: '2px dashed #A5D6A7',
              borderRadius: 2,
              p: 5,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': { borderColor: '#2E7D32', bgcolor: '#E8F5E9' },
              transition: 'all 0.2s',
            }}
            onClick={() => document.getElementById('jd-input').click()}
          >
            <input type="file" accept=".pdf" onChange={handleFileChange} hidden id="jd-input" />
            <WorkIcon sx={{ fontSize: 48, color: '#A5D6A7', mb: 1 }} />
            <Typography color="text.secondary" variant="body2" mb={1}>Click to select a JD PDF</Typography>
            <Typography fontWeight="medium">{file ? file.name : 'No file selected'}</Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={loading || !file}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
            sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#388E3C' } }}
          >
            {loading ? 'Analyzing...' : 'Extract & Rank Candidates'}
          </Button>

          {message && <Alert severity={messageType}>{message}</Alert>}

          {jdData && (
            <Box sx={{ bgcolor: '#F5F5F5', borderRadius: 2, p: 2 }}>
              <Typography fontWeight="bold" mb={1}>Extracted Requirements</Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
                {jdData.required_skills?.map((skill, i) => (
                  <Chip key={i} label={skill} size="small" color="primary" variant="outlined" />
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary">Min Experience: <strong>{jdData.min_experience} years</strong></Typography>
              <Typography variant="body2" color="text.secondary">Education: <strong>{jdData.education}</strong></Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}