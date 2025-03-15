import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTrash } from 'react-icons/fa';
import useBeatmapStore from '../../stores/beatmapStore';
import './CollectionDetails.css';

const CollectionDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { collection } = location.state || {};
  const { removeBeatmapFromCollection } = useBeatmapStore();

  if (!collection) {
    return (
      <div className="collection-details">
        <div className="collection-details__error">
          Nie znaleziono kolekcji. Wróć do listy kolekcji.
        </div>
        <button 
          className="collection-details__back-button"
          onClick={() => navigate('/collections')}
        >
          <FaArrowLeft /> Wróć do kolekcji
        </button>
      </div>
    );
  }

  const beatmapsArray = collection.beatmaps instanceof Map 
    ? Array.from(collection.beatmaps.values())
    : Array.isArray(collection.beatmaps) 
      ? collection.beatmaps 
      : [];

  const handleRemoveBeatmap = (beatmapId) => {
    removeBeatmapFromCollection(collection.id, beatmapId);
  };

  return (
    <div className="collection-details">
      <div className="collection-details__header">
        <button 
          className="collection-details__back-button"
          onClick={() => navigate('/collections')}
        >
          <FaArrowLeft /> Wróć do kolekcji
        </button>
        <h2 className="collection-details__title">{collection.name}</h2>
        <div className="collection-details__count">
          {beatmapsArray.length} beatmap w kolekcji
        </div>
      </div>

      {beatmapsArray.length > 0 ? (
        <div className="beatmap-list">
          {beatmapsArray.map(beatmap => (
            <div key={beatmap.id} className="beatmap-item">
              <div className="beatmap-item__cover">
                <img 
                  src={beatmap.covers?.cover || 'https://assets.ppy.sh/beatmaps/1189904/covers/cover.jpg'} 
                  alt={beatmap.title} 
                />
              </div>
              <div className="beatmap-item__info">
                <div className="beatmap-item__title">{beatmap.title}</div>
                <div className="beatmap-item__artist">{beatmap.artist}</div>
                <div className="beatmap-item__mapper">mapped by {beatmap.creator}</div>
                <div className="beatmap-item__stats">
                  <span className="beatmap-item__stat">
                    {beatmap.bpm} BPM
                  </span>
                  <span className="beatmap-item__stat">
                    {beatmap.status}
                  </span>
                  <span className="beatmap-item__stat">
                    {beatmap.star_rating?.toFixed(2) || '?'} ★
                  </span>
                </div>
              </div>
              <div className="beatmap-item__actions">
                <button 
                  className="beatmap-item__remove-button"
                  onClick={() => handleRemoveBeatmap(beatmap.id)}
                  title="Usuń z kolekcji"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="collection-details__empty">
          Ta kolekcja jest pusta. Dodaj beatmapy do kolekcji.
        </div>
      )}
    </div>
  );
};

export default CollectionDetails;
