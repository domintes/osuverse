"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAtom } from 'jotai';
import { authAtom } from '@/store/authAtom';
import OsuverseDiv from '../src/components/OsuverseDiv';
import MainOsuverseDiv from "../src/components/MainOsuverseDiv";
import OsuverseLogo from '../src/components/OsuverseLogo/OsuverseLogo';
import BeatmapSearchResults from '@/components/BeatmapSearchResults/BeatmapSearchResults';
import OsuversePopup from '@/components/OsuversePopup/OsuversePopup';
import '@/components/BeatmapSearchResults/beatmapSearchResults.scss';
import '@/components/OsuversePopup/osuversePopup.scss';
import './search/search.scss';

export default function Home() {
  useAuth();
  const [query, setQuery] = useState('');
  const [artist, setArtist] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [rowCount, setRowCount] = useState(3);
  const token = useAtom(authAtom)[0];

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!token) return;

    setLoading(true);
    setError(null);    try {
      const queryParams = new URLSearchParams();
      if (query) queryParams.append('query', query);
      if (artist) queryParams.append('artist', artist);

      const res = await fetch(`/api/search?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });      if (!res.ok) throw new Error('Error during search');

      const data = await res.json();
      setResults(data.beatmaps || []);
      setCurrentPage(1);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to fetch results.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const totalResults = results.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = results.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainOsuverseDiv className="home-container">
      <div>
        <OsuverseLogo />
        
        <h1
          style={{
            fontSize: 40,
            fontFamily:
              "Orbitron, Bruno Ace, Rubik Glitch, Cracked Code, Arial",
            letterSpacing: 2,
            color: "#ea81fb",
            textShadow: "0 0 24px #2f0f3a, 0 0 8px #ea81fb",
            marginBottom: 20,
          }}
        >
          Osuverse
        </h1>
        
        <form onSubmit={handleSearch} className="beatmap-search-form">
          <div className="beatmap-search-form-inputs">
            <div className="beatmap-search-input-group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search beatmaps or artists..."
                className="beatmap-search-input"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="beatmap-search-button"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && (
          <div className="beatmap-search-error">
            {error}
          </div>
        )}        {results.length > 0 && (
          <div className="beatmap-search-results-info">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, results.length)} of {results.length} results
            <OsuversePopup buttonClassName="beatmap-search-help-button" />
          </div>
        )}

        <BeatmapSearchResults
          results={currentItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          rowCount={rowCount}
          onPageChange={handlePageChange}
          totalResults={results.length}
        />
      </div>
    </MainOsuverseDiv>
  );
}
