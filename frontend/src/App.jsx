import { useState } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

// Import page and UI components
import HomeStd from './components/HomepageStd';
import LoginStd from './components/loginPageStd';
import Signup from './components/registerPage';
import UploadStd from './components/uploadPageStd';
import ProfilePageStd from './components/profilePageStd';
import RecommendStd from './components/recommendStd';
import GroupStd from './components/groupPageStd';
import LoginStf from './components/loginPageStf';
import HomeStf from './components/HomepageStf';
import UploadStf from './components/uploadPageStf';
import GroupStf from './components/groupPageStf';

// Import MUI components
import CssBaseline from '@mui/material/CssBaseline';

// Import custom components
import ScrollToTop from './components/scrollToTop';

function App() {

  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
    <BrowserRouter>
      <CssBaseline />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LoginStd setToken={setToken} />} />
        <Route path="/student/index" element={<HomeStd token={token} />} />
        <Route path="/student/login" element={<LoginStd setToken={setToken} />} />
        <Route path='/student/upload' element={<UploadStd token={token} />} />
        <Route path="/student/profile" element={<ProfilePageStd token={token} />} />
        <Route path="/student/group/recommend" element={<RecommendStd token={token} />} />
        <Route path="/student/group" element={<GroupStd token={token} />} />

        {/* Staff routes */}
        <Route path="/staff/index" element={<HomeStf token={token} />} />
        <Route path="/staff/login" element={<LoginStf setToken={setToken} />} />
        <Route path='/staff/upload' element={<UploadStf token={token} />} />
        <Route path="/staff/group" element={<GroupStf token={token} />} />

        {/* Signup route */}
        <Route path="/signup" element={<Signup setToken={setToken} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
