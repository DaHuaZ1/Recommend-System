import { useState } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

// Import page and UI components
import HomeStd from './components/HomepageStd';
import LoginStd from './components/loginPageStd';
import Signup from './components/registerPage';
import LoginStf from './components/loginPageStf';
import HomeStf from './components/HomepageStf';

// Import MUI components
import CssBaseline from '@mui/material/CssBaseline';

function App() {
  
  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
    <BrowserRouter>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<LoginStd setToken={setToken}/>} />
        <Route path="/indexStd" element={<HomeStd token={token}/>} />
        <Route path="/indexStf" element={<HomeStf token={token}/>} />
        <Route path="/student" element={<LoginStd setToken={setToken} />} />
        <Route path="/staff" element={<LoginStf setToken={setToken} />} />
        <Route path="/signup" element={<Signup setToken={setToken} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
