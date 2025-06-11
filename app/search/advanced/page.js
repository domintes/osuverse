'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAtom } from 'jotai';
import { beatmapsSortAtom, beatmapsFilterAtom, sortedAndFilteredBeatmapsAtom, allBeatmapsIdsAtom, beatmapAtomFamily, setBeatmapDataAtom } from '@/store/beatmapsAtomFamily';
import NeonBorderBox from '@/components/NeonBorderBox';
import { AnimatedNeonButton, FadeIn, SlideIn } from '@/components/AnimatedComponents';
import DataTable from '@/components/BeatmapSearchResults/DataTable';
import AdvancedSearchEngine from '@/components/SearchInput/AdvancedSearchEngine';
import EnhancedTagInput from '@/components/TagInput/EnhancedTagInput';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';

import './advancedSearchPage.scss';

/**
 * Zaawansowana strona wyszukiwania beatmap z użyciem nowych komponentów
 * Wykorzystuje:
 * - Jotai atomFamily i selectAtom do filtrowania i sortowania
 * - TanStack Table do tabeli z danymi
 * - FuseJS do zaawansowanego wyszukiwania
 * - Motion do animacji
 * - Tagify do zarządzania tagami
 */
export default function AdvancedSearchPage() {
  // Stany Jotai
  const [beatmaps = []] = useAtom(sortedAndFilteredBeatmapsAtom);
  const [filter, setFilter] = useAtom(beatmapsFilterAtom);
  const [sort, setSort] = useAtom(beatmapsSortAtom);
  const [_, setAllBeatmapsIds] = useAtom(allBeatmapsIdsAtom);
  const [__, setBeatmapData] = useAtom(setBeatmapDataAtom);
  
  // Inicjalizacja przykładowych danych
  useEffect(() => {
    // Przykładowe dane beatmap
    const sampleBeatmaps = [
      {
        id: '1',
        title: 'Freedom Dive',
        artist: 'xi',
        creator: 'Blue Dragon',
        difficulty_rating: 8.04,
        bpm: 222.22,
        length: 259,
        version: 'FOUR DIMENSIONS'
      },
      {
        id: '2',
        title: 'GHOST',
        artist: 'Camellia',
        creator: 'NatsumeRin',
        difficulty_rating: 7.1,
        bpm: 174,
        length: 180,
        version: 'Haunted'
      },
      {
        id: '3',
        title: 'Yomi yori Kikoyu',
        artist: 'Imperial Circus Dead Decadence',
        creator: 'DoKito',
        difficulty_rating: 8.65,
        bpm: 220,
        length: 540,
        version: 'Kyouaku'
      }
    ];
    
    // Bezpośrednio ustawiamy identyfikatory beatmap
    setAllBeatmapsIds(sampleBeatmaps.map(beatmap => beatmap.id));
  }, [setAllBeatmapsIds]);
  
  // Dodatkowy efekt do ustawiania danych beatmap
  useEffect(() => {
    // Przykładowe dane beatmap (te same co wyżej)
    const sampleBeatmaps = [
      {
        id: '1',
        title: 'Freedom Dive',
        artist: 'xi',
        creator: 'Blue Dragon',
        difficulty_rating: 8.04,
        bpm: 222.22,
        length: 259,
        version: 'FOUR DIMENSIONS'
      },
      {
        id: '2',
        title: 'GHOST',
        artist: 'Camellia',
        creator: 'NatsumeRin',
        difficulty_rating: 7.1,
        bpm: 174,
        length: 180,
        version: 'Haunted'
      },
      {
        id: '3',
        title: 'Yomi yori Kikoyu',
        artist: 'Imperial Circus Dead Decadence',
        creator: 'DoKito',
        difficulty_rating: 8.65,
        bpm: 220,
        length: 540,
        version: 'Kyouaku'
      }
    ];
    
    // Ustawienie danych dla każdej beatmapy
    sampleBeatmaps.forEach(beatmap => {
      setBeatmapData({
        beatmapId: beatmap.id,
        data: beatmap
      });
    });
  }, [setBeatmapData]);

  // Lokalne stany
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [tagSuggestions] = useState([
    'stream', 'jump', 'tech', 'speed', 'aim', 'easy', 'medium', 'hard', 'insane', 'expert'
  ]);

  // Konfiguracja kolumn tabeli
  const columns = useMemo(() => [
    {
      accessorKey: 'title',
      header: 'Tytuł',
      cell: info => <div className="beatmap-title">{info.getValue()}</div>,
    },
    {
      accessorKey: 'artist',
      header: 'Artysta'
    },
    {
      accessorKey: 'creator',
      header: 'Mapper'
    },
    {
      accessorKey: 'difficulty_rating',
      header: 'SR',
      cell: info => <div className="difficulty-cell">{Number(info.getValue()).toFixed(2)}★</div>,
    },
    {
      accessorKey: 'bpm',
      header: 'BPM',
    },
    {
      accessorKey: 'length',
      header: 'Długość',
      cell: info => {
        const seconds = info.getValue();
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return <span>{mins}:{secs.toString().padStart(2, '0')}</span>;
      },
    }
  ], []);

  // Zmiana sortowania
  const handleSortChange = (field) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Aktualizacja filtrów na podstawie wyszukiwania
  const handleSearch = (query) => {
    setFilter(prev => ({
      ...prev,
      searchTerm: query
    }));
  };

  // Aktualizacja filtrów na podstawie tagów
  const handleTagsChange = (tags) => {
    setSelectedTags(tags);
    
    // Logika konwersji tagów na filtry
    const difficulty = tags.find(tag => ['easy', 'medium', 'hard', 'insane', 'expert'].includes(tag.value));
    const modes = tags.filter(tag => ['stream', 'jump', 'tech', 'speed', 'aim'].includes(tag.value))
      .map(tag => tag.value);
    
    setFilter(prev => ({
      ...prev,
      difficulty: difficulty ? getDifficultyValue(difficulty.value) : null,
      modes: modes.length > 0 ? modes : null
    }));
  };

  // Pomocnicza funkcja do konwersji tagu trudności na wartość liczbową
  const getDifficultyValue = (diffTag) => {
    const map = {
      'easy': 2,
      'medium': 3.5,
      'hard': 5,
      'insane': 6.5,
      'expert': 8
    };
    return map[diffTag] || null;
  };

  // Resetowanie filtrów
  const resetFilters = () => {
    setFilter({
      difficulty: null,
      mode: null,
      bpm: { min: null, max: null },
      length: { min: null, max: null },
      searchTerm: '',
    });
    setSelectedTags([]);
  };

  return (
    <div className="advanced-search-page">
      <FadeIn duration={0.6}>
        <h1 className="page-title">Zaawansowane wyszukiwanie beatmap</h1>
      </FadeIn>

      <SlideIn direction="up" delay={0.2}>
        <NeonBorderBox className="search-panel">
          <div className="search-tools">
            <div className="search-input-container">
              <AdvancedSearchEngine
                data={beatmaps.map(b => b.data)}
                keys={['title', 'artist', 'creator', 'version']}
                threshold={0.4}
                onResultsChange={setSearchResult}
                placeholder="Wyszukaj po tytule, artyście, creatorze..."
                className="main-search"
              />
            </div>

            <div className="tags-container">
              <EnhancedTagInput
                value={selectedTags}
                onChange={handleTagsChange}
                suggestions={tagSuggestions}
                placeholder="Dodaj tagi do filtrowania..."
                className="tags-input"
                maxTags={5}
              />
            </div>

            <div className="filters-actions">
              <AnimatedNeonButton 
                onClick={resetFilters}
                color="#ff5555"
              >
                <Filter size={16} /> Reset filtrów
              </AnimatedNeonButton>
              
              <div className="sort-controls">
                <span className="sort-label">Sortuj:</span>
                <button 
                  className={`sort-button ${sort.field === 'difficulty_rating' ? 'active' : ''}`}
                  onClick={() => handleSortChange('difficulty_rating')}
                >
                  SR {sort.field === 'difficulty_rating' && (sort.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                </button>
                <button 
                  className={`sort-button ${sort.field === 'bpm' ? 'active' : ''}`}
                  onClick={() => handleSortChange('bpm')}
                >
                  BPM {sort.field === 'bpm' && (sort.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                </button>
              </div>
            </div>
          </div>
        </NeonBorderBox>
      </SlideIn>

      <SlideIn direction="up" delay={0.4}>
        <NeonBorderBox className="results-panel">
          <DataTable
            data={searchResult.length > 0 ? searchResult.map(r => r.item) : beatmaps.map(b => b.data)}
            columns={columns}
            initialSortBy={[{ id: 'difficulty_rating', desc: true }]}
          />
        </NeonBorderBox>
      </SlideIn>
    </div>
  );
}
