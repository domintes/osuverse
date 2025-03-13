import React from 'react';
import { useAuth } from '../auth/AuthContext';
import OsuverseSearch from '../components/OsuverseSearch/OsuverseSearch';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header__logo">Osuverse</div>
      <div className="header__search">
        <OsuverseSearch placeholder="Szukaj beatmap, kolkcji, mapperów..." />
      </div>
      <div className="header__user">
        {user && (
          <>
            <div className="header__user-info">
              <img 
                src={user.avatar_url || 'https://a.ppy.sh/1'} 
                alt={user.username} 
                className="header__user-avatar"
              />
              <span className="header__user-name">{user.username}</span>
            </div>
            <button className="header__logout-button" onClick={logout}>
              Wyloguj
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
