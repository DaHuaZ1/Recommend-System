import React from 'react';
import TopBar from './Bar';

const HomeStd = (props) => {
    // const navigate = useNavigate();
    return (
        <div className="container">
            <TopBar />
            <h1>Welcome to the Homepage</h1>
            <p>This is a simple homepage component.</p>
        </div>
    );
};

export default HomeStd;