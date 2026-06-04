import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress } from '@mui/material';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import { getCandidates } from '../utils/api';

export default function RankingTable({ rankedCandidates, refreshTrigger }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rankedCandidates?.length > 0) setCandidates(rankedCandidates);
    else loadCandidates();
  }, [rankedCandidates, refreshTrigger]);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const data = await getCandidates();
      setCandidates(data.candidates || []);
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;
  if (!candidates?.length) return (
    <Typography color="text.secondary" textAlign="center" mt={8}>
      No candidates yet. Upload resumes and a job description to see rankings.
    </Typography>
  );

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <LeaderboardIcon sx={{ color: '#1565C0' }} />
        <Typography variant="h5" fontWeight="bold">Ranked Candidates ({candidates.length})</Typography>
      </Box>
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ bgcolor: '#1565C0' }}>
            <TableRow>
              {['#', 'Name', 'Email', 'JD Score', 'ATS Score', 'Experience', 'Skills'].map(h => (
                <TableCell key={h} sx={{ color: 'white', fontWeight: 'bold' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {candidates.map((c, idx) => (
              <TableRow key={idx} hover>
                <TableCell>{idx + 1}</TableCell>
                <TableCell><Typography fontWeight="medium">{c.name || 'N/A'}</Typography></TableCell>
                <TableCell>{c.email || 'N/A'}</TableCell>
                <TableCell>
                  <Chip
                    label={c.jd_score || 0}
                    size="small"
                    color={(c.jd_score || 0) >= 70 ? 'success' : 'warning'}
                    sx={{ fontWeight: 'bold' }}
                  />
                </TableCell>
                <TableCell>
                  <Chip label={c.ats_score || 0} size="small" color="primary" sx={{ fontWeight: 'bold' }} />
                </TableCell>
                <TableCell>{c.experience || 0} yrs</TableCell>
                <TableCell>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {c.skills?.split(',').slice(0, 3).map((skill, i) => (
                      <Chip key={i} label={skill.trim()} size="small" variant="outlined" />
                    ))}
                    {c.skills?.split(',').length > 3 && (
                      <Typography variant="caption" color="text.secondary" alignSelf="center">
                        +{c.skills.split(',').length - 3} more
                      </Typography>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="caption" color="text.secondary" mt={2} display="block">
        JD Score = skill match (50%) + experience (30%) + education (20%)
      </Typography>
    </Box>
  );
}