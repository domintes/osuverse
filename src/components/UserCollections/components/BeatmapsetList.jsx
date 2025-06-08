import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import BeatmapsetGroup from './BeatmapsetGroup';
import BeatmapItem from '../BeatmapItem';
import { groupBeatmapsBySet, sortBeatmaps } from '../../../utils/beatmapUtils';
import './beatmapsetGroup.scss';

/**
 * Komponent wyświetlający listę beatmap zgrupowanych po beatmapsetach
 */
const BeatmapsetList = ({
  beatmaps,
  sortBy = 'artist',
  sortOrder = 'asc',
  onEdit,
  onDelete,
  onToggleFavorite,
  collections // Dodajemy collections jako props
}) => {
  // Grupuj beatmapy według beatmapsetów
  const beatmapsets = useMemo(() => {
    const grouped = groupBeatmapsBySet(beatmaps);
    
    // Sortuj beatmapsety
    return Object.values(grouped).sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'artist':
          valueA = a.artist.toLowerCase();
          valueB = b.artist.toLowerCase();
          break;
        case 'title':
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        case 'creator':
          valueA = a.creator.toLowerCase();
          valueB = b.creator.toLowerCase();
          break;
        case 'difficulty':
          // Średnia trudność wszystkich difficulty w secie
          valueA = a.difficulties.reduce((sum, d) => sum + (d.difficulty_rating || 0), 0) / a.difficulties.length;
          valueB = b.difficulties.reduce((sum, d) => sum + (d.difficulty_rating || 0), 0) / b.difficulties.length;
          break;
        default:
          valueA = a.artist.toLowerCase();
          valueB = b.artist.toLowerCase();
      }
      
      return sortOrder === 'asc' ? 
        (valueA < valueB ? -1 : 1) : 
        (valueA > valueB ? -1 : 1);
    });
  }, [beatmaps, sortBy, sortOrder]);
  
  if (!beatmaps || beatmaps.length === 0) {
    return <div className="empty-beatmaps">No beatmaps found.</div>;
  }
  
  if (beatmapsets.length === 0) {
    return <div className="empty-beatmaps">Error grouping beatmaps.</div>;
  }
  
  return (
    <div className="beatmapset-list">      {beatmapsets.map(beatmapset => (
        <BeatmapsetGroup 
          key={beatmapset.id} 
          beatmapset={beatmapset}
          // Dla beatmapsetów z 1 trudnością zawsze domyślnie rozwinięte
          // Dla pozostałych zwijane domyślnie (obsługa w komponencie BeatmapsetGroup)
          defaultExpanded={false}
        >
          {beatmapset.difficulties.map(beatmap => (
            <BeatmapItem
              key={beatmap.id}
              beatmap={beatmap}
              collections={collections} // Dodano przekazanie collections
              onEdit={onEdit ? () => onEdit(beatmap) : undefined}
              onDelete={onDelete ? () => onDelete(beatmap) : undefined}
              onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(beatmap) : undefined}
            />
          ))}
        </BeatmapsetGroup>
      ))}
    </div>
  );
};

BeatmapsetList.propTypes = {
  beatmaps: PropTypes.array.isRequired,
  collections: PropTypes.object, // Dodajemy collections do propTypes
  sortBy: PropTypes.string,
  sortOrder: PropTypes.string,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onToggleFavorite: PropTypes.func
};

export default BeatmapsetList;
