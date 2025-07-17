import { useState } from "react";
import TopBar from './Bar';
import ProjectSingle from './projectSingle';
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Zoom,
  Grow,
  Stack,
  Paper
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import backendURL from '../backendURL';

export default function RecommendStd() {
  const [loading, setLoading] = useState(false);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [triggered, setTriggered] = useState(false);

  const handleRecommendClick = async () => {
    setLoading(true);
    setTriggered(true);

    try {
      // 模拟后端请求（替换为真实接口）
      const res = await fetch(`${backendURL}/api/student/projects`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'ngrok-skip-browser-warning': 'true', // 忽略浏览器警告
        },
      });

      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();

      // 假设后端返回 { projects: [ ...6 items ] }
      setTimeout(() => {
        setRecommendedProjects(data.projects || []);
        setLoading(false);
      }, 1200); // 为了展示动画，模拟延迟加载
    } catch (err) {
      console.error('Recommendation failed:', err);
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#f8f9fb', minHeight: '100vh' }}>
      <TopBar />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pt: 10,
          px: 2,
        }}
      >
        {!triggered && (
          <Zoom in={!triggered}>
            <Box
              sx={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff9800, #ffc107)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                cursor: 'pointer',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
              onClick={handleRecommendClick}
            >
              <BoltIcon sx={{ fontSize: 60, color: '#fff' }} />
            </Box>
          </Zoom>
        )}

        {/* Loading spinner */}
        {loading && (
          <Grow in={loading} timeout={400}>
            <Box sx={{ mt: 5 , textAlign: 'center' }}>
              <CircularProgress size={48} color="warning" />
              <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
                Finding the best projects for you...
              </Typography>
            </Box>
          </Grow>
        )}

        {/* Recommendation Result */}
        {!loading && recommendedProjects.length > 0 && (
          <Box sx={{ mt: 4, width: '100%', maxWidth: 800 }}>
            <Typography
              variant="h5"
              fontWeight={600}
              gutterBottom
              textAlign="center"
              color="primary"
            >
              Recommended Projects for You
            </Typography>

            <Stack spacing={3} sx={{ py: 4 }}>
              {recommendedProjects.map((project, index) => (
                <ProjectSingle key={index} project={project} />
              ))}
            </Stack>
          </Box>
        )}

        {/* Instruction text */}
        {!triggered && (
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ mt: 4, maxWidth: 400, textAlign: 'center' }}
          >
            Click the glowing button above to get your personalized project recommendations.
          </Typography>
        )}
      </Box>
    </Box>
  );
}