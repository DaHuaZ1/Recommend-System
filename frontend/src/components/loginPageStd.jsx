// React & Router
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// MUI components
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Typography from "@mui/material/Typography";
import Alert from '@mui/material/Alert';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// Ant Design Modal
import { Modal } from 'antd';

// Auth constant (stores localStorage keys)
import AUTH from "../Constant";

// Custom component for rendering captcha image
import CanvasCaptcha from './CanvasCaptcha'; 
import backendURL from '../backendURL'; // Import backend URL

import logo from '../assets/logo.jpg'; // Import logo image


const LoginStd = (props) => {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [tab, setTab] = useState(0);

  // Error state for display
  const [error, setError] = useState("");

  // Captcha logic
  const [captcha, setCaptcha] = useState("");             // Correct captcha
  const [inputCaptcha, setInputCaptcha] = useState("");   // User input captcha

  const navigate = useNavigate();

  // Function to randomly generate a 4-character captcha
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 4; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    setCaptcha(result);
  };

  // Generate captcha on initial mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleTabChange = (event, newValue) => {
    if (newValue === 1) {
      navigate("/staff/login"); // Redirect to register page
      return;
    }

    setTab(newValue);
  };

  // Login handler
  const signin = async (e) => {
    e.preventDefault(); // Prevent default form submission

    const url = `${backendURL}/api/login`;

    // UI testing bypass for captcha
    const isBypassCaptcha = import.meta.env.MODE === 'development' && inputCaptcha.toUpperCase() === 'AAAA';
    // Captcha validation first
    if (inputCaptcha.toUpperCase() !== captcha.toUpperCase() && !isBypassCaptcha) {
      Modal.error({
        title: 'Invalid Captcha',
        content: 'The captcha you entered is incorrect. Please try again.',
      });
      generateCaptcha(); // Regenerate on failure
      return;
    }

    // Make POST request with email and password
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password})
    });

    const data = await response.json();

    // If login successful, save token and email
    if (data.token) {
      localStorage.setItem(AUTH.USER_KEY, email);
      localStorage.setItem(AUTH.Token_key, data.token);
      localStorage.setItem("Grouped", data.grouped || false);
      props.setToken(data.token); // Set parent state
      if (data.resume === true) {
        navigate("/student/index"); // Redirect to student index page
      } else {
        navigate("/student/upload"); // Redirect to student upload resume page
      }     
    } else {
      // Show error from backend or generic message
      setError(data.error || "Login Failed");
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
      }}
    >
      {/* Icon */}
      <Box sx={{ mb: 1 }}>
        <img
          src={logo}
          alt="Logo"
          style={{ width: '100px', height: '100px' }}
        />
      </Box>
      {/* Title */}
      <Typography
        component="h1"
        sx={{
          fontSize: '28px',
          lineHeight: 1.25,
          fontWeight: 300,
          letterSpacing: '-0.02em',
          fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI",
                      Roboto, "Helvetica Neue", Arial, sans-serif`,
          color: '#4b4b4b',
        }}
      >
        Log in to PoJFit
      </Typography>

      {/* Form box */}
      <Box
        component="form"
        onSubmit={signin}
        sx={{
          width: '70%',
          maxWidth: { xs: 360, sm: 500, md: 800 },
          mx: 'auto',
          p: { xs: 2, sm: 3 },
          boxShadow: 3,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          backgroundColor: '#f6f8fa',
        }}
      >

        {/* Tab navigation */}
        <Tabs value={tab} onChange={handleTabChange} centered sx={{ mt: -1.5, mb: 0}}>
            <Tab label="Student" id="student-tab" />
            <Tab label="Staff" id="staff-tab" />
        </Tabs>

        {tab === 0 && (
            <>
                {/* Error alert */}
                {error && (
                    <Alert severity="error">{error}</Alert>
                )}

                {/* Email input */}
                <TextField
                    required
                    label="Email"
                    fullWidth
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variant="outlined"
                    id="email-login-input"
                    sx={{ 
                      backgroundColor: 'white',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                     },
                      borderRadius: 2,
                    }}
                    size="small"
                />

                {/* Password input */}
                <TextField
                    required
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    variant="outlined"
                    id="password-login-input"
                    sx={{ 
                      backgroundColor: 'white',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                     },
                      borderRadius: 2,
                    }}
                    size="small"
                />

                {/* Captcha input and image */}
                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                      required
                      label="Captcha"
                      value={inputCaptcha}
                      onChange={(e) => setInputCaptcha(e.target.value)}
                      sx={{ 
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                      },
                        borderRadius: 2,
                      }}
                      size="small"
                  />
                  <CanvasCaptcha text={captcha} />
                </Box>

                {/* Submit button */}
                <Button type="submit" variant="contained" sx={{ backgroundColor: "#1f883d"}}>
                    Login
                </Button>
            </>
        )}
      </Box>
      <Box>
        <Typography variant="body2" color="textSecondary" align="center">
          Don't have an account? <Button onClick={() => navigate("/signup")} color="primary">Sign Up</Button>
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginStd;
