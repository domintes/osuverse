import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="about-section">
        <h1 className="about-title">O projekcie Osuverse</h1>
        <p className="about-description">
          Osuverse to aplikacja webowa stworzona dla społeczności graczy osu!, 
          umożliwiająca zarządzanie kolekcjami beatmap, śledzenie ulubionych mapperów 
          i organizację biblioteki map.
        </p>
      </div>
      
      <div className="about-section">
        <h2 className="about-subtitle">Funkcje</h2>
        <ul className="about-list">
          <li className="about-list-item">Tworzenie i zarządzanie kolekcjami beatmap</li>
          <li className="about-list-item">Wyszukiwanie beatmap po nazwie, artyście, mapperze</li>
          <li className="about-list-item">Śledzenie ulubionych mapperów</li>
          <li className="about-list-item">Synchronizacja z kontem osu!</li>
          <li className="about-list-item">Eksport kolekcji do formatu .osdb</li>
        </ul>
      </div>
      
      <div className="about-section">
        <h2 className="about-subtitle">Technologie</h2>
        <p className="about-description">
          Aplikacja została stworzona przy użyciu następujących technologii:
        </p>
        <ul className="about-list">
          <li className="about-list-item">React.js - biblioteka JavaScript do budowania interfejsów użytkownika</li>
          <li className="about-list-item">Vite - szybkie narzędzie do budowania aplikacji</li>
          <li className="about-list-item">CSS - do stylizacji komponentów</li>
          <li className="about-list-item">osu! API v2 - do pobierania danych o beatmapach i użytkownikach</li>
          <li className="about-list-item">Zustand - do zarządzania stanem aplikacji</li>
        </ul>
      </div>
      
      <div className="about-section">
        <h2 className="about-subtitle">Kontakt</h2>
        <p className="about-description">
          Jeśli masz pytania, sugestie lub znalazłeś błąd, skontaktuj się z nami:
        </p>
        <div className="contact-info">
          <div className="contact-item">
            <span className="contact-label">Email:</span>
            <a href="mailto:contact@osuverse.com" className="contact-link">contact@osuverse.com</a>
          </div>
          <div className="contact-item">
            <span className="contact-label">GitHub:</span>
            <a href="https://github.com/osuverse" className="contact-link" target="_blank" rel="noopener noreferrer">github.com/osuverse</a>
          </div>
          <div className="contact-item">
            <span className="contact-label">Discord:</span>
            <a href="https://discord.gg/osuverse" className="contact-link" target="_blank" rel="noopener noreferrer">discord.gg/osuverse</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
