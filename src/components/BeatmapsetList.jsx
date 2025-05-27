import React, { useState } from 'react';
import './beatmapsetList.scss';

export default function BeatmapsetList({ beatmapsets, onAddToCollection }) {
  if (!beatmapsets?.length) return <div className="beatmapset-list-empty">Brak wyników.</div>;
  return (
    <div className="beatmapset-list">
      {beatmapsets.map(set => (
        <BeatmapsetListItem key={set.id} set={set} onAddToCollection={onAddToCollection} />
      ))}
    </div>
  );
}

function BeatmapsetListItem({ set, onAddToCollection }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={`beatmapset-list-item${expanded ? ' expanded' : ''}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="beatmapset-main">
        <div className="cover" style={{ backgroundImage: `url(${set.covers?.cover || set.cover || ''})` }} />
        <div className="info">
          <div className="title">{set.artist} – {set.title}</div>
          <div className="mapper">mapped by <span>{set.creator}</span></div>
          <div className="tags">
            {(set.tags || []).map(tag => (
              <span className="tag-chip" key={tag}>#{tag}</span>
            ))}
          </div>
        </div>
        <button className="add-btn" onClick={() => onAddToCollection?.(set)}>Dodaj do kolekcji</button>
      </div>
      {expanded && (
        <div className="difficulties-panel">
          <div className="difficulties-list">
            {set.beatmaps?.map(diff => (
              <div className="difficulty-rect" key={diff.id} title={diff.version} style={{ background: getDiffColor(diff.difficulty_rating) }}>
                <span>{diff.version}</span>
                <span className="stars">{diff.difficulty_rating?.toFixed(2)}★</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getDiffColor(star) {
  if (star >= 6.5) return '#ff1744';
  if (star >= 5.5) return '#ff9100';
  if (star >= 4.5) return '#ffd600';
  if (star >= 3.5) return '#00e676';
  return '#00bcd4';
}
