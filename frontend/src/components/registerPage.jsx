// React & Router
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// MUI components
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Typography from "@mui/material/Typography";
import Alert from '@mui/material/Alert';

// Modal from Ant Design
import { Modal } from 'antd';

// Auth constants (keys for localStorage)
import AUTH from "../Constant";

// Custom captcha rendering component
import CanvasCaptcha from './CanvasCaptcha';
import backendURL from '../backendURL'; // Import backend URL

const Signup = (props) => {
  // Form fields
  const [email, setEmail] = useState("");
//   const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Captcha values
  const [captcha, setCaptcha] = useState("");            // Generated captcha
  const [inputCaptcha, setInputCaptcha] = useState("");  // User input

  // Error handling
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Captcha generator function
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 4; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    setCaptcha(result);
  };

  // Generate captcha on component mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  // Handle form submission
  const register = (e) => {
    e.preventDefault();

    // Validate password match
    if (password !== confirmPassword) {
      Modal.error({
        title: 'Password Mismatch',
        content: 'The passwords you entered do not match. Please double-check.',
      });
      return;
    }

    // UI testing bypass for captcha
    const isBypassCaptcha = import.meta.env.MODE === 'development' && inputCaptcha.toUpperCase() === 'AAAA';
    // Validate captcha input
    if (inputCaptcha.toUpperCase() !== captcha.toUpperCase() && !isBypassCaptcha) {
      Modal.error({
        title: 'Invalid Captcha',
        content: 'The captcha you entered is incorrect. Please try again.',
      });
      generateCaptcha(); // Refresh captcha
      return;
    }

    // API call to register
    const url = `${backendURL}/admin/auth/register`;
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        // name: username
      })
    })
      .then(async (response) => {
        const data = await response.json();
        if (response.ok && data.token) {
          // Store token and email locally
          localStorage.setItem(AUTH.USER_KEY, email);
          localStorage.setItem(AUTH.Token_key, data.token);

          // Set parent token state and redirect
          props.setToken(data.token);
          navigate("/dashboard");
        } else {
          setError(data.error || "Legendary Secret Key Registration Failed");
        }
      })
      .catch((error) => {
        setError("Network error.", error);
      });
  }

  return (
    <Container maxWidth="sm" sx={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2,
      py: 4,
    }}>
      <Box
        component="form"
        onSubmit={register}
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
          backgroundColor: 'background.paper',
        }}
      >
        {/* Title */}
        <Typography variant="h5" gutterBottom>
          Welcome! Please signup to continue
        </Typography>

        {/* Show error if any */}
        {error && (
          <Alert severity="error">{error}</Alert>
        )}

        {/* Input fields */}
        <TextField
          required
          id="email-register-input"
          label="email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        {/* <TextField
          required
          id="username-register-input"
          label="username"
          onChange={(e) => setUsername(e.target.value)}
        /> */}
        <TextField
          required
          id="password-register-input"
          label="password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          required
          id="confirm-password-register-input"
          label="confirm password"
          type="password"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {/* Captcha input and preview */}
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            required
            label="Captcha"
            value={inputCaptcha}
            onChange={(e) => setInputCaptcha(e.target.value)}
          />
          <CanvasCaptcha text={captcha} />
        </Box>

        {/* Submit button */}
        <Button type="submit" variant="contained">
          Signup
        </Button>
      </Box>
    </Container>
  )
}

export default Signup;