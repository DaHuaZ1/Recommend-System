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

export default function ProjectSingle() {
  const [open, setOpen] = useState(false);

  /* ---------- 打开/关闭弹窗 ---------- */
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  /* ---------- 下载按钮回调（示例） ---------- */
  const handleDownload = () => {
    // TODO: 替换为实际下载逻辑
    console.log("Download triggered");
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
            Project 26
          </Typography>
          <Typography color="text.secondary">
            Project Information……
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

        <DialogTitle fontWeight={700}>Project 26 Details</DialogTitle>

        <DialogContent dividers>
          {/* block display = 默认纵向排列 */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Scope
            </Typography>
            <Typography color="text.secondary">
              Build a full-stack web application helping students match with
              projects based on their skillsets and interests.
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Requirement
            </Typography>
            <Typography color="text.secondary">
              {/* • Responsive UI • RESTful API • Authentication • Unit / UI tests */}
              React | Node.js | MongoDB | Jest | Docker
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Background
            </Typography>
            <Typography color="text.secondary">
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx<br />
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
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