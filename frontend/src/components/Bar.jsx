import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Box from '@mui/material/Box';

const navLinks = [
  { label: 'Projects', to: '/projects' },
  { label: 'Recommend', to: '/recommend' },  
  { label: 'Group', to: '/group' }
];

export default function TopBar() {
  const location = useLocation();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: '#fff',
        color: 'text.primary',
        borderBottom: '1px solid #f0f0f0'
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        {/* LOGO */}
        <Typography variant="h6" sx={{ mr: 4, fontWeight: 600 }}>
          UNSW
        </Typography>

        {/* 顶部导航 */}
        {navLinks.map(({ label, to }) => {
          const active = location.pathname.startsWith(to);
          return (
            <Button
              key={label}
              component={RouterLink}
              to={to}
              disableRipple
              sx={{
                mr: 3,
                textTransform: 'none',
                fontWeight: active ? 600 : 400,
                color: active ? '#ff9500' : 'text.primary', // #FF9500 来自截图
                '&:hover': { bgcolor: 'transparent' }
              }}
            >
              {label}
            </Button>
          );
        })}

        {/* 占位拉伸，把右侧元素顶到最右 */}
        <Box sx={{ flexGrow: 1 }} />

        {/* 圆形头像 */}
        <Avatar
          sx={{
            bgcolor: '#ffcc00',   // #FFCC00 来自截图
            color: '#000',
            width: 32,
            height: 32,
            fontWeight: 600,
            mr: 2
          }}
        >
          E
        </Avatar>

        {/* 设置按钮 */}
        <IconButton
          size="small"
          sx={{
            bgcolor: '#f1f1f1',
            p: 1,
            '&:hover': { bgcolor: '#eaeaea' }
          }}
        >
          <SettingsOutlinedIcon fontSize="small" />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}