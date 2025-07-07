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

  // 这里简单用默认示例数据
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    major: '',
    skill: '',
  });

  // 获取用户数据的函数
  const fetchUserData = async () => {
    const res = await fetch(`${backendURL}/api/student/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      setFormData({
        name: data.name || '',
        email: data.email || '',
        major: data.major || '',
        skill: data.skill || '',
      });
    } else {
      console.error('Failed to fetch user data');
    }
  }

  // 更新用户数据的函数
  const updateUserData = async (data) => {
    const res = await fetch(`${backendURL}/api/student/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      alert('Profile updated successfully');
    } else {
      const errorData = await res.json();
      console.error('Failed to update profile:', errorData);
      alert('Failed to update profile: ' + (errorData.message || 'Unknown error'));
    }
  }

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleChange = (field) => (e) =>
    setFormData({ ...formData, [field]: e.target.value });

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.major || !formData.skill) {
      alert('Please fill in all fields');
      return;
    }
    // 验证是否跟之前的数据有变化
    const originalData = {
      name: formData.name,
      email: formData.email,
      major: formData.major,
      skill: formData.skill,
    };
    if (JSON.stringify(originalData) === JSON.stringify(formData)) {
      alert('No changes made');
      return;
    }
    await updateUserData(formData);
    console.log('save', formData);
  };

  return (
    <>
      <TopBar />

      {/* 页面主体 */}
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

            {/* 表单区域 */}
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
                value={formData.email}
                onChange={handleChange('email')}
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
              />
            </Stack>

            {/* 按钮区 */}
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
                onClick={() => navigate(-1)} // 返回上一页
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