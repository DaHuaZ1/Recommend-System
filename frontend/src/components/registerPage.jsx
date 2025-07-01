import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, Button,
  InputAdornment, IconButton, LinearProgress, Alert, MenuItem,
  Checkbox, FormControlLabel
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import backendURL from '../backendURL';
import heroImg from '../assets/hero.webp';     // 左侧插图
import logo from '../assets/logo.jpg';      // 顶部 logo
import bg from '../assets/bg.webp';         // 背景图片

// ---- 国家列表，可替换成接口返回 ----
const COUNTRIES = ['Australia', 'China', 'United States', 'United Kingdom'];

export default function Signup() {
  /* ========== 表单状态 ========== */
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
//   const [username, setUsername] = useState('');
  const [country,  setCountry]  = useState(COUNTRIES[0]);
  const [agreeMail, setAgreeMail] = useState(false);

  const [showPw, setShowPw] = useState(false);

  /* UI */
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
//   const [nameOK,  setNameOK]  = useState(null);  // null / true / false

  const navigate = useNavigate();

  /* ========== pw Score & UX ========== */
  const pwScore = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
    if (/\d/.test(password) && /\W/.test(password)) s++;
    return s;          // 0 ~ 3
  })();
  const pwColor = ['error', 'warning', 'success'][Math.min(pwScore, 2)];

//   // 模拟用户名可用性检查（真实场景应调用后端）
//   const checkUsername = (name) => {
//     // demo：只要包含 "bit" 就当可用
//     if (!name) { setNameOK(null); return; }
//     setNameOK(!name.includes('bit'));
//   };

  /* ========== submit ========== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${backendURL}/api/register`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        navigate('/student/login', { replace: true });
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  /* ========== rendering ========== */
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* ---------- left side ---------- */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          color: '#fff',
          p: 8,
          flexBasis: { md: '50%' },
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
          Create your free account
        </Typography>
        <Typography variant="h6" sx={{ mb: 6, color: '#c9d1d9' }}>
          Explore PoJFit core features for individuals and organizations.
        </Typography>
        <Box
          component="img"
          src={heroImg}
          alt="hero"
          sx={{ maxWidth: '100%', height: 'auto', mt: 'auto' }}
        />
      </Box>

      {/* ---------- right side ---------- */}
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexBasis: { xs: '100%', md: '50%' } }}>
        <Container maxWidth="sm">
          {/* Logo & Log in link */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Box component="img" src={logo} alt="logo" sx={{ width: 100, height: 100 }} />
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              Already have an account?{' '}
              <Link to="/student" style={{ color: '#0969da' }}>Sign in →</Link>
            </Typography>
          </Box>

          {/* Title */}
          <Typography
            component="h1"
            sx={{
              fontSize: 28,
              lineHeight: 1.25,
              mb: 2,
              color: '#4b4b4b',
              fontWeight: 400,
            }}
          >
            Sign up to PoJFit
          </Typography>

          {/* Form card */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: 4,
              border: '1px solid #d0d7de',
              borderRadius: 2,
              backgroundColor: '#fff',
              boxShadow: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              required
              label="Email"
              fullWidth
              size="small"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <Box>
              <TextField
                required fullWidth size="small"
                label="Password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPw(!showPw)} edge="end" size="small">
                        {showPw ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderColor: pwScore >= 2 ? '#2da44e' : undefined,
                  },
                }}
              />
              <Typography variant="caption" sx={{ ml:'14px', mt: 0.5, display: 'block', color: '#586069' }}>
                Password should be at least 15 characters OR at least 8 characters
                including a number and a lowercase letter.
              </Typography>
              {password && (
                <LinearProgress
                  variant="determinate"
                  value={(pwScore + 1) * 25}
                  color={pwColor}
                  sx={{ height: 6, borderRadius: 3, mt: 1 }}
                />
              )}
            </Box>

            {/* confirm password */}
            <Box>
                <TextField
                  required
                  fullWidth
                  size="small"
                  label="Confirm Password"
                  type={showPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  error={!!confirmPassword && confirmPassword !== password}
                  helperText={
                    !!confirmPassword && confirmPassword !== password
                      ? 'Passwords do not match'
                      : 'Re-enter your password to confirm.'
                  }
                  slotProps={{
                    formHelperText: {
                        sx: { ml: '14px'},
                    },
                  }}
                  sx={{ mt: -1 }}   
                />
            </Box>
            
            {/* username? need or not */}
            {/* <Box>
              <TextField
                required fullWidth size="small"
                label="Username"
                value={username}
                onChange={e => {
                  setUsername(e.target.value);
                  checkUsername(e.target.value);
                }}
                error={nameOK === false}
                helperText={
                  nameOK === false
                    ? `Username ${username} is not available. Try another.`
                    : 'Username may only contain alphanumeric chars or hyphens; cannot begin or end with hyphen.'
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    ...(nameOK === false && { borderColor: '#d1242f' }),
                  },
                }}
              />
            </Box> */}

            <TextField
              select
              label="Your Country/Region"
              size="small"
              fullWidth
              value={country}
              onChange={e => setCountry(e.target.value)}
            >
              {COUNTRIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>

            <FormControlLabel
              control={
                <Checkbox
                  checked={agreeMail}
                  onChange={e => setAgreeMail(e.target.checked)}
                  size="small"
                />
              }
              label="Receive occasional product updates and announcements"
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                backgroundColor: '#000',
                '&:hover': { backgroundColor: '#32383f' },
                py: 1.2,
                fontWeight: 600,
              }}
            >
              {loading ? 'Creating…' : 'Sing Up >'}
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
