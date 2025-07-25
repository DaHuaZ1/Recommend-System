import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
    AppBar, Toolbar, Typography, Button, IconButton, Avatar,
    Box, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

const navLinks = [
    { label: 'Projects', to: '/staff/index' },
    { label: 'Group', to: '/staff/group' },
];

export default function TopBar() {
    const location = useLocation();
    const navigate = useNavigate();

    /* ---------- 当前激活路由 ---------- */
    const [activeLink, setActiveLink] = useState(null);

    useEffect(() => {
        const matched = navLinks.find(({ to }) =>
            location.pathname.startsWith(to)
        );
        setActiveLink(matched ? matched.to : null);
    }, [location.pathname]);

    /* ---------- 设置菜单 / 登出 ---------- */
    const [anchorEl, setAnchorEl] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const openMenu = (e) => setAnchorEl(e.currentTarget);
    const closeMenu = () => setAnchorEl(null);
    const askLogout = () => { closeMenu(); setConfirmOpen(true); };
    const handleLogout = () => {
        localStorage.clear();
        setConfirmOpen(false);
        navigate('/staff/login', { replace: true });
    };

    /* ---------- 样式 ---------- */
    const sxBase = {
        textTransform: 'none',
        fontSize: 16,
        lineHeight: 1.5,
        position: 'relative',
        bgcolor: '#fff',
        '&:hover': { bgcolor: '#fff' },
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
            transition: 'transform .3s cubic-bezier(.4,0,.2,1)',
        },
        mr: 4,
    };

    const sxActive = {
        color: '#ff9500',
        '&::after': { transform: 'scaleX(1)' },
    };

    const sxHover = (theme, active) => ({
        color: active ? alpha('#ff9500', 0.8) : theme.palette.text.secondary,
        '&::after': { transform: 'scaleX(1)' },
    });

    /* ---------- 渲染 ---------- */
    return (
        <>
            <AppBar position="sticky" elevation={0}
                sx={{ bgcolor: '#fff', color: 'text.primary', borderBottom: '1px solid #f0f0f0' }}>
                <Toolbar sx={{ minHeight: 64, justifyContent: 'space-around' }}>
                    <Typography
                        variant="h6"
                        sx={{ mr: 4, fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => navigate('/staff/index')}
                    >
                        PoJFit
                    </Typography>

                    <Box>
                        {navLinks.map(({ label, to }) => {
                            const active = activeLink === to;

                            return (
                                <Button
                                    key={label}
                                    component={RouterLink}
                                    to={to}
                                    disableRipple
                                    sx={[
                                        sxBase,
                                        active && sxActive,
                                        (theme) => ({ '&:hover': sxHover(theme, active) }),
                                    ]}
                                >
                                    {label}
                                </Button>
                            );
                        })}
                    </Box>

                    <Box sx={{ display: 'flex' }}>
                        <IconButton
                            size="small"
                            sx={{ bgcolor: '#f1f1f1', p: 1, '&:hover': { bgcolor: '#eaeaea' } }}
                            onClick={openMenu}
                        >
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
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            mt: 1, minWidth: 100, overflow: 'visible', borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            '&:before': {
                                content: '""', position: 'absolute', top: -6, right: 16,
                                width: 12, height: 12, bgcolor: '#fff', transform: 'rotate(45deg)',
                                zIndex: -1, boxShadow: '-1px -1px 1px rgba(0,0,0,0.05)',
                            },
                        },
                    }
                }}
            >

                <MenuItem onClick={askLogout} sx={{
                    gap: 1.5, px: 2.5, py: 1,
                    '&:hover': { bgcolor: 'rgba(255,149,0,0.08)' }
                }}>
                    <LogoutIcon fontSize="small" sx={{ color: '#ff4d4f' }} />
                    Logout
                </MenuItem>
            </Menu>

            {/* 退出确认框 */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>Confirm Logout</DialogTitle>
                <DialogContent>Are you sure you want to log out?</DialogContent>
                <DialogActions sx={{ justifyContent: 'space-between' }}>
                    <Button onClick={() => setConfirmOpen(false)} color="error">Cancel</Button>
                    <Button onClick={handleLogout} variant="contained">Sure</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
