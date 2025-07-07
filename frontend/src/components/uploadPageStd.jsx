import { useCallback, useState, useRef} from "react";
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
  CircularProgress
} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CachedIcon from '@mui/icons-material/Cached';

import fileLogo from "../assets/file_logo.png";
import fileLogo2 from "../assets/file_logo2.png";

import backendURL from "../backendURL";

const steps = ["Resume", "Personal Info"]; // 2个步骤

export default function UploadStd() {
  const [currentStep, setCurrentStep] = useState(0); // 当前步骤状态
  const [uploadedFile, setUploadedFile] = useState(null); // 上传的文件状态
  const [formData, setFormData] = useState({
    name: "",
    skill: "",
    major: "",
    email: ""
  });
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false); // 控制弹窗
  const [saving, setSaving] = useState(false); // 保存中
  const fileInputRef = useRef(null); // 文件输入引用
  const formRef = useRef(null);

  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  // 发送简历给后端识别
  const uploadResume = async () => {
    const body = new FormData();
    body.append("resume", uploadedFile);
    console.log("body:", body);

    const res = await fetch(`${backendURL}/api/student/resume`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body,
      // 注意：FormData会自动设置Content-Type
      // "Content-Type": "multipart/form-data"                   
    });

    if (!res.ok) {
      throw new Error(`Upload failed: ${res.status}`);
    }
    return res.json();
  };

  /* ---------- 拖拽上传逻辑 ---------- */
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
      console.log("Selected files:", acceptedFiles);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      // 按需限制文件类型
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"]
    },
    maxFiles: 1,
    onDrop
  });

  /* ---------- 颜色与样式常量 ---------- */
  const primaryYellow = "#FFCB05"; // GitHub 风格的亮黄

  /* ---------- 下一步按钮处理函数 ---------- */
  const handleNextStep = async () => {
    if (currentStep === 0) {
      try {
        setLoading(true);
        const profile = await uploadResume();
        setFormData({
          name: profile.name || "",
          skill: profile.skill || "",
          major: profile.major || "",
          email: profile.email || ""
        });
        setCurrentStep(1);
      } catch (err) {
        alert("Upload failed, please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 1) {
      if (formRef.current) {
        const isValid = formRef.current.checkValidity();
        if (!isValid) {
          formRef.current.reportValidity();
          return;
        }
      }
      setDialogOpen(true);
    }
  };

  /* ---------- 上一步按钮处理函数 ---------- */
  const handlePrevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  /* ---------- 重新上传文件处理函数 ---------- */
  const handleChangeFile = () => {
    fileInputRef.current?.click();
  };

  /* ---------- 文件选择处理函数 ---------- */
  const handleFileSelect = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // 检查文件类型
      const acceptedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ];
      
      if (acceptedTypes.includes(file.type) || 
          file.name.endsWith('.pdf') || 
          file.name.endsWith('.doc') || 
          file.name.endsWith('.docx')) {
        setUploadedFile(file);
        console.log("Selected file:", file);
      } else {
        alert("Please select a valid file type (PDF, DOC, or DOCX)");
      }
    }
    // 重置input值，允许选择相同文件
    event.target.value = '';
  };

  // 表单输入处理
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /* ---------- 确认保存函数 ---------- */
  const handleDialogConfirm = async () => {
    setSaving(true);
    try {
      // 1. 发送到后端
      const res = await fetch(`${backendURL}/api/student/profile`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
         },
        body: JSON.stringify(formData)
      });
      console.log("Response:", res);
      // 2. 本地存储
      localStorage.setItem("student_profile", JSON.stringify(formData));
      // 3. 跳转
      navigate("/student/index");
    } catch (err) {
      alert("Saving profile failed. Please try again.");
      console.error("Error saving profile:", err);
    } finally {
      setSaving(false);
      setDialogOpen(false);
    }
  };

  /* ---------- 取消保存函数 ---------- */
  const handleDialogCancel = () => {
    setDialogOpen(false);
  };

  /* ---------- 自定义进度条组件 ---------- */
  const ProgressBar = () => (
    <Box sx={{ width: "100%", mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          position: "relative"
        }}
      >
        {/* 背景进度条 */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: 4,
            bgcolor: "#E0E0E0",
            borderRadius: 2,
            transform: "translateY(-50%)",
            zIndex: 1
          }}
        />
        
        {/* 填充进度条 */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: 0,
            height: 4,
            bgcolor: primaryYellow,
            borderRadius: 2,
            transform: "translateY(-50%)",
            zIndex: 2,
            transition: "width 0.3s ease",
            width: `${((currentStep + 1) / steps.length) * 100}%`
          }}
        />

        {/* 步骤点 */}
        {steps.map((step, index) => (
          <Box
            key={index}
            sx={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              bgcolor: index <= currentStep ? primaryYellow : "#E0E0E0",
              border: "3px solid white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              zIndex: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              cursor: "pointer",
              "&:hover": {
                transform: "scale(1.1)"
              }
            }}
            onClick={() => setCurrentStep(index)}
          >
            {index < currentStep ? (
              <Typography
                variant="caption"
                sx={{
                  color: "#000",
                  fontWeight: "bold",
                  fontSize: "12px"
                }}
              >
                ✓
              </Typography>
            ) : (
              <Typography
                variant="caption"
                sx={{
                  color: index <= currentStep ? "#000" : "#999",
                  fontWeight: "bold",
                  fontSize: "12px"
                }}
              >
                {index + 1}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      {/* 步骤标签 */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 1,
          px: 1
        }}
      >
        {steps.map((step, index) => (
          <Typography
            key={index}
            variant="caption"
            sx={{
              color: index <= currentStep ? "#000" : "#999",
              fontWeight: index === currentStep ? "bold" : "normal",
              fontSize: "11px",
              textAlign: "center",
              maxWidth: 80,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {step}
          </Typography>
        ))}
      </Box>
    </Box>
  );

  return (
    <Stack spacing={4} sx={{ px: { xs: 2, sm: 6 }, py: 4, alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* 步骤一：上传简历 */}
      {currentStep === 0 && (
        <Box
          {...getRootProps()}
          sx={{
            mx: "auto",
            width: { xs: "100%", sm: 600 },
            bgcolor: "#f7f9fa",
            border: "2px dashed #bfbfbf",
            borderRadius: 4,
            textAlign: "center",
            py: 8,
            px: 2,
            cursor: "pointer",
          }}
        >
          <input {...getInputProps()} />

          {!uploadedFile ? (
            <>
              <img
                src={fileLogo2}
                alt="File Icon"
                style={{ width: 60, height: 60, marginBottom: 16 }}
              />
              <Typography
                variant="h6"
                color="#000"
                mb={2}
                sx={{ userSelect: "none" }}
              >
                {isDragActive
                  ? "Release to upload"
                  : "Click to open or drag here"}
              </Typography>
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#ffcd7d",
                  color: "#000",
                  fontWeight: "bold",
                  borderRadius: 2,
                  px: 4,
                  "&:hover": { bgcolor: "#ffebcb" }
                }}
                startIcon={<CloudUploadIcon />}
              >
                Open File
              </Button>
              <Typography
                variant="caption"
                color="text.secondary"
                display={"block"}
                mt={3}
              >
                Supported formats: PDF, DOC, DOCX
              </Typography>
            </>
          ) : (
            <>
              <img
                src={fileLogo}
                alt="File Icon"
                style={{ width: 60, height: 60, marginBottom: 16 }}
              />
              <Typography
                variant="body1"
                color="text.primary"
                mb={1}
                sx={{
                  fontWeight: "medium",
                  wordBreak: "break-word"
                }}
              >
                {uploadedFile.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                mb={2}
                display={"block"}
              >
                File size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
              <Button
                variant="text"
                onClick={(e) => {
                  e.stopPropagation();
                  handleChangeFile();
                }}
                sx={{
                  color: "#2f5af7",
                  textDecoration: "none",
                  fontWeight: "bold",
                  "&:hover": {
                    textDecoration: "underline"
                  },
                  fontSize: "16px",
                  "& .MuiSvgIcon-root": { fontSize: 28 },
                }}
                startIcon={<CachedIcon />}
              >
                Change file
              </Button>
            </>
          )}
        </Box>
      )}

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* 步骤二：个人信息表单 */}
      {currentStep === 1 && (
        <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
          <Box
            sx={{
              mx: "auto",
              width: { xs: "100%", sm: 600 }, // 跟进度条宽度一致
              bgcolor: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: 4,
              p: 4,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
            }}
          >
            <Typography variant="h6" fontWeight="bold" mb={3}>
              Personal Information
            </Typography>
            {loading ? (
              <Typography color="text.secondary">Loading...</Typography>
            ) : (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="body2" mb={0.5}>NAME</Typography>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      fontSize: 16
                    }}
                    required
                  />
                </Box>
                <Box>
                  <Typography variant="body2" mb={0.5}>EMAIL</Typography>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      fontSize: 16
                    }}
                    required
                  />
                </Box>
                <Box>
                  <Typography variant="body2" mb={0.5}>MAJOR</Typography>
                  <input
                    name="major"
                    value={formData.major}
                    onChange={handleInputChange}
                    placeholder="Enter your major"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      fontSize: 16
                    }}
                    required
                  />
                </Box>
                <Box>
                  <Typography variant="body2" mb={0.5}>SKILL</Typography>
                  <input
                    name="skill"
                    value={formData.skill}
                    onChange={handleInputChange}
                    placeholder="Enter your skills (e.g., backend development, React)"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      fontSize: 16
                    }}
                    required
                  />
                </Box>
              </Stack>
            )}
          </Box>
        </form>
      )}

      {/* 底部进度卡片 */}
      <Paper
        elevation={0}
        sx={{
          mx: "auto",
          width: { xs: "100%", sm: 600 },
          p: 3,
          borderRadius: 4,
          border: "1px solid #F2F2F2",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
      >
        <Typography variant="subtitle1" fontWeight="600" mb={2}>
          Complete your Profile
        </Typography>

        {/* 自定义进度条 */}
        <ProgressBar />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption">
            Please complete your profile ({currentStep + 1}/{steps.length})
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            {/* 上一步按钮，仅在step=1时显示，样式与下一步一致 */}
            {currentStep > 0 && (
              <Button
                variant="contained"
                size="small"
                onClick={handlePrevStep}
                sx={{
                  minWidth: 0,
                  width: 40,
                  height: 40,
                  bgcolor: primaryYellow,
                  color: "#000",
                  borderRadius: "50%",
                  fontWeight: 700,
                  "&:hover": { bgcolor: "#e6b600" },
                  transform:'scaleX(-1)'
                }}
              >
                ➔
              </Button>
            )}
            <Button
              variant="contained"
              size="small"
              onClick={handleNextStep}
              disabled={currentStep === 0 && !uploadedFile}
              sx={{
                minWidth: 0,
                width: 40,
                height: 40,
                bgcolor: primaryYellow,
                color: "#000",
                borderRadius: "50%",
                fontWeight: 700,
                "&:hover": { bgcolor: "#e6b600" }
              }}
            >
              {currentStep >= steps.length - 1 ? "✔" : "➔"}
            </Button>
          </Box>
        </Stack>
      </Paper>

      {/* 保存确认弹窗 */}
      <Dialog open={dialogOpen} onClose={handleDialogCancel}>
        <DialogTitle>Do you want to save the current personal information?</DialogTitle>
        <DialogContent>
          <Typography>Confirm and go to Home.</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
          <Button color="error" onClick={handleDialogCancel} disabled={saving}>Cancel</Button>
          <Button
            onClick={handleDialogConfirm}
            variant="contained"
            color="primary"
            disabled={saving}
          >
            {saving ? "Saving..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}