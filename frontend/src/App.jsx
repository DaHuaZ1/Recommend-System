import { useState } from 'react';
import { Routes, Route, BrowserRouter, useLocation } from 'react-router-dom';

// Import page and UI components
import Home from './components/Homepage';
import LoginStd from './components/loginPageStd';
import Signup from './components/registerPage';
import LoginStf from './components/loginPageStf';
import CssBaseline from '@mui/material/CssBaseline';

function App() {
  
  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
    <BrowserRouter>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<LoginStd setToken={setToken}/>} />
        <Route path="/index" element={<Home token={token}/>} />
        <Route path="/student" element={<LoginStd setToken={setToken} />} />
        <Route path="/staff" element={<LoginStf setToken={setToken} />} />
        <Route path="/signup" element={<Signup setToken={setToken} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
