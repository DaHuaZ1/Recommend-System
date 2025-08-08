import React, { useState } from "react";
// MUI
import {
  CircularProgress,
  Paper,
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  IconButton,
  Slide,
  Tooltip
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation, useNavigate } from "react-router-dom"; 

export default function ProjectSingle({ project, delay = 0 }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation(); // 获取当前路径

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const navigate = useNavigate();
  const handleCheckDetails = () => {
    if (project.pdf) {
      // window.open(backendURL + project.pdfFile, "_blank");
      const binary = atob(project.pdf);
      const uint8 = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        uint8[i] = binary.charCodeAt(i);
      }
      navigate("/pdf-viewer", {
        state: { pdfData: uint8}
      });
    }
  };

  const rawScore = parseFloat(project?.final_score);
  const percentage = Number.isFinite(rawScore)
    ? Math.round(rawScore * 100)
    : 0;

  // choose color based on score
  const ringColor =
    percentage >= 75 ? "success.main" : percentage >= 50 ? "info.main" : "warning.main";

  return (
    <>
      <Slide
        direction="left"
        in={true}
        mountOnEnter
        unmountOnExit
        timeout={{ enter: 500, exit: 300 }}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <Paper
          elevation={3}
          onClick={handleOpen}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            bgcolor: "#f3f6ff",
            transition: "background 0.2s",
            "&:hover": { bgcolor: "#eaf0ff" }
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              {`Project ${project.projectNumber ?? ""}`}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{
                maxWidth: "600px",
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {project.projectTitle || "Project Title"}
            </Typography>
          </Box>

          {/* 仅在 /student/group/recommend 页面显示进度环 */}
          {pathname === "/student/group/recommend" && (
            <Tooltip
              title={`The final score is derived from complementarity score ${(project.complementarity_score * 100).toFixed(2)}% + match scores ${(project.match_score * 100).toFixed(2)}%.`}
              placement="top"
            >
              <Box sx={{ position: "relative", width: 60, height: 60, mr: 2.5, flexShrink: 0 }}>
                {/* Background track */}
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={60}
                  thickness={4}
                  sx={{ color: 'grey.300', position: 'absolute', top: 0, left: 0 }}
                />
                {/* Animated foreground */}
                <CircularProgress
                  variant="determinate"
                  value={percentage}
                  size={60}
                  thickness={4}
                  sx={{
                    color: ringColor,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transform: 'rotate(-90deg)',
                    transition: 'all 0.5s ease-out',
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round'
                    }
                  }}
                />
                {/* Percentage label */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={700} color={ringColor}>
                    {`${percentage}%`}
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
          )}
        </Paper>
      </Slide>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>

        <DialogTitle fontWeight={700}>{project.title}</DialogTitle>

        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Title
            </Typography>
            <Typography color="text.secondary">
              {project.projectTitle}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Background
            </Typography>
            <Typography color="text.secondary">
              Find on PDF file.
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Client Name
            </Typography>
            <Typography color="text.secondary">
              {project.clientName || "TBD"}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Group Capacity
            </Typography>
            <Typography color="text.secondary">
              {project.groupCapacity || "TBD"}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Required Skills
            </Typography>
            <Typography color="text.secondary">
              {project.requiredSkills || "TBD"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Project Requirements
            </Typography>
            <Typography color="text.secondary">
              {project.projectRequirements || "TBD"}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", py: 2 }}>
          <Button variant="contained" onClick={handleCheckDetails}>
            Check All Details
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}