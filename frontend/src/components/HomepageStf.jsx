import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './BarStf';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';

import ProjectSingle from './projectSingleStf';
import backendURL from '../backendURL';

const HomeStf = () => {
  const [keyword, setKeyword] = useState('');
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [showEnd, setShowEnd] = useState(false);

  const navigate = useNavigate();

  // 点击搜索图标的回调
  const handleSearch = (searchTerm) => {
    const lowerKeyword = searchTerm.toLowerCase().trim().replace(/\s+/g, '');
    if (lowerKeyword === '') {
      setFilteredProjects(projects); // 为空时展示所有项目
      return;
    }

    const results = projects.filter((project) => {
      const title = project.projectTitle.toLowerCase().replace(/\s+/g, '');
      const number = project.projectNumber.toLowerCase().replace(/\s+/g, '');
      return title.includes(lowerKeyword) || number.includes(lowerKeyword);
    });
    setFilteredProjects(results);
  };

  // 上传按钮回调
  const handleUpload = () => {
    console.log('Upload project');
    navigate('/staff/upload');
  };

  // fetch所有项目列表的函数
  const fetchProjects = async () => {
    try {
      const res = await fetch(`${backendURL}/api/student/projects`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          "ngrok-skip-browser-warning": "true", // 忽略浏览器警告
        }
      });
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await res.json();
      const all = (data.projects || []).sort((a, b) => {
        return parseInt(a.projectNumber) - parseInt(b.projectNumber);
      });
      setProjects(all);
      setFilteredProjects(all); // 初始化时显示所有项目
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // 页面加载时可以从后端获取项目列表
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      // 如果没有token，重定向到登录页面
      navigate('/staff/login');
      return;
    }
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 监听页面滚动
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.offsetHeight;

      if (scrollTop + windowHeight >= docHeight - 10) {
        setShowEnd(true);
      }
    };

    if (projects.length >= 5) {
      window.addEventListener('scroll', handleScroll);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [projects]);


  return (
    <Box sx={{ bgcolor: "#fbfbfb", minHeight: '100vh' }}>
      {/* 顶部导航栏 */}
      <TopBar />

      {/* 搜索 + 按钮区域 */}
      <Box
        sx={{
          mt: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Add */}
        <Box
          onClick={handleUpload}
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            height: 48,
            px: 2,
            borderRadius: 5,
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            '&:hover': {
              boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
            },
          }}
        >
          <AddIcon sx={{ color: '#ff9500', mr: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: 550, color: '#ff9500' }}>
            Add
          </Typography>
        </Box>

        {/* 搜索框 */}
        <Paper
          elevation={0}
          sx={{
            ml: 2,
            p: '2px 6px',
            display: 'flex',
            alignItems: 'center',
            width: '60%',
            maxWidth: 550,
            height: 48,
            borderRadius: 5,
            borderColor: "#d3d3d3",
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            backgroundColor: '#fff',
            transition: 'box-shadow .2s, border .2s',
            '&:hover': {
              boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
            },
            '&:focus-within': {
              boxShadow: `
                0 0 0 2px rgba(38,132,255,0.45),
                0 0 6px 3px rgba(38,132,255,0.35),
                0 0 14px 6px rgba(38,132,255,0.25)
              `,
            },
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1, fontWeight: 550 }}
            placeholder="Search projects…"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              handleSearch(e.target.value);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e.target.value)}
            inputProps={{ 'aria-label': 'search projects' }}
          />
          <IconButton sx={{ p: 0.5 }} onClick={() => handleSearch(keyword)} aria-label="search">
            <SearchIcon sx={{ color: '#ff9500' }} />
          </IconButton>
        </Paper>
      </Box>

      {/* 横线 */}
      <Divider
        sx={{
          my: 4,                   // 上下外边距
          width: '100%',           // 占满容器宽度
          maxWidth: 800,
          mx: 'auto',              // 水平居中
          borderColor: '#e0e0e0',
          position: 'relative',
          // 让中间文字“顶开”线
          '&::before, &::after': {
            borderTopWidth: 1,     // 线厚度
            top: '50%',            // 垂直居中
            transform: 'translateY(-50%)',
          },
        }}
      >
        {/* 中间文字 */}
        <Typography
          component="span"
          sx={{
            px: 2.5,                // 左右内边距
            py: 0.5,
            fontWeight: 600,
            fontSize: 14,
            lineHeight: 1.2,
            color: '#DBDBDB',
          }}
        >
          {projects.length > 0 ? "All Projects Here" : "No projects found. Please check back later."}
        </Typography>
      </Divider>

      {/* 项目列表 */}
      <Box sx={{ maxWidth: 800, mx: 'auto', pb: 2 }}>
        {projects.length > 0 ? (
          filteredProjects.length > 0 ? (
            filteredProjects.map((project, index) => (
              <ProjectSingle key={index} project={project} delay={index * 100} />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" align="center">
              No matching projects found.
            </Typography>
          )
        ) : (
          null
        )}
      </Box>

      {projects.length >= 5 && showEnd && projects.length === filteredProjects.length && filteredProjects.length >= 5 && (
        <Divider
          sx={{
            width: '100%',           // 占满容器宽度
            maxWidth: 800,
            mx: 'auto',              // 水平居中
            borderColor: '#e0e0e0',
            position: 'relative',
            // 让中间文字“顶开”线
            '&::before, &::after': {
              borderTopWidth: 1,     // 线厚度
              top: '50%',            // 垂直居中
              transform: 'translateY(-50%)',
            },
            mt: -2,
            pb: 2
          }}
        >
          {/* 中间文字 */}
          <Typography
            component="span"
            sx={{
              px: 2.5,                // 左右内边距
              py: 0.5,
              fontWeight: 600,
              fontSize: 14,
              lineHeight: 1.2,
              color: '#CACACA',
            }}
          >
            I'm the end!
          </Typography>
        </Divider>
      )}
    </Box>
  );
};

export default HomeStf;