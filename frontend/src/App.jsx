import React, { useState, useEffect } from "react";

import Dashboard from "./pages/Dashboard";
import ResumeUpload from "./pages/ResumeUpload";
import JDUpload from "./pages/JDUpload";
import RankingTable from "./pages/RankingTable";
import RecruiterChat from "./pages/RecruiterChat";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import WorkIcon from "@mui/icons-material/Work";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import ChatIcon from "@mui/icons-material/Chat";

import { getHealth } from "./utils/api";

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <DashboardIcon />,
  },
  {
    id: "resume",
    label: "Upload Resume",
    icon: <UploadFileIcon />,
  },
  {
    id: "jd",
    label: "Job Description",
    icon: <WorkIcon />,
  },
  {
    id: "ranking",
    label: "Rankings",
    icon: <LeaderboardIcon />,
  },
  {
    id: "chat",
    label: "Recruiter Chat",
    icon: <ChatIcon />,
  },
];

export default function App() {
  const [selectedPage, setSelectedPage] = useState("dashboard");
  const [rankedCandidates, setRankedCandidates] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const check = async () => {
      try {
        await getHealth();
        setBackendStatus("connected");
      } catch {
        setBackendStatus("disconnected");
      }
    };

    check();

    const interval = setInterval(check, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleCandidateAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleRanked = (candidates) => {
    setRankedCandidates(candidates);
    setSelectedPage("ranking");
  };

  const handleNavClick = (id) => {
    setSelectedPage(id);
    setMobileOpen(false);
  };

  const renderPage = () => {
    switch (selectedPage) {
      case "dashboard":
        return (
          <Dashboard refreshTrigger={refreshTrigger} />
        );

      case "resume":
        return (
          <ResumeUpload
            onCandidateAdded={handleCandidateAdded}
          />
        );

      case "jd":
        return (
          <JDUpload onRanked={handleRanked} />
        );

      case "ranking":
        return (
          <RankingTable
            rankedCandidates={rankedCandidates}
            refreshTrigger={refreshTrigger}
          />
        );

      case "chat":
        return <RecruiterChat />;

      default:
        return (
          <Dashboard refreshTrigger={refreshTrigger} />
        );
    }
  };

  const drawerContent = (
  <List sx={{ pt: "64px" }}>
      {navItems.map((item) => (
        <ListItemButton
          key={item.id}
          selected={selectedPage === item.id}
          onClick={() => handleNavClick(item.id)}
        >
          <ListItemIcon>
            {item.icon}
          </ListItemIcon>

          <ListItemText primary={item.label} />
        </ListItemButton>
      ))}
    </List>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <Navbar
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        backendStatus={backendStatus}
      />

      <Sidebar
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        drawerContent={drawerContent}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "#f5f5f5",
          minHeight: "100vh",
          mt: "64px",
          overflow: "hidden",
          pt: {
            xs: 3,
            sm: 4,
            md: 4,
          },
        }}
      >
        {renderPage()}
      </Box>
    </Box>
  );
}