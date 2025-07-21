import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Chip,
    Typography,
    Stack,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import CloseIcon from '@mui/icons-material/Close';
import TopBar from './BarStf';
import backendURL from '../backendURL';

export default function GroupStf() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [projectDialogOpen, setProjectDialogOpen] = useState(false);
    const [projectDetails, setProjectDetails] = useState(null);
    const [projectLoading, setProjectLoading] = useState(false);
    const navigate = useNavigate();

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${backendURL}/api/staff/groups`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            if (res.status === 401) return navigate('/staff/login');
            if (!res.ok) {
                console.error('Error fetching groups:', await res.text());
                return;
            }
            const data = await res.json();
            setGroups(Array.isArray(data.groups) ? data.groups : []);
        } catch (err) {
            console.error('Fetch groups failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (name) => setExpanded(expanded === name ? null : name);
    const handleOpenMember = (member) => setSelectedMember(member);
    const handleCloseMember = () => setSelectedMember(null);

    const handleOpenProject = async (projectNumber, e) => {
        e.stopPropagation();
        setProjectLoading(true);
        try {
            const res = await fetch(`${backendURL}/api/project/${projectNumber}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            if (res.status === 401) return navigate('/staff/login');
            if (!res.ok) {
                console.error('Error fetching project:', await res.text());
                return;
            }
            const data = await res.json();
            setProjectDetails(data);
            setProjectDialogOpen(true);
        } catch (err) {
            console.error('Fetch project failed:', err);
        } finally {
            setProjectLoading(false);
        }
    };

    const handleCloseProject = () => {
        setProjectDialogOpen(false);
        setProjectDetails(null);
    };

    const handleDownload = () => {
        if (project.pdfFile) {
            window.open(backendURL + project.pdfFile, "_blank");
        }
    };

    useEffect(() => {
        if (!localStorage.getItem('token')) return navigate('/staff/login');
        fetchGroups();
    }, [navigate]);

    return (
        <>
            <TopBar />
            <Box
                sx={{
                    minHeight: 'calc(100vh - 64px)',
                    p: 3,
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #ffe0f1 100%)',
                }}
            >
                {loading ? (
                    <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress color="primary" />
                    </Box>
                ) : (
                    <Stack spacing={3} alignItems="center">
                        {groups.map((group) => {
                            const isOpen = expanded === group.groupName;
                            return (
                                <Paper
                                    key={group.groupName}
                                    onClick={() => handleToggle(group.groupName)}
                                    elevation={6}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        width: '100%',
                                        maxWidth: 520,
                                        minHeight: 360,
                                        p: 5,
                                        borderRadius: 4,
                                        backdropFilter: 'blur(10px)',
                                        backgroundColor: 'rgba(255,255,255,0.65)',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'box-shadow 0.3s ease, transform 0.2s ease',
                                        '&:hover': {
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                            transform: 'translateY(-4px)',
                                        },
                                        border: isOpen ? '2px solid #3f51b5' : 'none',
                                    }}
                                >
                                    {!isOpen ? (
                                        <>
                                            <GroupsIcon sx={{ fontSize: 64, mb: 1, color: 'primary.main' }} />
                                            <Typography variant="h5" fontWeight={700} gutterBottom>
                                                {group.groupName}
                                            </Typography>
                                            <Stack
                                                direction="row"
                                                flexWrap="wrap"
                                                justifyContent="center"
                                                gap={1}
                                            >
                                                {(group.groupMembers || []).map((m) => (
                                                    <Chip
                                                        key={m.email}
                                                        label={`${m.name} (${m.email})`}
                                                        variant="outlined"
                                                        color="secondary"
                                                        clickable
                                                        onClick={(e) => {
                                                            e.stopPropagation(); handleOpenMember(m);
                                                        }}
                                                    />
                                                ))}
                                            </Stack>
                                        </>
                                    ) : (
                                        <>
                                            <Typography variant="body2" color="text.secondary" mb={1}>
                                                Recommended Projects:
                                            </Typography>
                                            <Stack spacing={1} justifyContent="center">
                                                {(group.recommendProjects || []).map((p) => (
                                                    <Typography key={p.projectNumber} variant="body2">
                                                        {p.rank}.{' '}
                                                        <Box
                                                            component="span"
                                                            sx={{
                                                                cursor: 'pointer',
                                                                textDecoration: 'underline',
                                                                color: 'primary.main'
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenProject(p.projectNumber, e);
                                                            }}
                                                        >
                                                            {p.projectTitle}
                                                        </Box>
                                                        {` (Score: ${p.final_score})`}
                                                    </Typography>
                                                ))}
                                            </Stack>
                                        </>
                                    )}
                                </Paper>
                            );
                        })}
                    </Stack>
                )}
            </Box>

            {/* Member details dialog */}
            <Dialog open={!!selectedMember} onClose={handleCloseMember} fullWidth maxWidth="xs">
                <DialogTitle sx={{ m: 0, p: 2, position: 'relative' }}>
                    Member Details
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseMember}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedMember && (
                        <Stack spacing={2}>
                            <Typography><strong>Name:</strong> {selectedMember.name}</Typography>
                            <Typography><strong>Email:</strong> {selectedMember.email}</Typography>
                            <Typography><strong>Major:</strong> {selectedMember.major}</Typography>
                            <Typography><strong>Resume:</strong> {selectedMember.resume}</Typography>
                            <Typography><strong>Skill:</strong> {selectedMember.skill}</Typography>
                        </Stack>
                    )}
                </DialogContent>
            </Dialog>

            {/* Project details dialog */}
            <Dialog open={projectDialogOpen} onClose={handleCloseProject} fullWidth maxWidth="sm">
                <DialogTitle sx={{ m: 0, p: 2, position: 'relative' }}>
                    Project Details
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseProject}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {projectLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        projectDetails && (
                            <Stack spacing={2}>
                                <Typography><strong>Title:</strong> {projectDetails.projectTitle}</Typography>
                                <Typography><strong>Number:</strong> {projectDetails.projectNumber}</Typography>
                                <Typography><strong>Client:</strong> {projectDetails.clientName}</Typography>
                                <Typography><strong>Capacity:</strong> {projectDetails.groupCapacity}</Typography>
                                <Typography><strong>Requirements:</strong> {projectDetails.projectRequirements}</Typography>
                                <Typography><strong>Required Skills:</strong> {projectDetails.requiredSkills}</Typography>
                            </Stack>
                        )
                    )}
                </DialogContent>

                <DialogActions sx={{ justifyContent: "center", py: 2 }}>
                    <Button variant="contained" onClick={handleDownload}>
                        Download PDF
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
