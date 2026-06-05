import React, { useState, useRef, useEffect } from "react";
import { Box, Paper, Typography, TextField, Button, CircularProgress, useMediaQuery, useTheme } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SendIcon from "@mui/icons-material/Send";
import { recruiterSearch } from "../utils/api";

export default function RecruiterChat() {
  const [messages, setMessages] = useState([
    { type: "bot", text: 'Hi! Ask me questions like "Find Python developers with 5+ years" or "Show candidates for AI roles".' }
  ]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, { type: "user", text: message }]);
    const query = message;
    setMessage("");
    setLoading(true);
    try {
      const res = await recruiterSearch(query);
      setMessages(prev => [...prev, { type: "bot", text: res.reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { type: "bot", text: `Error: ${e.message}` }]);
    }
    setLoading(false);
  };

  const chatHeight = isMobile ? "calc(100vh - 180px)" : isTablet ? "520px" : "600px";

  return (
    <Box p={{ xs: 1.5, sm: 2.5, md: 3 }}pt={{ xs: 2.5, sm: 3, md: 4 }}>
      <Typography fontWeight="500" mb={2} sx={{ fontSize: { xs: 14, sm: 16, md: 18 } }}>Recruiter Chat</Typography>
      <Paper
        elevation={3}
        sx={{
          height: chatHeight,
          display: "flex",
          flexDirection: "column",
          p: { xs: 1, sm: 1.5, md: 2 },
        }}
      >
        {/* Messages */}
        <Box sx={{
          flexGrow: 1,
          overflowY: "auto",
          border: "1px solid #E0E0E0",
          borderRadius: 1,
          backgroundColor: "#FAFAFA",
          p: { xs: 1, sm: 1.5, md: 2 },
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}>
          {messages.map((msg, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                justifyContent: msg.type === "user" ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                gap: 0.5,
              }}
            >
              {msg.type === "bot" && (
                <SmartToyIcon color="primary" sx={{ fontSize: { xs: 16, sm: 18, md: 20 }, mb: 0.5 }} />
              )}
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 1, sm: 1.2, md: 1.5 },
                  maxWidth: isMobile ? "88%" : "70%",
                  backgroundColor: msg.type === "user" ? "#1565C0" : "white",
                  color: msg.type === "user" ? "white" : "inherit",
                }}
              >
                <Typography sx={{ fontSize: { xs: 11, sm: 13, md: 14 } }}>{msg.text}</Typography>
              </Paper>
            </Box>
          ))}
          {loading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <SmartToyIcon color="primary" sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
              <CircularProgress size={14} />
            </Box>
          )}
          <div ref={bottomRef} />
        </Box>

        {/* Input */}
        <Box sx={{ display: "flex", gap: 1, mt: { xs: 1, sm: 1.5 } }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ask about candidates..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
            sx={{ "& input": { fontSize: { xs: 12, sm: 13, md: 14 } } }}
          />
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={loading || !message.trim()}
            size="small"
            sx={{ px: { xs: 1.5, sm: 2 }, fontSize: { xs: 11, sm: 13 } }}
            endIcon={!isMobile && <SendIcon sx={{ fontSize: { sm: 16, md: 18 } }} />}
          >
            {isMobile ? <SendIcon sx={{ fontSize: 16 }} /> : "Send"}
          </Button>
        </Box>

        {!isMobile && (
          <Typography sx={{ mt: 1, color: "#555", fontSize: { sm: 11, md: 13 } }}>
            Try: "Find Python developers", "Show senior engineers", "Candidates for data science"
          </Typography>
        )}
      </Paper>
    </Box>
  );
}