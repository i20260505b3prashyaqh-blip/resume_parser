import React, { useState } from "react";
import { Box, Card, CardContent, Typography, Button, Alert, CircularProgress } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { uploadResume, storeCandidate } from "../utils/api";

export default function ResumeUpload({ onCandidateAdded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleFileChange = (e) => { setFile(e.target.files[0]); setAlert(null); };

  const handleSubmit = async () => {
    if (!file) { setAlert({ type: "error", msg: "Please select a file" }); return; }
    setLoading(true);
    try {
      const data = await uploadResume(file);
      const atsScore = Math.min(
        (data.skills?.length || 0) * 5 + (data.total_experience_years || 0) * 3 + (data.education?.length || 0) * 10,
        100
      );
      await storeCandidate({ ...data, ats_score: atsScore });
      setAlert({ type: "success", msg: `${data.name || "Resume"} uploaded successfully!` });
      setFile(null);
      if (onCandidateAdded) onCandidateAdded();
    } catch (e) {
      setAlert({ type: "error", msg: `Error: ${e.message}` });
    }
    setLoading(false);
  };

  return (
    <Box p={{ xs: 1.5, sm: 2.5, md: 3 }}pt={{ xs: 2.5, sm: 3, md: 4 }}>
      <Typography fontWeight="500" mb={2} sx={{ fontSize: { xs: 14, sm: 16, md: 18 } }}>Upload Resume</Typography>
      <Card elevation={2} sx={{ maxWidth: { xs: "100%", sm: 500, md: 550 } }}>
        <CardContent sx={{ p: { xs: "12px !important", sm: "16px !important" } }}>

          <Box
            sx={{
              border: "2px dashed #90CAF9",
              borderRadius: 2,
              height: { xs: 130, sm: 180, md: 220 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              mb: { xs: 1.5, sm: 2, md: 3 },
              "&:hover": { backgroundColor: "#E3F2FD" },
            }}
            onClick={() => document.getElementById("resume-input").click()}
          >
            <input id="resume-input" type="file" accept=".pdf" hidden onChange={handleFileChange} />
            <UploadFileIcon sx={{ fontSize: { xs: 32, sm: 45, md: 60 }, color: "#90CAF9", mb: 1 }} />
            <Typography sx={{ fontSize: { xs: 11, sm: 13, md: 14 }, color: "text.secondary" }}>Click to select a PDF resume</Typography>
            <Typography sx={{ mt: 0.5, textAlign: "center", px: 1, fontWeight: "medium", fontSize: { xs: 11, sm: 13, md: 14 } }}>
              {file ? file.name : "No file selected"}
            </Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            disabled={loading || !file}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <UploadFileIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
            sx={{ height: { xs: 38, sm: 44, md: 50 }, fontSize: { xs: 12, sm: 14 } }}
            onClick={handleSubmit}
          >
            {loading ? "Processing..." : "Upload & Parse Resume"}
          </Button>

          {alert && <Alert severity={alert.type} sx={{ mt: 1.5, fontSize: { xs: 12, sm: 14 } }}>{alert.msg}</Alert>}
        </CardContent>
      </Card>
    </Box>
  );
}