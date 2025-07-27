import { useState, useCallback } from "react";
import TopBar from "./Bar";
import ProjectSingle from "./projectSingle";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Skeleton,
  Fade,
  useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import BoltIcon from "@mui/icons-material/Bolt";
import ReplayIcon from "@mui/icons-material/Replay";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import backendURL from "../backendURL";

export default function RecommendStd() {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchRecommended = useCallback(async () => {
    setLoading(true);
    setTriggered(true);
    try {
      const res = await fetch(`${backendURL}/api/student/recommend`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "ngrok-skip-browser-warning": "true"
        }
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      // 模拟延迟仅用于演示动画；生产可去掉
      setTimeout(() => {
        setRecommendedProjects(data.projects || []);
        setLoading(false);
      }, 600);
    } catch (err) {
      console.error("Recommendation failed:", err);
      setErrorMsg("Failed to fetch recommendations. Please try again.");
      setLoading(false);
    }
  }, []);

  const handleRecommendClick = () => {
    if (!loading) fetchRecommended();
  };

  const handleRetry = () => {
    fetchRecommended();
  };

  const handleErrorClose = () => setErrorMsg("");

  /* ---------- 渲染片段 ---------- */

  const HeroButton = (
    <Paper
      elevation={6}
      sx={{
        width: isSm ? 140 : 160,
        height: isSm ? 140 : 160,
        borderRadius: "50%",
        position: "relative",
        cursor: loading ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "warning.main",
        color: "#fff",
        transition: "transform 0.25s",
        "&:hover": !loading && {
          transform: "scale(1.05)"
        },
        // 脉冲环
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          boxShadow: `0 0 0 0 ${theme.palette.secondary.main}AA`,
          animation: "pulseRing 2s ease-out infinite"
        },
        "@keyframes pulseRing": {
          "0%":  { boxShadow: `0 0 0 0 ${theme.palette.secondary.main}AA` },
          "70%": { boxShadow: `0 0 0 20px ${theme.palette.secondary.main}00` },
          "100%": { boxShadow: "0 0 0 0 rgba(255,193,7,0)" }
        }
      }}
      onClick={handleRecommendClick}
      aria-label="Get project recommendations"
    >
      {loading ? (
        <CircularProgress size={48} color="inherit" />
      ) : (
        <RocketLaunchIcon sx={{ fontSize: isSm ? 56 : 72, transform: 'rotate(-45deg)' }} />
      )}
    </Paper>
  );

  const LoadingList = (
    <Stack spacing={3} sx={{ mt: 4, width: "100%", maxWidth: 800 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        textAlign="center"
        sx={{ mt: 2 }}
      >
        Finding the best projects for you...
      </Typography>
      {[...Array(4)].map((_, i) => (
        <Paper key={i} sx={{ p: 2 }}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="rectangular" height={48} sx={{ mt: 1 }} />
        </Paper>
      ))}
    </Stack>
  );

  const EmptyState = (
    <Stack
      spacing={3}
      alignItems="center"
      justifyContent="center"
      sx={{ mt: 6, px: 2, textAlign: "center" }}
    >
      <Typography sx={{ fontSize: 64, lineHeight: 1 }}>🧐</Typography>
      <Typography variant="h6" fontWeight={600}>
        No suitable projects found (yet).
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
        Try updating your <strong>skills</strong> in your profile or broaden your
        interests, then refresh recommendations.
      </Typography>
      <Button
        variant="contained"
        startIcon={<ReplayIcon />}
        onClick={handleRetry}
      >
        Try Again
      </Button>
    </Stack>
  );

  const Results = (
    <Fade in timeout={400}>
      <Box sx={{ mt: 4, width: "100%", maxWidth: 800 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2, px: 1 }}
        >
          <Typography variant="h5" fontWeight={600} color="primary">
            Recommended Projects
          </Typography>
          <IconButton
            color="primary"
            size="small"
            onClick={handleRetry}
            aria-label="Refresh recommendations"
          >
            <ReplayIcon fontSize="inherit" />
          </IconButton>
        </Stack>
        <Stack spacing={3} sx={{ pb: 6 }}>
          {recommendedProjects.slice(0, 6).map((project, i) => (
            <ProjectSingle key={project.id || i} project={project} delay={i * 100} />
          ))}
        </Stack>
      </Box>
    </Fade>
  );

  /* ---------- 主渲染 ---------- */

  return (
    <Box sx={{ bgcolor: "#f8f9fb", minHeight: "100vh" }}>
      <TopBar />

      <Box
        sx={{
          minHeight: "calc(100vh - 64px)", // 减去顶部导航栏高度
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Hero CTA 在第一次未触发时显示；显示后仍可在结果顶部刷新（见 Results） */}
        {!triggered && HeroButton}

        {!triggered && (
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ mt: 3, maxWidth: 360, textAlign: "center" }}
          >
            Tap the glowing button to get your personalised project
            recommendations.
          </Typography>
        )}

        {/* Loading */}
        {triggered && loading && LoadingList}

        {/* 成功后列表 / 空态 */}
        {triggered && !loading && (
          recommendedProjects.length > 0 ? Results : EmptyState
        )}
      </Box>

      {/* 错误提示 */}
      <Snackbar
        open={Boolean(errorMsg)}
        autoHideDuration={6000}
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleErrorClose} severity="error" sx={{ width: "100%" }}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}