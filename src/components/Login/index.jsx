import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import './Login.css';

const Login = () => {
  const { login } = useAuth();

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-logo">
          <h1>Osuverse</h1>
          <div className="login-tagline">Twoja internetowa kolekcja beatmap</div>
        </div>
        <button className="login-button" onClick={login}>
          Zaloguj przez osu!
        </button>
      </div>
    </div>
  );
};

export default Login; 