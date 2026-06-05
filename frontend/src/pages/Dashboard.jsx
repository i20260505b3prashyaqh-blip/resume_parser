import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
} from "@mui/material";

import PeopleIcon from "@mui/icons-material/People";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";

import { getCandidates } from "../utils/api";

export default function Dashboard({ refreshTrigger }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, [refreshTrigger]);

  const loadStats = async () => {
    setLoading(true);

    try {
      const data = await getCandidates();
      const list = data.candidates || [];

      if (!list.length) {
        setStats(null);
        setLoading(false);
        return;
      }

      const skillsSet = new Set();

      list.forEach((candidate) => {
        candidate.skills
          ?.split(",")
          .forEach((skill) =>
            skillsSet.add(skill.trim().toLowerCase())
          );
      });

      setStats({
        totalCandidates: list.length,

        avgScore: Math.round(
          list.reduce(
            (sum, candidate) =>
              sum +
              (parseFloat(candidate.ats_score) || 0),
            0
          ) / list.length
        ),

        avgExperience: (
          list.reduce(
            (sum, candidate) =>
              sum +
              (parseFloat(candidate.experience) || 0),
            0
          ) / list.length
        ).toFixed(1),

        recommended: list.filter(
          (candidate) =>
            parseFloat(candidate.ats_score) >= 70
        ).length,

        uniqueSkills: skillsSet.size,
      });
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <Box
        p={{ xs: 2, sm: 4 }}
        display="flex"
        justifyContent="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box p={{ xs: 2, sm: 4 }}>
        <Typography color="text.secondary">
          No candidates yet. Upload resumes to see
          stats.
        </Typography>
      </Box>
    );
  }

  const statCards = [
    {
      label: "Total Candidates",
      value: stats.totalCandidates,
      icon: (
        <PeopleIcon
          sx={{
            fontSize: {
              xs: 30,
              sm: 40,
              md: 50,
            },
            color: "#1565C0",
          }}
        />
      ),
      bg: "#E3F2FD",
    },
    {
      label: "Avg ATS Score",
      value: stats.avgScore,
      icon: (
        <EmojiEventsIcon
          sx={{
            fontSize: {
              xs: 30,
              sm: 40,
              md: 50,
            },
            color: "#2E7D32",
          }}
        />
      ),
      bg: "#E8F5E9",
    },
    {
      label: "Avg Experience",
      value: `${stats.avgExperience} yrs`,
      icon: (
        <WorkHistoryIcon
          sx={{
            fontSize: {
              xs: 30,
              sm: 40,
              md: 50,
            },
            color: "#6A1B9A",
          }}
        />
      ),
      bg: "#F3E5F5",
    },
    {
      label: "Recommended",
      value: stats.recommended,
      icon: (
        <ThumbUpIcon
          sx={{
            fontSize: {
              xs: 30,
              sm: 40,
              md: 50,
            },
            color: "#E65100",
          }}
        />
      ),
      bg: "#FFF3E0",
    },
  ];

  return (
    <Box p={{ xs: 2, sm: 3, md: 4 }}>
      <Typography
        fontWeight="600"
        sx={{
          fontSize: {
            xs: 14,
            sm: 16,
            md: 18,
          },
          mb: {
            xs: 2,
            sm: 3,
            md: 4,
          },
        }}
      >
        Dashboard
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {statCards.map((card, index) => (
          <Grid
            item
            xs={6}
            sm={6}
            md={3}
            key={index}
          >
            <Card
              sx={{
                backgroundColor: card.bg,
                boxShadow: 2,
                height: "100%",
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: {
                    xs: 1,
                    sm: 2,
                  },
                }}
              >
                {card.icon}

                <Box>
                  <Typography
                    sx={{
                      fontSize: {
                        xs: 11,
                        sm: 13,
                        md: 14,
                      },
                      color: "text.secondary",
                    }}
                  >
                    {card.label}
                  </Typography>

                  <Typography
                    fontWeight="bold"
                    sx={{
                      fontSize: {
                        xs: 18,
                        sm: 24,
                        md: 30,
                      },
                    }}
                  >
                    {card.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card
        sx={{
          mt: {
            xs: 2,
            sm: 3,
            md: 4,
          },
          boxShadow: 2,
        }}
      >
        <CardContent>
          <Typography
            sx={{
              fontSize: {
                xs: 15,
                sm: 17,
                md: 18,
              },
              fontWeight: 600,
              mb: 1,
            }}
          >
            Unique Skills Found
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              fontSize: {
                xs: 13,
                sm: 15,
                md: 16,
              },
            }}
          >
            {stats.uniqueSkills} different skills
            across all candidates
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}