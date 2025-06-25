import React from 'react';

const HomeStd = (props) => {
    // const navigate = useNavigate();
    return (
        <div className="container">
            {props.token === null ? 'Join a Game' : 'Go to Dashboard'}
            <h1>Welcome to the Homepage</h1>
            <p>This is a simple homepage component.</p>
        </div>
    );
};

export default HomeStd;