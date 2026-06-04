import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { getCandidates } from '../utils/api';

export default function Dashboard({ refreshTrigger }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadStats(); }, [refreshTrigger]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await getCandidates();
      const candidates = data.candidates || [];
      if (candidates.length === 0) { setStats(null); return; }

      const avgScore = Math.round(
        candidates.reduce((sum, c) => sum + (parseFloat(c.ats_score) || 0), 0) / candidates.length
      );
      const avgExp = (
        candidates.reduce((sum, c) => sum + (parseFloat(c.experience) || 0), 0) / candidates.length
      ).toFixed(1);
      const skillsSet = new Set();
      candidates.forEach(c => c.skills?.split(',').forEach(s => skillsSet.add(s.trim().toLowerCase())));
      const recommendedCount = candidates.filter(c => parseFloat(c.ats_score) >= 70).length;

      setStats({ totalCandidates: candidates.length, avgScore, avgExperience: avgExp, uniqueSkills: skillsSet.size, recommendedCount });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
    setLoading(false);
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;
  if (!stats) return <Typography color="text.secondary" textAlign="center" mt={8}>No candidates yet. Upload resumes to see statistics.</Typography>;

  const statCards = [
    { label: 'Total Candidates', value: stats.totalCandidates, color: '#1565C0', bg: '#E3F2FD', icon: <PeopleIcon sx={{ fontSize: 40, color: '#1565C0' }} /> },
    { label: 'Avg ATS Score', value: stats.avgScore, color: '#2E7D32', bg: '#E8F5E9', icon: <EmojiEventsIcon sx={{ fontSize: 40, color: '#2E7D32' }} /> },
    { label: 'Avg Experience', value: `${stats.avgExperience} yrs`, color: '#6A1B9A', bg: '#F3E5F5', icon: <WorkHistoryIcon sx={{ fontSize: 40, color: '#6A1B9A' }} /> },
    { label: 'Recommended', value: stats.recommendedCount, color: '#E65100', bg: '#FBE9E7', icon: <ThumbUpIcon sx={{ fontSize: 40, color: '#E65100' }} /> },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3}>Dashboard</Typography>
      <Grid container spacing={3} mb={3}>
        {statCards.map((card, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card elevation={2} sx={{ bgcolor: card.bg }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {card.icon}
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>{card.label}</Typography>
                  <Typography variant="h4" fontWeight="bold" color={card.color}>{card.value}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Card elevation={2}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" mb={1}>Unique Skills Found</Typography>
          <Typography color="text.secondary">{stats.uniqueSkills} different skills across all candidates</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}