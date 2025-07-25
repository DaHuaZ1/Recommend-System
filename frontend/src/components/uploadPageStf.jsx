import { useCallback, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import {
    Box,
    Typography,
    Button,
    Stack,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Backdrop,
    CircularProgress,
    TextField
} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CachedIcon from '@mui/icons-material/Cached';
import DeleteIcon from '@mui/icons-material/Delete';
import { Grid } from "@mui/material";
import TopBar from './BarStf';

import fileLogo from "../assets/file_logo.png";
import fileLogo2 from "../assets/file_logo2.png";
import backendURL from "../backendURL";

const steps = ["Project(s)", "Project Details"];

export default function UploadStf() {
    const [currentStep, setCurrentStep] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [formDatas, setFormDatas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const fileInputRef = useRef(null);
    const editingIndex = useRef(null);
    const formRef = useRef(null);

    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const primaryYellow = "#FFCB05";

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        accept: {
            "application/pdf": [".pdf"],
            "application/msword": [".doc"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
        },
        multiple: true,
        onDrop: useCallback(acceptedFiles => {
            if (acceptedFiles.length > 0) {
                setUploadedFiles(prev => [...prev, ...acceptedFiles]);
            }
        }, [])
    });

    const uploadProjects = async () => {
        const form = new FormData();
        uploadedFiles.forEach((file) => {
            form.append("projectFiles", file);
        });

        const res = await fetch(`${backendURL}/api/staff/projects`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: form,
        });
        if (!res.ok) throw new Error("Upload failed: " + res.status);
        const data = await res.json();
        // 后端返回 { status:"200", projects: [ ... ] }
        return data.projects;
    };

    const handleChangeFile = idx => {
        editingIndex.current = idx;
        fileInputRef.current?.click();
    };

    const handleFileSelect = event => {
        const files = event.target.files;
        if (files?.length > 0) {
            const file = files[0];
            const acceptedTypes = [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ];
            if (acceptedTypes.includes(file.type) || /\.(pdf|docx?)$/.test(file.name)) {
                setUploadedFiles(prev => {
                    const copy = [...prev];
                    copy[editingIndex.current] = file;
                    return copy;
                });
            } else {
                alert("Please select a valid file type (PDF, DOC, or DOCX)");
            }
        }
        event.target.value = '';
        editingIndex.current = null;
    };

    const handleRemoveFile = idx => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
    };

    const handleNextStep = async () => {
        if (currentStep === 0) {
            if (!uploadedFiles.length) return;
            setLoading(true);
            try {
                const projects = await uploadProjects();
                // 直接把后端返回的项目列表放到 formDatas
                setFormDatas(projects);
                setCurrentStep(1);
            } catch (err) {
                console.error(err);
                alert("Upload failed, please try again.");
            } finally {
                setLoading(false);
            }
        } else {
            if (formRef.current && !formRef.current.checkValidity()) {
                formRef.current.reportValidity();
                return;
            }
            setDialogOpen(true);
        }
    };

    const handlePrevStep = () => currentStep > 0 && setCurrentStep(currentStep - 1);

    const handleInputChange = (idx, e) => {
        const { name, value } = e.target;
        setFormDatas((prev) => {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], [name]: value };
            return copy;
        });
    };

    const handleDialogConfirm = async () => {
        setSaving(true);
        try {
            const payload = new FormData();
            payload.append("projects", JSON.stringify(formDatas));

            const res = await fetch(`${backendURL}/api/staff/projects`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: payload,
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            // 更新前端状态为最新
            setFormDatas(data.projects);
            setDialogOpen(false);
            navigate("/staff/index");
        } catch (err) {
            console.error("Saving projects failed:", err);
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDialogCancel = () => setDialogOpen(false);

    const ProgressBar = () => (
        <Box sx={{ width: "100%", mb: 2 }}>
            <Box sx={{ position: "relative", width: "100%" }}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: 0,
                        right: 0,
                        height: 4,
                        bgcolor: "#E0E0E0",
                        borderRadius: 2,
                        transform: "translateY(-50%)"
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: 0,
                        height: 4,
                        bgcolor: primaryYellow,
                        borderRadius: 2,
                        transform: "translateY(-50%)",
                        transition: "width 0.3s ease",
                        width: `${((currentStep + 1) / steps.length) * 100}%`
                    }}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                    {steps.map((_, idx) => (
                        <Box
                            key={idx}
                            sx={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                bgcolor: idx <= currentStep ? primaryYellow : "#E0E0E0",
                                border: "3px solid white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer"
                            }}
                            onClick={() => setCurrentStep(idx)}
                        >
                            <Typography variant="caption" sx={{ fontSize: 12, fontWeight: 700, color: idx <= currentStep ? "#000" : "#999" }}>
                                {idx < currentStep ? '✓' : idx + 1}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1, px: 1 }}>
                {steps.map((label, idx) => (
                    <Typography
                        key={idx}
                        variant="caption"
                        sx={{ fontSize: 11, color: idx <= currentStep ? "#000" : "#999", fontWeight: idx === currentStep ? 700 : 400, textAlign: "center", maxWidth: 80 }}
                    >
                        {label}
                    </Typography>
                ))}
            </Box>
        </Box>
    );

    return (
        <Box sx={{ bgcolor: "#fbfbfb", minHeight: '100vh' }}>
            {/* 顶部导航栏 */}
            <TopBar />
            <Stack spacing={4} sx={{ px: { xs: 2, sm: 6 }, py: 4, alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />

                {currentStep === 0 && (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            gap: 2,
                            width: { xs: "100%", sm: 600, md: 1200 },
                        }}
                    >
                        {/* Left: Dropzone */}
                        <Box
                            {...getRootProps()}
                            sx={{
                                flex: 1,
                                bgcolor: "#f7f9fa",
                                border: "2px dashed #bfbfbf",
                                borderRadius: 4,
                                textAlign: "center",
                                py: 6,
                                px: 2,
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                            onClick={() => open()}
                        >
                            <input {...getInputProps()} />
                            <img src={fileLogo2} alt="File Icon" style={{ width: 60, height: 60, marginBottom: 16 }} />
                            <Typography variant="h6" mb={2} sx={{ userSelect: "none" }}>
                                {isDragActive ? "Release to upload" : "Click or drag files here"}
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<CloudUploadIcon />}
                                sx={{ bgcolor: primaryYellow, color: "#000", fontWeight: 700, borderRadius: 2 }}
                            >
                                Open Files
                            </Button>
                            <Typography variant="caption" display="block" mt={2} color="text.secondary">
                                You can select multiple projects (PDF, DOC, DOCX)
                            </Typography>
                        </Box>

                        {/* Right: Uploaded files list */}
                        {uploadedFiles.length > 0 && (
                            <Box
                                sx={{
                                    flex: 1,
                                    maxHeight: { xs: "auto", md: 400 },
                                    overflowY: "auto"
                                }}
                            >
                                {uploadedFiles.map((file, idx) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            bgcolor: "#fff",
                                            p: 2,
                                            mb: 1,
                                            borderRadius: 2,
                                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                            <img src={fileLogo} alt="File" style={{ width: 40, height: 40 }} />
                                            <Box>
                                                <Typography variant="body1" sx={{ fontWeight: 500, wordBreak: "break-all" }}>
                                                    {file.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            <Button size="small" onClick={() => handleChangeFile(idx)} startIcon={<CachedIcon />}>
                                                Change
                                            </Button>
                                            <Button size="small" color="error" onClick={() => handleRemoveFile(idx)} startIcon={<DeleteIcon />}>
                                                Remove
                                            </Button>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                )}

                {/* Backdrop */}
                <Backdrop open={loading} sx={{ color: "#fff", zIndex: theme => theme.zIndex.drawer + 1 }}>
                    <CircularProgress color="inherit" />
                </Backdrop>

                {/* Multiple forms */}
                {currentStep === 1 && (
                    <Box
                        sx={{
                            width: "100%",
                            maxWidth: 1200,
                            // 设置最大高度，超出时滚动
                            maxHeight: 400,
                            overflowY: "auto",
                            // 居中
                            mx: "auto",
                        }}
                    >
                        <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
                            <Box>
                                {formDatas.map((data, idx) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            p: 3,
                                            bgcolor: "#fff",
                                            border: "1px solid #e0e0e0",
                                            borderRadius: 2,
                                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                        }}
                                    >
                                        <Typography variant="h6" mb={2} fontWeight={600}>
                                            Project #{idx + 1}
                                        </Typography>
                                        {/* <Grid container spacing={2}>
                                            {["projectTitle", "groupCapacity", "clientName", "projectNumber", "projectRequirements", "requiredSkills"].map((field) => (
                                                <Grid item xs={12} sm={6} key={field}>
                                                    <Box>
                                                        <Typography variant="body2" mb={0.5}>
                                                            {field.toUpperCase()}
                                                        </Typography>
                                                        <input
                                                            name={field}
                                                            type={field === "email" ? "email" : "text"}
                                                            value={data[field]}
                                                            onChange={(e) => handleInputChange(idx, e)}
                                                            placeholder={`Enter your ${field}`}
                                                            required
                                                            style={{
                                                                width: "100%",
                                                                padding: 8,
                                                                borderRadius: 4,
                                                                border: "1px solid #ccc",
                                                                fontSize: 16,
                                                            }}
                                                        />
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid> */}
                                        <Stack spacing={3}>
                                            <Grid container spacing={2}>
                                                {/* PROJECT TITLE */}
                                                <Grid item xs={12} sm={6} md={3}>
                                                    <Box>
                                                        <Typography variant="body2" mb={0.5}>
                                                            PROJECT TITLE
                                                        </Typography>
                                                        <input
                                                            name="projectTitle"
                                                            type="text"
                                                            value={data.projectTitle}
                                                            onChange={(e) => handleInputChange(idx, e)}
                                                            placeholder="Enter your project title"
                                                            required
                                                            style={{
                                                                width: "100%",
                                                                padding: "8px 12px",
                                                                borderRadius: 4,
                                                                border: "1px solid #ccc",
                                                                fontSize: 16,
                                                            }}
                                                        />
                                                    </Box>
                                                </Grid>

                                                {/* GROUP CAPACITY */}
                                                <Grid item xs={12} sm={6} md={3}>
                                                    <Box>
                                                        <Typography variant="body2" mb={0.5}>
                                                            GROUP CAPACITY
                                                        </Typography>
                                                        <input
                                                            name="groupCapacity"
                                                            type="number"
                                                            value={data.groupCapacity}
                                                            onChange={(e) => handleInputChange(idx, e)}
                                                            placeholder="Enter your group capacity"
                                                            required
                                                            style={{
                                                                width: "100%",
                                                                padding: "8px 12px",
                                                                borderRadius: 4,
                                                                border: "1px solid #ccc",
                                                                fontSize: 16,
                                                            }}
                                                        />
                                                    </Box>
                                                </Grid>

                                                {/* CLIENT NAME */}
                                                <Grid item xs={12} sm={6} md={3}>
                                                    <Box>
                                                        <Typography variant="body2" mb={0.5}>
                                                            CLIENT NAME
                                                        </Typography>
                                                        <input
                                                            name="clientName"
                                                            type="text"
                                                            value={data.clientName}
                                                            onChange={(e) => handleInputChange(idx, e)}
                                                            placeholder="Enter your client name"
                                                            required
                                                            style={{
                                                                width: "100%",
                                                                padding: "8px 12px",
                                                                borderRadius: 4,
                                                                border: "1px solid #ccc",
                                                                fontSize: 16,
                                                            }}
                                                        />
                                                    </Box>
                                                </Grid>

                                                {/* PROJECT NUMBER */}
                                                <Grid item xs={12} sm={6} md={3}>
                                                    <Box>
                                                        <Typography variant="body2" mb={0.5}>
                                                            PROJECT NUMBER
                                                        </Typography>
                                                        <input
                                                            name="projectNumber"
                                                            type="text"
                                                            value={data.projectNumber}
                                                            onChange={(e) => handleInputChange(idx, e)}
                                                            placeholder="Enter your project number"
                                                            required
                                                            style={{
                                                                width: "100%",
                                                                padding: "8px 12px",
                                                                borderRadius: 4,
                                                                border: "1px solid #ccc",
                                                                fontSize: 16,
                                                            }}
                                                        />
                                                    </Box>
                                                </Grid>
                                            </Grid>

                                            {/* PROJECT REQUIREMENTS */}
                                            <Box>
                                                <Typography variant="body2" mb={0.5}>
                                                    PROJECT REQUIREMENTS
                                                </Typography>
                                                <TextField
                                                    name="projectRequirements"
                                                    multiline
                                                    rows={4}       // 初始显示 4 行
                                                    maxRows={6}    // 最多扩展到 6 行，超出后会出现滚动条
                                                    value={data.projectRequirements}
                                                    onChange={(e) => handleInputChange(idx, e)}
                                                    placeholder="Enter your project requirements"
                                                    required
                                                    style={{
                                                        width: "100%",
                                                        fontSize: 16,
                                                    }}
                                                />
                                            </Box>

                                            {/* REQUIRED SKILLS */}
                                            <Box>
                                                <Typography variant="body2" mb={0.5}>
                                                    REQUIRED SKILLS
                                                </Typography>
                                                <TextField
                                                    name="requiredSkills"
                                                    multiline
                                                    rows={4}       // 初始显示 4 行
                                                    maxRows={6}    // 最多扩展到 6 行，超出后会出现滚动条
                                                    value={data.requiredSkills}
                                                    onChange={(e) => handleInputChange(idx, e)}
                                                    placeholder="Enter your required skills"
                                                    required
                                                    style={{
                                                        width: "100%",
                                                        fontSize: 16,
                                                    }}
                                                />
                                            </Box>
                                        </Stack>

                                    </Box>
                                ))}
                            </Box>
                        </form>
                    </Box>
                )}

                {/* Bottom progress card */}
                <Paper elevation={0} sx={{ width: { xs: "100%", sm: 600, md: 1200 }, p: 3, borderRadius: 4, border: "1px solid #F2F2F2", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                    <Typography variant="subtitle1" fontWeight={600} mb={2}>
                        Complete your Project(s)
                    </Typography>
                    <ProgressBar />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption">
                            Please complete your project(s) ({currentStep + 1}/{steps.length})
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            {currentStep > 0 && (
                                <Button variant="contained" size="small" onClick={handlePrevStep} sx={{ bgcolor: primaryYellow, transform: "scaleX(-1)" }}>
                                    ➔
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleNextStep}
                                disabled={currentStep === 0 && !uploadedFiles.length}
                                sx={{ bgcolor: primaryYellow }}
                            >
                                {currentStep >= steps.length - 1 ? "✔" : "➔"}
                            </Button>
                        </Box>
                    </Stack>
                </Paper>

                {/* Confirmation dialog */}
                <Dialog open={dialogOpen} onClose={handleDialogCancel}>
                    <DialogTitle>Save all projects?</DialogTitle>
                    <DialogContent>
                        <Typography>Please confirm to save and proceed to Home.</Typography>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
                        <Button color="error" onClick={handleDialogCancel} disabled={saving}>
                            Cancel
                        </Button>
                        <Button variant="contained" color="primary" onClick={handleDialogConfirm} disabled={saving}>
                            {saving ? "Saving..." : "Confirm"}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Stack>
        </Box>
    );
}
