// GroupStd.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import CircularProgress from '@mui/material/CircularProgress';

import TopBar from './Bar';
import backendURL from '../backendURL';

export default function GroupStd() {
  /* ───────────── state ───────────── */
  const [openCreate, setOpenCreate]   = useState(false);
  const [openDiscard, setOpenDiscard] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [groupName, setGroupName]     = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [snackbar, setSnackbar] = useState({open: false, msg: '', severity: 'success'});
  const [currentLocation, setCurrentLocation] = useState(0);
  const [myGroup, setMyGroup] = useState({
    groupName: '',
    groupMembers: {},
  });
  const [loadingGroup, setLoadingGroup] = useState(false);

  const navigate = useNavigate();

  /* ───────────── fetch my group ───────────── */
  const fetchmyGroup = async () => {
    try {
      setLoadingGroup(true);
      const res = await fetch(`${backendURL}/api/student/group`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          "ngrok-skip-browser-warning": "true", // Ignore browser warning for ngrok
        },
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      if (data.grouped) {
        localStorage.setItem('Grouped', data.grouped);
        setMyGroup({
          groupName: data.groupName,
          groupMembers: data.groupMembers,
        });
        setCurrentLocation(1);
      } else {
        localStorage.setItem('Grouped', 'false');
      }
    } catch (err) {
      console.error(err);
      setCurrentLocation(0);
    } finally {
      setLoadingGroup(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/student/login');
      return;
    }
    if (localStorage.getItem('Grouped') === 'true') {
      setCurrentLocation(1);
    }
    fetchmyGroup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ───────── helpers ───────── */
  const unsaved = groupName.trim() !== '' || groupMembers.length > 0;

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /* ───────── handlers ───────── */
  const handleOpenCreate   = () => setOpenCreate(true);
  const handleCancelCreate = () => (unsaved ? setOpenDiscard(true) : handleCloseAll());
  const handleCloseAll     = () => {
    setOpenCreate(false); setOpenDiscard(false); setOpenConfirm(false);
    setGroupName(''); setMemberInput(''); setGroupMembers([]);
  };

  const handleAddMember = () => {
    const email = memberInput.trim();
    if (!isValidEmail(email)) {
      setSnackbar({ open: true, msg: 'Invalid email format!', severity: 'error' });
      return;
    }
    if (groupMembers.length >= 5) {
      setSnackbar({ open: true, msg: 'You can only add up to 5 members!', severity: 'warning' });
      return;
    }
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
        body: JSON.stringify({ groupName, groupMember: [...groupMembers, localStorage.getItem('email')] }),
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      setSnackbar({ open: true, msg: 'Group created successfully!', severity: 'success' });
      handleCloseAll();
      setCurrentLocation(1);
      await fetchmyGroup();  // Refresh group list
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, msg: 'Failed to create group. Please try again later.', severity: 'error' });
      setOpenConfirm(false);
    }
  };

  // 删除组的处理函数
  const handleDeleteGroup = async () => {
    try {
      const res = await fetch(`${backendURL}/api/group/${myGroup.groupName}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ groupName: myGroup.groupName }),
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      setSnackbar({ open: true, msg: 'Group deleted successfully!', severity: 'success' });
      handleCloseAll();
      setCurrentLocation(0);
      await fetchmyGroup();  // Refresh group list
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, msg: 'Failed to delete group. Please try again later.', severity: 'error' });
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
      {currentLocation === 0 && (
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
      )}

      {currentLocation === 1 && (
        <Box
          sx={{
            minHeight: 'calc(100vh - 64px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #fefcea 0%, #f1daff 100%)',
            p: 3,
          }}
        >
          <Paper
            elevation={8}
            sx={{
              maxWidth: 600,
              width: '100%',
              p: 4,
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(10px)',
              textAlign: 'center',
            }}
          >
            <GroupsIcon sx={{ fontSize: 50, color: 'primary.main', mb: 1 }} />
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="relative"         /* ➞ 设为 relative，才能让子元素绝对定位 */
            >
              <Typography
                variant="h4"
                fontWeight={700}
                mb={1}
              >
                {myGroup.groupName || 'My Group'}
              </Typography>

              <Button
                color="error"
                onClick={handleDeleteGroup}
                sx={{
                  position: 'absolute',    /* ➞ 绝对定位 */
                  right: 0,                /* ➞ 紧贴容器右侧 */
                }}
              >
                Delete
              </Button>
            </Box>
            <Typography variant="body1" color="text.secondary" mb={3}>
              You are now part of a project group. Here's your team:
            </Typography>

            {loadingGroup ? (
              <Box sx={{ my: 3 }}>
                <CircularProgress color="primary" />
              </Box>
            ) : (
              <Stack
                direction="row"
                flexWrap="wrap"
                justifyContent="center"
                spacing={1}
                useFlexGap
                mb={3}
              >
                {Object.entries(myGroup.groupMembers).map(([email, name]) => (
                  <Chip
                    key={email}
                    label={`${name} (${email})`}
                    sx={{ mb: 1 }}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            )}

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
                mt: 2,
              }}
            >
              <InfoOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">
                You cannot change group members after joining.
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}


      {/* ============ Create Group Dialog ============ */}
      <Dialog 
        open={openCreate} 
        onClose={handleCancelCreate} 
        fullWidth 
        maxWidth="sm"
        slotProps={{
          paper:{
            sx: {
              pl: 3, pr: 3, pt: 2, pb: 2,
              borderRadius: 5,
            },
          }
        }}
      >
        <DialogTitle sx={{ pr: 5, display: 'flex', alignItems: 'center', gap: 1}}>
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
                type="email"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMember();
                  }
                }}
              />
              <Button onClick={handleAddMember} disabled={!isValidEmail(memberInput) || groupMembers.length >= 5}>Add</Button>
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
            disabled={!groupName.trim() || groupMembers.length === 0 || groupMembers.length < 5}
            onClick={() => setOpenConfirm(true)}
            endIcon={<CheckCircleOutlineIcon />}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============ Unsaved Changes Dialog ============ */}
      <FrostDialog open={openDiscard} onClose={() => setOpenDiscard(false)} slots={{transition: UpTransition}}>
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
      <FrostDialog open={openConfirm} onClose={() => setOpenConfirm(false)} slots={{transition: UpTransition}}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleOutlineIcon color="success" />
          Confirm Group Creation?
        </DialogTitle>
        <DialogContent>
          <Typography>Group Name: {groupName || '(none)'}</Typography>
          <Typography>Members: {groupMembers.length + 1}</Typography>
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