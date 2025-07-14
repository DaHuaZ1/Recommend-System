import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
} from '@mui/material';
import TopBar from './Bar';
import backendURL from '../backendURL';

export default function ProfilePageStd() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    major: '',
    skill: '',
  });

  const [originalData, setOriginalData] = useState(null);

  // 判断数据是否被修改
  const isChanged = () => {
    return originalData && JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  // 获取用户数据
  const fetchUserData = async () => {
    try {
      const res = await fetch(`${backendURL}/api/student/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "ngrok-skip-browser-warning": "true", // 忽略浏览器警告
        }
      });

      if (res.ok) {
        const data = await res.json();
        const cleanedData = {
          name: data.name || '',
          email: data.email || '',
          major: data.major || '',
          skill: data.skill || '',
        };
        setFormData(cleanedData);
        setOriginalData(cleanedData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // 更新用户数据
  const updateUserData = async (data) => {
    try {
      const res = await fetch(`${backendURL}/api/student/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert('Profile updated successfully');
        setOriginalData(data); // 保存为新的原始数据
      } else {
        const errorData = await res.json();
        alert('Failed to update profile: ' + (errorData.message || 'Unknown error'));
        console.error('Failed to update profile:', errorData);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Update failed. Please try again later.');
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleChange = (field) => (e) =>
    setFormData({ ...formData, [field]: e.target.value });

  const handleSave = async () => {
    const { name, email, major, skill } = formData;
    if (!name || !email || !major || !skill) {
      alert('Please fill in all fields');
      return;
    }

    if (!isChanged()) {
      alert('No changes made');
      return;
    }

    await updateUserData(formData);
  };

  return (
    <>
      <TopBar />

      <Box
        sx={{
          mt: 6,
          display: 'flex',
          justifyContent: 'center',
          px: 2,
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 720,
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Personal Information
            </Typography>

            <Stack spacing={3}>
              <TextField
                label="Name"
                fullWidth
                size="small"
                value={formData.name}
                onChange={handleChange('name')}
              />

              <TextField
                label="Email"
                fullWidth
                size="small"
                value={localStorage.getItem('email') || formData.email}
                disabled
              />

              <TextField
                label="Major"
                fullWidth
                size="small"
                value={formData.major}
                onChange={handleChange('major')}
              />

              <TextField
                label="Skill"
                fullWidth
                size="small"
                value={formData.skill}
                onChange={handleChange('skill')}
                multiline
              />
            </Stack>

            <Box
              sx={{
                mt: 4,
                display: 'flex',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  if (isChanged()) {
                    if (!window.confirm('Are you sure you want to discard changes?')) {
                      return;
                    }
                  }
                  navigate(-1);
                }}
              >
                Back
              </Button>

              <Button variant="contained" onClick={handleSave}>
                Save
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}