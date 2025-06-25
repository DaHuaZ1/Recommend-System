import React from "react";

const HomeStf = (props) => {
  return (
    <div className="container">
      {props.token === null ? "Join a Game" : "Go to Dashboard"}
      <h1>Welcome to the Staff Homepage</h1>
      <p>This is a simple homepage component for staff.</p>
    </div>
  );
}

export default HomeStf;