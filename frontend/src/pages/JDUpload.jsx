import React, { useState } from "react";
import { Box, Card, CardContent, Typography, Button, Alert, CircularProgress, Chip } from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { uploadJD, rankCandidates, getCandidates } from "../utils/api";

export default function JDUpload({ onRanked }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [jdData, setJdData] = useState(null);

  const handleFileChange = (e) => { setFile(e.target.files[0]); setAlert(null); };

  const handleSubmit = async () => {
    if (!file) { setAlert({ type: "warning", msg: "Please select a file" }); return; }
    setLoading(true);
    try {
      const extracted = await uploadJD(file);
      setJdData(extracted);
      const all = await getCandidates();
      if (all.candidates?.length > 0) {
        const ranked = await rankCandidates({
          required_skills: extracted.required_skills || [],
          required_experience: extracted.min_experience || 0,
          required_education: extracted.education || "Any",
          jd_text: extracted.required_skills?.join(", ") || "",
        });
        onRanked(ranked.candidates);
        setAlert({ type: "success", msg: "Candidates ranked! Check Rankings page." });
      } else {
        setAlert({ type: "warning", msg: "No candidates found. Upload resumes first." });
      }
      setFile(null);
    } catch (e) {
      setAlert({ type: "error", msg: `Error: ${e.message}` });
    }
    setLoading(false);
  };

  return (
    <Box p={{ xs: 1.5, sm: 2.5, md: 3 }}pt={{ xs: 2.5, sm: 3, md: 4 }}>
      <Typography fontWeight="500" mb={2} sx={{ fontSize: { xs: 14, sm: 16, md: 18 } }}>Upload Job Description</Typography>
      <Card elevation={2} sx={{ maxWidth: { xs: "100%", sm: 500, md: 550 } }}>
        <CardContent sx={{ p: { xs: "12px !important", sm: "16px !important" } }}>

          <Box
            sx={{
              border: "2px dashed #2E7D32",
              backgroundColor: "#E8F5E9",
              borderRadius: 2,
              height: { xs: 130, sm: 180, md: 220 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              mb: { xs: 1.5, sm: 2, md: 3 },
              "&:hover": { backgroundColor: "#DFF0E0" },
            }}
            onClick={() => document.getElementById("jd-input").click()}
          >
            <input id="jd-input" type="file" accept=".pdf" hidden onChange={handleFileChange} />
            <WorkIcon sx={{ fontSize: { xs: 32, sm: 45, md: 60 }, color: "#81C784", mb: 1 }} />
            <Typography sx={{ fontSize: { xs: 11, sm: 13, md: 14 }, color: "text.secondary" }}>Click to select a JD PDF</Typography>
            <Typography sx={{ mt: 0.5, textAlign: "center", px: 1, fontWeight: "medium", fontSize: { xs: 11, sm: 13, md: 14 } }}>
              {file ? file.name : "No file selected"}
            </Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            disabled={loading || !file}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
            sx={{ height: { xs: 38, sm: 44, md: 50 }, fontSize: { xs: 12, sm: 14 }, backgroundColor: "#2E7D32", "&:hover": { backgroundColor: "#1B5E20" } }}
            onClick={handleSubmit}
          >
            {loading ? "Analyzing..." : "Extract & Rank Candidates"}
          </Button>

          {alert && <Alert severity={alert.type} sx={{ mt: 1.5, fontSize: { xs: 12, sm: 14 } }}>{alert.msg}</Alert>}

          {jdData && (
            <Box sx={{ mt: 2, p: { xs: 1.5, sm: 2 }, backgroundColor: "#F5F5F5", borderRadius: 2 }}>
              <Typography sx={{ fontWeight: "bold", mb: 1, fontSize: { xs: 12, sm: 14 } }}>Required Skills</Typography>
              <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
                {jdData.required_skills?.map((s, i) => <Chip key={i} label={s} size="small" color="primary" variant="outlined" sx={{ fontSize: { xs: 10, sm: 12 } }} />)}
              </Box>
              <Typography sx={{ fontSize: { xs: 11, sm: 13 } }}>Experience: <strong>{jdData.min_experience} years</strong></Typography>
              <Typography sx={{ fontSize: { xs: 11, sm: 13 } }}>Education: <strong>{jdData.education}</strong></Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}