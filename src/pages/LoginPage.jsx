import React from 'react';
import { useAuth } from '../auth/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const { login, error } = useAuth();

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">Witaj w Osuverse!</h1>
        <p className="login-description">
          Zaloguj się przez swoje konto osu!, aby rozpocząć zarządzanie kolekcjami beatmap.
        </p>
        
        <button className="login-button" onClick={login}>
          <div className="login-button-content">
            <img 
              src="/osu-logo.png" 
              alt="osu! logo" 
              className="login-button-icon"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
            <span>Zaloguj przez osu!</span>
          </div>
        </button>
        
        {error && (
          <div className="login-error">
            <p>{error}</p>
          </div>
        )}
        
        <div className="login-info">
          <h3>Co to jest Osuverse?</h3>
          <p>
            Osuverse to aplikacja do zarządzania kolekcjami beatmap w osu!.
            Możesz organizować swoje ulubione mapy, wyszukiwać nowe i udostępniać 
            swoje kolekcje innym graczom!
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 