import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from 'dayjs';
import Slide from "@mui/material/Slide";

import backendURL from "../backendURL";

export default function ProjectSingle({ project, delay = 0 }) {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    projectTitle: "",
    clientName: "",
    groupCapacity: "",
    requiredSkills: "",
    projectRequirements: "",
    updatetime: ""
  });
  const originalData = useMemo(() => ({
    projectTitle: project.projectTitle || "",
    clientName: project.clientName || "",
    groupCapacity: project.groupCapacity || "",
    requiredSkills: project.requiredSkills || "",
    projectRequirements: project.projectRequirements || "",
    updatetime: project.updatetime || ""
  }), [project]);

  const isModified = useMemo(() => {
    return Object.keys(originalData).some(
      key => formData[key] !== originalData[key]
    );
  }, [formData, originalData]);

  const isStaff = true;

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open) {
      setFormData(originalData);
      setIsEditing(false);
    }
  }, [open, project]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    window.location.reload();
  };

  const handleDownload = () => {
    if (project.pdfFile) {
      window.open(backendURL + project.pdfFile, "_blank");
    }
  };

  const navigate = useNavigate();
  
  const handleReupload = () => {
    navigate('/staff/upload');
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append(
        "projects",
        JSON.stringify([{ projectNumber: project.projectNumber, ...formData }])
      );

      const res = await fetch(`${backendURL}/api/staff/projects`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status} — ${text}`);
      }

      // switch back to view mode; formData now holds updated values
      setIsEditing(false);
      window.location.reload();
    } catch (err) {
      console.error("保存项目出错:", err);
      alert("Saving projects failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const openDeleteDialog = () => setDeleteDialogOpen(true);
  const closeDeleteDialog = () => setDeleteDialogOpen(false);

  const confirmDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${backendURL}/api/staff/projects`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ projectNumber: project.projectNumber })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status} – ${text}`);
      }
      setOpen(false);
      closeDeleteDialog();
      window.location.reload();
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Failed to delete project: " + err.message);
    }
  };

  return (
    <>
      {/* 项目卡片 */}
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
            justifyContent: "space-between",
            alignItems: "flex-start",
            cursor: "pointer",
            bgcolor: "#f3f6ff",
            transition: "background 0.2s",
            "&:hover": { bgcolor: "#eaf0ff" }
          }}
        >
          {/* 左侧：项目信息 */}
          <Box sx={{ flex: 1, pr: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              {project.projectNumber
                ? `Project ${project.projectNumber}`
                : "Project"}
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                maxWidth: "600px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {project.projectTitle || "Project Title"}
            </Typography>
          </Box>

          {/* 右侧：Top Groups */}
          <Box
            sx={{
              width: 200,
              ml: 'auto',
              textAlign: 'right',
              alignSelf: 'flex-start',
              height: '73px',
            }}
          >
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ mb: 0.5 }}
            >
              Top Groups:
            </Typography>

            {project.topGroups && project.topGroups.length > 0 ? (
              <Box
                sx={{
                  // 每行大概 24px 行高，2 行 ≈ 48；给点余量设 60
                  maxHeight: project.topGroups.length > 2 ? 50 : 'none',
                  overflowY: project.topGroups.length > 2 ? 'auto' : 'visible',
                  pr: 0.5, // 给滚动条留点空间
                  // 默认窄滚动条 & 几乎透明
                  scrollbarWidth: 'thin', // Firefox
                  scrollbarColor: 'transparent transparent', // 默认透明

                  '&::-webkit-scrollbar': {
                    width: '6px', // 滚动条宽度
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'transparent', // 默认透明
                    borderRadius: '3px',
                    transition: 'background-color 0.3s',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'transparent',
                  },

                  // 鼠标悬停时滚动条显现
                  '&:hover': {
                    scrollbarColor: '#bbb transparent', // Firefox
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: '#bbb', // 悬停时颜色
                    },
                  },
                }}
              >
                {project.topGroups.map((group, idx) => (
                  <Typography
                    key={idx}
                    variant="body2"
                    sx={{ color: '#666', lineHeight: '20px', whiteSpace: 'nowrap' }}
                  >
                    {group.groupName} - {(group.score * 100).toFixed(2)}%
                  </Typography>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                None
              </Typography>
            )}
          </Box>
        </Paper>
      </Slide >

      {/* 详情弹窗 */}
      < Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth >
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <DialogTitle fontWeight={700}>{project.projectTitle}</DialogTitle>
        <DialogContent dividers>
          {/* Title */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>Title</Typography>
            {isEditing ? (
              <TextField
                name="projectTitle"
                fullWidth
                value={formData.projectTitle}
                onChange={handleChange}
              />
            ) : (
              <Typography color="text.secondary">
                {formData.projectTitle}
              </Typography>
            )}
          </Box>

          {/* Update Time */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>Update Time</Typography>
            <Typography color="text.secondary">
              {dayjs(formData.updatetime).format('YYYY-MM-DD HH:mm:ss')}
            </Typography>
          </Box>

          {/* Background */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>Background</Typography>
            <Typography color="text.secondary">Find on PDF file.</Typography>
          </Box>

          {/* Client Name */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>Client Name</Typography>
            {isEditing ? (
              <TextField
                name="clientName"
                fullWidth
                value={formData.clientName}
                onChange={handleChange}
              />
            ) : (
              <Typography color="text.secondary">
                {formData.clientName || 'TBD'}
              </Typography>
            )}
          </Box>

          {/* Group Capacity */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>Group Capacity</Typography>
            {isEditing ? (
              <TextField
                name="groupCapacity"
                fullWidth
                value={formData.groupCapacity}
                onChange={handleChange}
              />
            ) : (
              <Typography color="text.secondary">
                {formData.groupCapacity || 'TBD'}
              </Typography>
            )}
          </Box>

          {/* Required Skills */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>Required Skills</Typography>
            {isEditing ? (
              <TextField
                name="requiredSkills"
                fullWidth
                multiline
                minRows={1}
                maxRows={4}
                value={formData.requiredSkills}
                onChange={handleChange}
              />
            ) : (
              <Typography
                color="text.secondary"
                sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
              >
                {formData.requiredSkills || 'TBD'}
              </Typography>
            )}
          </Box>

          {/* Project Requirements */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>Project Requirements</Typography>
            {isEditing ? (
              <TextField
                name="projectRequirements"
                fullWidth
                multiline
                rows={4}
                value={formData.projectRequirements}
                onChange={handleChange}
              />
            ) : (
              <Typography
                color="text.secondary"
                sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
              >
                {formData.projectRequirements || 'TBD'}
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            flexDirection: "column",
            alignItems: "center",
            py: 2,
            gap: 1
          }}
        >
          {isEditing ? (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={handleSave}
                disabled={saving || !isModified}
              >
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button size="small" variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
            </Box>
          ) : (
            <>
              {isStaff && (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="warning"
                    onClick={handleReupload}
                  >
                    Reupload PDF
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    onClick={openDeleteDialog}
                  >
                    Delete
                  </Button>
                  <Button size="small" variant="contained" onClick={handleDownload}>
                    Download PDF
                  </Button>
                </Box>
              )}
            </>
          )}
        </DialogActions>

      </Dialog >

      {/* 删除确认弹窗 */}
      < Dialog open={deleteDialogOpen} onClose={closeDeleteDialog} >
        <DialogTitle>Delete Project?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this project?</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
          <Button color="error" onClick={closeDeleteDialog}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={confirmDelete}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog >
    </>
  );
}
