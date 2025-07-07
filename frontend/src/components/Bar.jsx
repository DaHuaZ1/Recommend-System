import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { alpha } from '@mui/material/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

const navLinks = [
  { label: 'Projects', to: '/student/index' },
  { label: 'Recommend', to: '/student/group/recommend' },
  { label: 'Group', to: '/student/group' }
];

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();

  /* ---------------- Active link（点击决定谁亮） ---------------- */
  const [activeLink, setActiveLink] = useState(navLinks[0].to);

  useEffect(() => {
    // 找到与当前 pathname 最匹配的 nav（防止刷新后丢失高亮）
    const matched = navLinks.find(({ to }) =>
      location.pathname.startsWith(to)
    );
    if (matched) setActiveLink(matched.to);
    else setActiveLink(null);
  }, [location.pathname]);

  /* ---------------- 设置菜单和对话框状态 ---------------- */
  const [anchorEl, setAnchorEl]     = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const openMenu   = (e) => setAnchorEl(e.currentTarget);
  const closeMenu  = () => setAnchorEl(null);

  const goProfile  = () => { closeMenu(); navigate('/student/profile'); };
  const askLogout  = () => { closeMenu(); setConfirmOpen(true); };
  const handleLogout = () => {
    localStorage.clear();
    setConfirmOpen(false);
    navigate('/student/login', { replace: true });
  };

  /* --------------Bar 动画效果------------ */
  const sxBase = {
    textTransform: 'none',
    fontSize: 16,
    lineHeight: 1.5,
    position: 'relative',
    bgcolor: '#fff',
    '&:hover': {
      bgcolor: '#fff',
    },
    // 下划线伪元素
    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      bottom: -1,
      width: '100%',
      height: 2,
      backgroundColor: '#ff9500',
      transformOrigin: 'left',
      transform: 'scaleX(0)',
      transition: 'transform .3s ease',
    },
    mr: 4
  };

  const sxActive = {
    color: '#ff9500',
    '&::after': { transform: 'scaleX(1)'}
  };

  const sxHover = (theme, active) => ({
    // 颜色变浅：active 用 alpha，非 active 用 text.secondary
    color: active
      ? alpha('#ff9500', 0.8)
      : theme.palette.text.secondary,
    '&::after': { transform: 'scaleX(1)'},
  });

  /* ---------------- 渲染 ---------------- */
  return (
    <>
      <AppBar position="sticky" elevation={0}
              sx={{ bgcolor:'#fff', color:'text.primary', borderBottom:'1px solid #f0f0f0' }}>
        <Toolbar sx={{ minHeight:64, display:"flex", justifyContent:"space-around" }}>
          <Typography variant="h6" sx={{ mr:4,fontWeight:600 }}>PoJFit</Typography>

          {/* 顶部导航：点击即设 activeLink，再跳转 */}
          <Box>
            {navLinks.map(({ label, to }) => {
              const active = activeLink === to;
              return (
                <Button
                  key={label}
                  disableRipple
                  onClick={() => {           
                    setActiveLink(to);       
                    navigate(to);            
                  }}
                  sx={[
                    sxBase,
                    active && sxActive,
                    (theme) => ({
                      '&:hover': sxHover(theme, active),
                    }),
                  ]}
                >
                  {label}
                </Button>
              );
            })}
          </Box>
          
          <Box sx={{display:"flex"}}>
            <Avatar sx={{ bgcolor:'#ffcc00', width:32, height:32, fontWeight:600, mr:6 }}>E</Avatar>

            <IconButton size="small" sx={{ bgcolor:'#f1f1f1', p:1, '&:hover':{bgcolor:'#eaeaea'} }}
                        onClick={openMenu}>
              <SettingsOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 菜单 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1,
            minWidth: 100,
            overflow: 'visible',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            '&:before': {            // 小尖角
              content: '""',
              position: 'absolute',
              top: -6,
              right: 16,
              width: 12,
              height: 12,
              bgcolor: '#fff',
              transform: 'rotate(45deg)',
              zIndex: -1,
              boxShadow: '-1px -1px 1px rgba(0,0,0,0.05)',
            },
          },
        }}
      >
        <MenuItem
          onClick={goProfile}
          sx={{
            gap: 1.5,
            px: 2.5,
            py: 1,
            '&:hover': { bgcolor: 'rgba(255,149,0,0.08)' },
          }}
        >
          <PersonOutlineIcon fontSize="small" sx={{ color: '#ff9500' }} />
          Profile
        </MenuItem>

        <MenuItem
          onClick={askLogout}
          sx={{
            gap: 1.5,
            px: 2.5,
            py: 1,
            '&:hover': { bgcolor: 'rgba(255,149,0,0.08)' },
          }}
        >
          <LogoutIcon fontSize="small" sx={{ color: '#ff4d4f' }} />
          Logout
        </MenuItem>
      </Menu>

      {/* 退出确认框 */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>Are you sure you want to log out?</DialogContent>
        <DialogActions sx={{ justifyContent:'space-between' }}>
          <Button onClick={() => setConfirmOpen(false)} color="error">Cancel</Button>
          <Button onClick={handleLogout} variant="contained">Sure</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
