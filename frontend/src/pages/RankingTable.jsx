import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, CircularProgress,
  useMediaQuery, useTheme, Card, CardContent
} from "@mui/material";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import { getCandidates } from "../utils/api";

export default function RankingTable({ rankedCandidates, refreshTrigger }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (rankedCandidates?.length > 0) setCandidates(rankedCandidates);
    else loadCandidates();
  }, [rankedCandidates, refreshTrigger]);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const data = await getCandidates();
      setCandidates(data.candidates || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (loading) return <Box p={{ xs: 2, sm: 3 }}><CircularProgress size={24} /></Box>;
  if (!candidates.length) return (
    <Box p={{ xs: 2, sm: 3 }}>
      <Typography color="text.secondary" sx={{ fontSize: { xs: 13, sm: 15 } }}>No candidates yet. Upload resumes and a JD to see rankings.</Typography>
    </Box>
  );

  // Mobile — cards
  if (isMobile) {
    return (
      <Box p={1.5}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <LeaderboardIcon sx={{ color: "#1565C0", fontSize: 22 }} />
          <Typography fontWeight="500" sx={{ fontSize: 16 }}>Rankings ({candidates.length})</Typography>
        </Box>
        {candidates.map((c, i) => (
          <Card key={i} sx={{ mb: 1.5, boxShadow: 2 }}>
            <CardContent sx={{ p: "12px !important" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                <Typography fontWeight="bold" sx={{ fontSize: 13 }}>{i + 1}. {c.name || "N/A"}</Typography>
                <Chip label={`JD: ${c.jd_score || 0}`} size="small" color={(c.jd_score || 0) >= 70 ? "success" : "warning"} sx={{ fontSize: 10 }} />
              </Box>
              <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{c.email || "N/A"}</Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 0.8, alignItems: "center" }}>
                <Chip label={`ATS: ${c.ats_score || 0}`} size="small" sx={{ backgroundColor: "#1976D2", color: "white", fontSize: 10 }} />
                <Typography sx={{ fontSize: 11 }}>{c.experience || 0} yrs exp</Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.8 }}>
                {c.skills?.split(",").slice(0, 3).map((s, j) => (
                  <Chip key={j} label={s.trim()} variant="outlined" size="small" sx={{ fontSize: 10 }} />
                ))}
                {c.skills?.split(",").length > 3 && (
                  <Typography sx={{ fontSize: 10, alignSelf: "center", color: "text.secondary" }}>
                    +{c.skills.split(",").length - 3} more
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  // Desktop/Tablet — table
  return (
    <Box p={{ xs: 2, sm: 2.5, md: 3 }}pt={{ xs: 2.5, sm: 3, md: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <LeaderboardIcon sx={{ color: "#1565C0", fontSize: { sm: 26, md: 30 } }} />
        <Typography fontWeight="500" sx={{ fontSize: { sm: 18, md: 22 } }}>Ranked Candidates ({candidates.length})</Typography>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1565C0" }}>
              {["#", "Name", "Email", "JD Score", "ATS Score", "Experience", "Skills"].map(h => (
                <TableCell key={h} sx={{ color: "white", fontSize: { sm: 12, md: 14 }, py: { sm: 1, md: 1.5 } }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {candidates.map((c, index) => (
              <TableRow key={index} hover>
                <TableCell sx={{ fontSize: { sm: 12, md: 14 } }}>{index + 1}</TableCell>
                <TableCell sx={{ fontSize: { sm: 12, md: 14 } }}>{c.name || "N/A"}</TableCell>
                <TableCell sx={{ fontSize: { sm: 11, md: 13 } }}>{c.email || "N/A"}</TableCell>
                <TableCell>
                  <Chip label={c.jd_score || 0} size="small" sx={{ backgroundColor: (c.jd_score || 0) >= 70 ? "#2E7D32" : "#EF6C00", color: "white", fontSize: { sm: 11, md: 13 } }} />
                </TableCell>
                <TableCell>
                  <Chip label={c.ats_score || 0} size="small" sx={{ backgroundColor: "#1976D2", color: "white", fontSize: { sm: 11, md: 13 } }} />
                </TableCell>
                <TableCell sx={{ fontSize: { sm: 12, md: 14 } }}>{c.experience || 0} yrs</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {c.skills?.split(",").slice(0, 3).map((s, i) => (
                      <Chip key={i} label={s.trim()} variant="outlined" size="small" sx={{ fontSize: { sm: 10, md: 12 } }} />
                    ))}
                    {c.skills?.split(",").length > 3 && (
                      <Typography sx={{ fontSize: { sm: 10, md: 12 }, alignSelf: "center", color: "text.secondary" }}>
                        +{c.skills.split(",").length - 3} more
                      </Typography>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}