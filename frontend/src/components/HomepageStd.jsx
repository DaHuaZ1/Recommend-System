import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './Bar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';

import ProjectSingle from './projectSingle';
import backendURL from '../backendURL';

const HomeStd = () => {
  const [keyword, setKeyword] = useState('');
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  // 点击搜索图标的回调
  const handleSearch = () => {
    console.log('Search:', keyword);
    // TODO: 替换为真正的搜索逻辑
    // 直接匹配现有的项目列表的标题或描述
  };

  // fetch所有项目列表的函数
  const fetchProjects = async () => {
    try {
      const res = await fetch(`${backendURL}/api/student/projects`,{
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
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } 
  };

  // 页面加载时可以从后端获取项目列表
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      // 如果没有token，重定向到登录页面
      navigate('/student/login');
      return;
    }
    fetchProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{bgcolor:"#fbfbfb", minHeight: '100vh'}}>
      {/* 顶部导航栏 */}
      <TopBar />

      {/* 搜索框区域 */}
      <Box
        sx={{
          mt: 4,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={0}
          sx={{
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
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            inputProps={{ 'aria-label': 'search projects' }}
          />
          <IconButton sx={{ p: 0.5 }} onClick={handleSearch} aria-label="search">
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
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {projects.length > 0 && projects.map((project, index) => (
          <ProjectSingle key={index} project={project} />
        ))}
      </Box>
    </Box>
  );
};

export default HomeStd;