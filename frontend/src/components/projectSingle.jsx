import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import backendURL from "../backendURL";

export default function ProjectSingle({project}) {
  const [open, setOpen] = useState(false);

  /* ---------- 打开/关闭弹窗 ---------- */
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  /* ---------- 下载按钮回调（示例） ---------- */
  const handleDownload = () => {
    if (project.pdfFile) {
      window.open(backendURL+project.pdfFile, "_blank");
    }
  };

  return (
    <>
      {/* ---- 项目卡片 ---- */}
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
        {/* 左侧文字 */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            {"Project "+ project.projectNumber || "Project"}
          </Typography>
          <Typography color="text.secondary" sx={{ 
            maxWidth: "600px",
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {project.projectTitle || "Project Title"}
          </Typography>
        </Box>
      </Paper>

      {/* ---- 弹窗 ---- */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        {/* 关闭按钮 */}
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogTitle fontWeight={700}>{project.title}</DialogTitle>

        <DialogContent dividers>
          {/* block display = 默认纵向排列 */}
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

        {/* 底部 Download 按钮（居中） */}
        <DialogActions
          sx={{ justifyContent: "center", py: 2 }}
        >
          <Button variant="contained" onClick={handleDownload}>
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}