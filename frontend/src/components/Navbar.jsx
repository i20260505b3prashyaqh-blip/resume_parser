import {
  AppBar,
  Toolbar,
  Typography,
  Chip,
  IconButton,
  Box,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";

export default function Navbar({
  isMobile,
  mobileOpen,
  setMobileOpen,
  backendStatus,
}) {
  return (
    <AppBar position="fixed" sx={{ zIndex: 1201 }}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            minWidth: 0,
          }}
        >
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            sx={{
              fontSize: {
                xs: "0.9rem",
                sm: "1.25rem",
              },
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            ATS Resume Matcher
          </Typography>
        </Box>

        <Chip
          label={
            backendStatus === "connected"
              ? isMobile
                ? "On"
                : "Connected"
              : backendStatus === "checking"
              ? isMobile
                ? "..."
                : "Checking..."
              : isMobile
              ? "Off"
              : "Disconnected"
          }
          color={
            backendStatus === "connected"
              ? "success"
              : backendStatus === "checking"
              ? "warning"
              : "error"
          }
          size="small"
          sx={{
            fontSize: {
              xs: "0.65rem",
              sm: "0.75rem",
            },
            height: {
              xs: 22,
              sm: 24,
            },
          }}
        />
      </Toolbar>
    </AppBar>
  );
}