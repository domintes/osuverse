"use client";

import React, { useState, useRef } from 'react';
import './osuverseMainSearchBox.scss';
import { useAtom } from 'jotai';
import { collectionsAtom } from '../store/collectionAtom';
import OsuverseModal from './OsuverseModal/OsuverseModal';
import AddBeatmapForm from './OsuverseModal/AddBeatmapForm';
import { osuverseModalAtom } from '../store/osuverseModalAtom';
import BeatmapsetList from './BeatmapsetList';
import './beatmapsetList.scss';
import OsuverseDiv from './OsuverseDiv';

// TODO: Import Jotai atoms, modal system, and API hooks when ready

const getAllUserTags = (collections) => {
  // Zbierz wszystkie unikalne tagi użytkownika z beatmap w kolekcji
  const tagMap = {};
  Object.values(collections.beatmaps || {}).forEach(bm => {
    (bm.userTags || []).forEach(tag => {
      if (!tagMap[tag]) tagMap[tag] = 0;
      tagMap[tag]++;
    });
  });
  return Object.entries(tagMap).map(([tag, count]) => ({ tag, count }));
};

const OsuverseMainSearchBox = () => {
  // Stan wpisanego tekstu
  const [inputValue, setInputValue] = useState('');
  // Stan wybranych tagów
  const [selectedTags, setSelectedTags] = useState([]);
  // Stan podpowiedzi tagów
  const [tagSuggestions, setTagSuggestions] = useState([]);
  // Stan wyników lokalnych
  const [localResults, setLocalResults] = useState([]);
  // Stan wyników z API osu!
  const [osuApiResults, setOsuApiResults] = useState([]);
  // TODO: Stan modali
  const [collections] = useAtom(collectionsAtom);
  const [modals, setModals] = useAtom(osuverseModalAtom);
  const MODAL_ID = 'add-beatmap';
  const [modalBeatmap, setModalBeatmap] = useState(null);

  // Obsługa wpisywania tekstu
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    if (value.startsWith('#')) {
      const allTags = getAllUserTags(collections);
      const filtered = allTags.filter(t => t.tag.toLowerCase().startsWith(value.slice(1).toLowerCase()));
      setTagSuggestions(filtered);
    } else {
      setTagSuggestions([]);
    }
  };

  // Dodaj/usuwaj tag z wybranych
  const handleTagSelect = (tag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      setInputValue('');
      setTagSuggestions([]);
    } else {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    }
  };

  // Filtrowanie beatmap z kolekcji użytkownika na podstawie wybranych tagów
  const getFilteredBeatmaps = () => {
    if (!selectedTags.length) return [];
    // Zwróć tylko beatmapy, które mają WSZYSTKIE wybrane tagi
    return Object.values(collections.beatmaps || {}).filter(bm =>
      selectedTags.every(tag => (bm.userTags || []).includes(tag))
    );
  };

  // Renderuj podpowiedzi tagów
  const renderTagSuggestions = () => {
    if (!inputValue.startsWith('#') || tagSuggestions.length === 0) return null;
    return tagSuggestions.map(({ tag, count }) => (
      <div
        key={tag}
        className="tag-suggestion"
        onClick={() => handleTagSelect(tag)}
      >
        #{tag} <span className="tag-suggestion-count">({count})</span>
      </div>
    ));
  };

  // Renderuj wybrane tagi jako chipy
  const renderSelectedTags = () => (
    selectedTags.map(tag => (
      <div
        key={tag}
        className="tag-chip selected"
        onClick={() => handleTagSelect(tag)}
        title="Usuń lub odznacz tag"
      >
        #{tag}
      </div>
    ))
  );

  // Renderuj wyniki lokalne
  const renderLocalResults = () => {
    const filtered = getFilteredBeatmaps();
    if (!selectedTags.length) return null;
    return (
      <div className="local-results">
        <a
          href={`/collections?tag=${encodeURIComponent(selectedTags[0])}`}
          className="go-to-tag-link"
        >
          Przejdź do #{selectedTags[0]} w twoich kolekcjach
        </a>
        <div style={{ marginTop: 12 }}>
          {filtered.length === 0 && <div>Brak beatmap z tymi tagami.</div>}
          {filtered.map(bm => (
            <div key={bm.id} className="beatmap-card">
              <div
                className="cover"
                style={{ backgroundImage: `url(${bm.cover || bm.coverUrl || ''})` }}
              />
              <div className="info">
                <div style={{ fontWeight: 600 }}>{bm.artist} – {bm.title}</div>
                <div className="tags">
                  {(bm.userTags || []).map(tag => (
                    <span
                      key={tag}
                      className="tag-chip"
                      onClick={() => handleTagSelect(tag)}
                      style={{ marginRight: 4, cursor: 'pointer' }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Pobieranie wyników z API osu! (mock, do podmiany na fetch)
  const fetchOsuApiResults = async (query) => {
    // TODO: Zaimplementuj prawdziwe pobieranie z API osu! (np. /api/search)
    // Tu tylko przykładowe dane
    return [
      { id: 'osu1', artist: 'Camellia', title: 'Crystallized', tags: ['Cool_Techs'], cover: '', inCollection: false },
      { id: 'osu2', artist: 'Camellia', title: 'Gravity Crystals', tags: ['Cool_Techs'], cover: '', inCollection: false },
    ];
  };

  // Aktualizuj wyniki z API osu! po zmianie inputu lub tagów
  React.useEffect(() => {
    if (!inputValue && !selectedTags.length) {
      setOsuApiResults([]);
      return;
    }
    // Składamy zapytanie: tekst + tagi
    const query = [inputValue, ...selectedTags.map(t => `#${t}`)].join(' ').trim();
    fetchOsuApiResults(query).then(setOsuApiResults);
  }, [inputValue, selectedTags]);

  // Renderuj wyniki z API osu!
  const renderOsuApiResults = () => {
    if (!osuApiResults.length) return null;
    return (
      <div className="osu-api-results">
        <div className="osu-api-results-header">Wyniki z osu! (API v2)</div>
        <BeatmapsetList beatmapsets={osuApiResults} onAddToCollection={handleAddToCollectionClick} />
        {osuApiResults.length > 7 && (
          <button className="add-to-collection-btn" style={{ marginTop: 12 }}>Pokaż wszystkie</button>
        )}
      </div>
    );
  };

  // TODO: Zaimplementuj modal i formularz dodawania beatmapy z własnym stanem (Jotai)
  // To będzie osobny komponent/modal, który otwiera się po kliknięciu "Dodaj do kolekcji"
  // Stan modali i formularzy będzie trzymany w globalnym atomie (np. osuverseModalAtom)

  // Przykład obsługi kliknięcia (na razie tylko alert)
  const handleAddToCollectionClick = (beatmap) => {
    setModalBeatmap(beatmap);
    setModals(prev => ({
      ...prev,
      [MODAL_ID]: { open: true, state: {} }
    }));
  };

  const handleModalClose = () => {
    setModals(prev => ({
      ...prev,
      [MODAL_ID]: { ...prev[MODAL_ID], open: false }
    }));
    setModalBeatmap(null);
  };

  const handleAddBeatmapSubmit = (formData) => {
    // Dodaj beatmapę do kolekcji użytkownika (z tagami, notatką, priority, tag_value)
    if (!modalBeatmap) return handleModalClose();
    // Przygotuj tagi z wartościami (jeśli w przyszłości AddBeatmapForm będzie pozwalał na tag_value)
    const userTags = (formData.tags || []).map(tag => {
      if (typeof tag === 'object' && tag.tag) return tag;
      // domyślny tag_value = 0
      return { tag, tag_value: 0 };
    });
    // Wylicz beatmap_priority na podstawie sumy tag_value
    const beatmap_priority = userTags.reduce((sum, t) => sum + (t.tag_value || 0), 0);
    const newBeatmap = {
      ...modalBeatmap,
      userTags,
      notes: formData.notes,
      beatmap_priority,
    };
    setCollections(prev => {
      const newId = modalBeatmap.id || `${modalBeatmap.artist}-${modalBeatmap.title}`;
      return {
        ...prev,
        beatmaps: {
          ...prev.beatmaps,
          [newId]: newBeatmap,
        },
      };
    });
    handleModalClose();
  };

  return (
    <OsuverseDiv className="osuverse-main-search-box">
      <div className="search-input-wrapper">
        {/* Input wyszukiwania */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Szukaj beatmap, #tagów, artystów..."
        />
        {/* Wybrane tagi jako chipy */}
        <div className="selected-tags">
          {renderSelectedTags()}
        </div>
        {/* Podpowiedzi tagów */}
        <div className="tag-suggestions">
          {renderTagSuggestions()}
        </div>
      </div>
      {/* Wyniki lokalne */}
      {renderLocalResults()}
      {/* Wyniki z API osu! */}
      {renderOsuApiResults()}
      <OsuverseModal modalId={MODAL_ID}>
        {modalBeatmap && (
          <AddBeatmapForm
            beatmap={modalBeatmap}
            onSubmit={handleAddBeatmapSubmit}
            onCancel={handleModalClose}
            initialState={modals[MODAL_ID]?.state}
          />
        )}
      </OsuverseModal>
    </OsuverseDiv>
  );
};

export default OsuverseMainSearchBox;
