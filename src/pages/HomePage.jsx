import React from 'react';
import { useAuth } from '../auth/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <div className="home-page__welcome">
        <h1 className="home-page__title">Witaj w Osuverse, {user?.username || 'użytkowniku'}!</h1>
        <p className="home-page__description">
          Osuverse to miejsce, gdzie możesz zarządzać swoimi kolekcjami beatmap do gry osu!.
          Przeglądaj, organizuj i dziel się swoimi ulubionymi beatmapami.
        </p>
      </div>
      
      <div className="home-page__features">
        <div className="feature-card">
          <h3 className="feature-card__title">Zarządzaj kolekcjami</h3>
          <p className="feature-card__description">
            Twórz własne kolekcje beatmap i organizuj je według własnych preferencji.
          </p>
        </div>
        
        <div className="feature-card">
          <h3 className="feature-card__title">Dodawaj beatmapy</h3>
          <p className="feature-card__description">
            Łatwo dodawaj beatmapy do swoich kolekcji, wyszukując je po ID lub nazwie.
          </p>
        </div>
        
        <div className="feature-card">
          <h3 className="feature-card__title">Śledź mapperów</h3>
          <p className="feature-card__description">
            Dodawaj ulubionych mapperów i bądź na bieżąco z ich nowymi beatmapami.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
