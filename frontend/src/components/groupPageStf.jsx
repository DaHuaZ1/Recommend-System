// GroupStd.jsx
import React, { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Snackbar,
    Stack,
    TextField,
    Typography,
    Slide
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import GroupsIcon from '@mui/icons-material/Groups';
import { styled, alpha } from '@mui/material/styles';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import TopBar from './BarStf';
import backendURL from '../backendURL';

export default function GroupStd() {
    /* ───────────── state ───────────── */
    const [openCreate, setOpenCreate] = useState(false);
    const [openDiscard, setOpenDiscard] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [memberInput, setMemberInput] = useState('');
    const [groupMembers, setGroupMembers] = useState([]);
    const [snackbar, setSnackbar] = useState({
        open: false, msg: '', severity: 'success',
    });

    /* ───────── helpers ───────── */
    const unsaved = groupName.trim() !== '' || groupMembers.length > 0;

    /* ───────── handlers ───────── */
    const handleOpenCreate = () => setOpenCreate(true);
    const handleCancelCreate = () => (unsaved ? setOpenDiscard(true) : handleCloseAll());
    const handleCloseAll = () => {
        setOpenCreate(false); setOpenDiscard(false); setOpenConfirm(false);
        setGroupName(''); setMemberInput(''); setGroupMembers([]);
    };

    const handleAddMember = () => {
        const email = memberInput.trim();
        if (email && !groupMembers.includes(email)) {
            setGroupMembers(prev => [...prev, email]);
        }
        setMemberInput('');
    };
    const handleDeleteMember = (email) =>
        setGroupMembers(prev => prev.filter(e => e !== email));

    const createGroup = async () => {
        try {
            const res = await fetch(`${backendURL}/api/student/group`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ groupName, groupMember: groupMembers }),
            });
            if (!res.ok) throw new Error(`Server responded ${res.status}`);
            setSnackbar({ open: true, msg: 'Group created successfully!', severity: 'success' });
            handleCloseAll();
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, msg: 'Failed to create group. Please try again later.', severity: 'error' });
            setOpenConfirm(false);
        }
    };

    /* ──────────── Styled Components ──────────── */
    const FrostDialog = styled(Dialog)(({ theme }) => ({
        '& .MuiPaper-root': {
            borderRadius: 16,
            padding: theme.spacing(3),
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(15px)',
            boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
            border: `1px solid ${alpha(theme.palette.divider, 0.25)}`,
        },
    }));
    const UpTransition = React.forwardRef(function UpTransition(props, ref) {
        return <Slide direction="up" ref={ref} {...props} />;
    });

    /* ──────────── UI ──────────── */
    return (
        <>
            <TopBar />

            {/* ---------- Hero section ---------- */}
            <Box
                sx={{
                    minHeight: 'calc(100vh - 64px)',         /* subtract AppBar height */
                    background:
                        'linear-gradient(135deg, #e3f2fd 0%, #ffe0f1 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                }}
            >
                {/* Glass-card */}
                <Slide in direction="up" timeout={500}>
                    <Paper
                        elevation={6}
                        sx={{
                            width: '100%', maxWidth: 520, p: 5,
                            textAlign: 'center',
                            borderRadius: 4,
                            // boxShadow: 'none',
                            backdropFilter: 'blur(10px)',
                            backgroundColor: 'rgba(255,255,255,0.65)',
                            // backgroundColor: 'transparent'
                        }}
                    >
                        <GroupsIcon sx={{ fontSize: 64, mb: 1, color: 'primary.main' }} />
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Your Project Groups
                        </Typography>
                        <Typography variant="body1" color="text.secondary" mb={4}>
                            Organise classmates into groups, invite members by email,
                            and kick-start your collaboration in seconds.
                        </Typography>

                        {/* Empty-state illustration (if needed you can list existing groups here later) */}
                        <Stack
                            direction="row"
                            justifyContent="center"
                            spacing={1}
                            mb={3}
                            sx={{ opacity: 0.75 }}
                        >
                            <Typography variant="subtitle1">
                                No groups yet?
                            </Typography>
                            <Typography variant="subtitle1" fontWeight={600}>
                                Create one now!
                            </Typography>
                        </Stack>

                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<GroupAddIcon />}
                            onClick={handleOpenCreate}
                        >
                            Create Group
                        </Button>
                    </Paper>
                </Slide>
            </Box>

            {/* ============ Create Group Dialog ============ */}
            <Dialog
                open={openCreate}
                onClose={handleCancelCreate}
                fullWidth
                maxWidth="sm"
                slotProps={{
                    paper: {
                        sx: {
                            pl: 3, pr: 3, pt: 2, pb: 2,
                            borderRadius: 5,
                        },
                    }
                }}
            >
                <DialogTitle sx={{ pr: 5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GroupAddIcon color="primary" />
                    <Typography variant="h6" component="span">Create a New Group</Typography>
                    <IconButton
                        aria-label="close"
                        onClick={handleCancelCreate}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <Stack spacing={3}>
                        <TextField
                            label="Group Name"
                            fullWidth
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Search by email to add member (stub)"
                                fullWidth
                                value={memberInput}
                                onChange={(e) => setMemberInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddMember();
                                    }
                                }}
                            />
                            <Button onClick={handleAddMember}>Add</Button>
                        </Stack>
                        {groupMembers.length > 0 && (
                            <Box>
                                <Typography mb={1}>Added members:</Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    {groupMembers.map(email => (
                                        <Chip
                                            key={email}
                                            label={email}
                                            onDelete={() => handleDeleteMember(email)}
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant="outlined" color="error" onClick={handleCancelCreate}>Cancel</Button>
                    <Button
                        variant="contained"
                        disabled={!groupName.trim()}
                        onClick={() => setOpenConfirm(true)}
                        endIcon={<CheckCircleOutlineIcon />}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ============ Unsaved Changes Dialog ============ */}
            <FrostDialog open={openDiscard} onClose={() => setOpenDiscard(false)} slots={{ transition: UpTransition }}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoOutlinedIcon color="warning" />
                    Unsaved Changes
                </DialogTitle>
                <DialogContent>Do you want to discard the group creation?</DialogContent>
                <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button onClick={() => setOpenDiscard(false)}>Continue Editing</Button>
                    <Button color="error" onClick={handleCloseAll}>Discard</Button>
                </DialogActions>
            </FrostDialog>

            {/* ============ Confirm Create Dialog ============ */}
            <FrostDialog open={openConfirm} onClose={() => setOpenConfirm(false)} slots={{ transition: UpTransition }}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleOutlineIcon color="success" />
                    Confirm Group Creation?
                </DialogTitle>
                <DialogContent>
                    <Typography>Group Name: {groupName || '(none)'}</Typography>
                    <Typography>Members: {groupMembers.length}</Typography>
                </DialogContent>
                <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button color="error" onClick={() => setOpenConfirm(false)}>Back</Button>
                    <Button variant="contained" onClick={createGroup}>Create</Button>
                </DialogActions>
            </FrostDialog>

            {/* ============ Snackbar Feedback ============ */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.msg}
                </Alert>
            </Snackbar>
        </>
    );
}