'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAtom } from 'jotai';
import Image from 'next/image';
import JSZip from 'jszip';
import BeatmapSearchResults from '@/components/BeatmapSearchResults/BeatmapSearchResults';
import { collectionsAtom } from '@/store/collectionAtom';
import { authAtom } from '@/store/authAtom';
import './downloader.scss';

const MIRROR_LABELS = {
  bancho: 'Bancho (Official)',
  catboy: 'Catboy.best'
};

export default function DownloaderPage() {
  const [collections] = useAtom(collectionsAtom);
  const [token] = useAtom(authAtom);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);

  const [selectedMirror, setSelectedMirror] = useState('bancho');
  const [beatmapCounts, setBeatmapCounts] = useState({});
  const [zipDownload, setZipDownload] = useState(true);

  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0, currentBeatmap: '' });
  const [downloadLogs, setDownloadLogs] = useState([]);

  const [beatmapSearchTerm, setBeatmapSearchTerm] = useState('');
  const [beatmapSearchMode, setBeatmapSearchMode] = useState('beatmaps');
  const [beatmapFilters, setBeatmapFilters] = useState({ status: 'all', mode: 'all' });
  const [beatmapResults, setBeatmapResults] = useState([]);
  const [beatmapLoading, setBeatmapLoading] = useState(false);
  const [beatmapError, setBeatmapError] = useState(null);
  const [beatmapCurrentPage, setBeatmapCurrentPage] = useState(1);
  const [beatmapItemsPerPage, setBeatmapItemsPerPage] = useState(20);
  const [beatmapRowCount, setBeatmapRowCount] = useState(3);

  const addLog = (message, type = 'info') => {
    setDownloadLogs(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const safeFetchCounts = async (url) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return { count: 0, beatmaps: [] };
      return res.json();
    } catch {
      return { count: 0, beatmaps: [] };
    }
  };

  const fetchBeatmapCountsForUser = async (userId) => {
    const endpoints = [
      `/api/downloader/user-beatmaps?userId=${userId}&type=ranked`,
      `/api/downloader/user-beatmaps?userId=${userId}&type=favourite`,
      `/api/downloader/user-beatmaps?userId=${userId}&type=graveyard`,
      `/api/downloader/user-beatmaps?userId=${userId}&type=loved`,
      `/api/downloader/catboy-beatmaps?userId=${userId}&type=ranked`,
      `/api/downloader/catboy-beatmaps?userId=${userId}&type=graveyard`,
      `/api/downloader/catboy-beatmaps?userId=${userId}&type=loved`
    ];

    const [
      banchoRanked,
      banchoFavourite,
      banchoGraveyard,
      banchoLoved,
      catboyRanked,
      catboyGraveyard,
      catboyLoved
    ] = await Promise.all(endpoints.map(safeFetchCounts));

    setBeatmapCounts(prev => ({
      ...prev,
      [userId]: {
        bancho: {
          ranked: banchoRanked.count || 0,
          favourite: banchoFavourite.count || 0,
          graveyard: banchoGraveyard.count || 0,
          loved: banchoLoved.count || 0
        },
        catboy: {
          ranked: catboyRanked.count || 0,
          favourite: 0,
          graveyard: catboyGraveyard.count || 0,
          loved: catboyLoved.count || 0
        }
      }
    }));
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    setSearching(true);
    setSearchResults([]);
    setBeatmapCounts({});
    try {
      const res = await fetch(`/api/downloader/user-search?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();

      if (data.users) {
        setSearchResults(data.users);
        setCurrentPage(1);

        for (const user of data.users) {
          fetchBeatmapCountsForUser(user.id);
        }
      } else {
        addLog('No users found', 'warning');
      }
    } catch (error) {
      console.error('Search error:', error);
      addLog(`Search error: ${error.message}`, 'error');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [resultsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchResults]);

  const currentResults = useMemo(() => {
    const start = (currentPage - 1) * resultsPerPage;
    return searchResults.slice(start, start + resultsPerPage);
  }, [searchResults, currentPage, resultsPerPage]);

  const totalPages = Math.ceil(searchResults.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + currentResults.length;

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const handleResultsPerPageChange = (value) => {
    setResultsPerPage(value);
  };

  const processBeatmapDownloads = async (beatmaps, selectMeta, contextLabel) => {
    const total = beatmaps.length;
    if (total === 0) {
      return { successCount: 0, total: 0 };
    }

    setDownloadProgress({ current: 0, total, currentBeatmap: '' });

    if (zipDownload) {
      const zip = new JSZip();
      let successCount = 0;

      for (let i = 0; i < beatmaps.length; i += 1) {
        const meta = selectMeta(beatmaps[i]);
        const filenameBase = `${meta.artist} - ${meta.title}`;

        setDownloadProgress({
          current: i + 1,
          total,
          currentBeatmap: filenameBase
        });

        try {
          const downloadRes = await fetch('/api/downloader/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              beatmapsetId: meta.id,
              mirror: selectedMirror
            })
          });

          if (downloadRes.ok) {
            const blob = await downloadRes.blob();
            zip.file(`${meta.id} ${filenameBase}.osz`, blob);
            addLog(`✓ Added to archive: ${filenameBase}`, 'success');
            successCount += 1;
          } else {
            const errorData = await downloadRes.json();
            addLog(`✗ Failed: ${filenameBase} (${errorData.error})`, 'error');
          }
        } catch (error) {
          addLog(`✗ Error downloading ${filenameBase}: ${error.message}`, 'error');
        }

        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      if (successCount > 0) {
        addLog(`Creating zip archive with ${successCount} beatmaps...`, 'info');
        const zipBlob = await zip.generateAsync({
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 }
        });

        const url = window.URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `osuverse_${contextLabel}_${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        addLog(`✓ Downloaded archive with ${successCount} beatmaps!`, 'success');
      }

      return { successCount, total };
    }

    let successCount = 0;

    for (let i = 0; i < beatmaps.length; i += 1) {
      const meta = selectMeta(beatmaps[i]);
      const filenameBase = `${meta.artist} - ${meta.title}`;

      setDownloadProgress({
        current: i + 1,
        total,
        currentBeatmap: filenameBase
      });

      try {
        const downloadRes = await fetch('/api/downloader/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            beatmapsetId: meta.id,
            mirror: selectedMirror
          })
        });

        if (downloadRes.ok) {
          const blob = await downloadRes.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${meta.id} ${filenameBase}.osz`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          addLog(`✓ Downloaded: ${filenameBase}`, 'success');
          successCount += 1;
        } else {
          const errorData = await downloadRes.json();
          addLog(`✗ Failed: ${filenameBase} (${errorData.error})`, 'error');
        }
      } catch (error) {
        addLog(`✗ Error downloading ${filenameBase}: ${error.message}`, 'error');
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    return { successCount, total };
  };

  const downloadUserBeatmaps = async (userId, type = 'ranked') => {
    if (downloading) {
      addLog('A download is already in progress. Please wait for it to finish.', 'warning');
      return;
    }

    setDownloading(true);
    setDownloadProgress({ current: 0, total: 0, currentBeatmap: '' });
    addLog(`Starting download of ${type} beatmaps for user ${userId} from ${MIRROR_LABELS[selectedMirror]}...`, 'info');

    try {
      const apiEndpoint = selectedMirror === 'catboy'
        ? `/api/downloader/catboy-beatmaps?userId=${userId}&type=${type}`
        : `/api/downloader/user-beatmaps?userId=${userId}&type=${type}`;

      const res = await fetch(apiEndpoint);
      const data = await res.json();

      if (!data.beatmaps || data.beatmaps.length === 0) {
        addLog('No beatmaps found for this request.', 'warning');
        return;
      }

      const { successCount, total } = await processBeatmapDownloads(
        data.beatmaps,
        (beatmap) => ({
          id: beatmap.beatmapset_id || beatmap.id,
          artist: beatmap.artist,
          title: beatmap.title
        }),
        `${type}_${userId}`
      );

      if (total > 0) {
        if (successCount === total) {
          addLog(`Download completed! ${successCount}/${total} beatmaps processed.`, 'success');
        } else if (successCount > 0) {
          addLog(`Download completed with some errors. ${successCount}/${total} beatmaps processed.`, 'warning');
        } else {
          addLog('No beatmaps were successfully downloaded.', 'warning');
        }
      }
    } catch (error) {
      console.error('Download error:', error);
      addLog(`Download error: ${error.message}`, 'error');
    } finally {
      setDownloading(false);
      setDownloadProgress({ current: 0, total: 0, currentBeatmap: '' });
    }
  };

  const downloadCollectionBeatmaps = async () => {
    const beatmaps = Object.values(collections?.beatmaps || {});
    if (beatmaps.length === 0) {
      addLog('Your collection is empty', 'warning');
      return;
    }
    if (downloading) {
      addLog('A download is already in progress. Please wait for it to finish.', 'warning');
      return;
    }

    setDownloading(true);
    setDownloadProgress({ current: 0, total: 0, currentBeatmap: '' });
    addLog(`Starting download of ${beatmaps.length} beatmaps from your collection...`, 'info');

    try {
      const { successCount, total } = await processBeatmapDownloads(
        beatmaps,
        (beatmap) => ({
          id: beatmap.beatmapset_id || beatmap.id,
          artist: beatmap.artist,
          title: beatmap.title
        }),
        'collection'
      );

      if (total > 0) {
        if (successCount === total) {
          addLog(`Collection download completed! ${successCount}/${total} beatmaps processed.`, 'success');
        } else if (successCount > 0) {
          addLog(`Collection download completed with some errors. ${successCount}/${total} beatmaps processed.`, 'warning');
        } else {
          addLog('No beatmaps were successfully downloaded from your collection.', 'warning');
        }
      }
    } catch (error) {
      console.error('Collection download error:', error);
      addLog(`Collection download error: ${error.message}`, 'error');
    } finally {
      setDownloading(false);
      setDownloadProgress({ current: 0, total: 0, currentBeatmap: '' });
    }
  };

  const visibleBeatmapsets = useMemo(() => {
    const start = (beatmapCurrentPage - 1) * beatmapItemsPerPage;
    return beatmapResults.slice(start, start + beatmapItemsPerPage);
  }, [beatmapResults, beatmapCurrentPage, beatmapItemsPerPage]);

  const beatmapTotalResults = beatmapResults.length;
  const beatmapRangeStart = beatmapTotalResults === 0 ? 0 : (beatmapCurrentPage - 1) * beatmapItemsPerPage + 1;
  const beatmapRangeEnd = beatmapTotalResults === 0
    ? 0
    : Math.min(beatmapRangeStart + beatmapItemsPerPage - 1, beatmapTotalResults, (beatmapCurrentPage - 1) * beatmapItemsPerPage + visibleBeatmapsets.length);

  const downloadVisibleBeatmaps = async () => {
    if (downloading) {
      addLog('A download is already in progress. Please wait for it to finish.', 'warning');
      return;
    }

    if (visibleBeatmapsets.length === 0) {
      addLog('No beatmaps visible on this page to download.', 'warning');
      return;
    }

    setDownloading(true);
    setDownloadProgress({ current: 0, total: visibleBeatmapsets.length, currentBeatmap: '' });
    addLog(`Starting download of ${visibleBeatmapsets.length} visible beatmaps (page ${beatmapCurrentPage})...`, 'info');

    try {
      const { successCount, total } = await processBeatmapDownloads(
        visibleBeatmapsets,
        (beatmapset) => ({
          id: beatmapset.id,
          artist: beatmapset.artist,
          title: beatmapset.title
        }),
        `search_results_page_${beatmapCurrentPage}`
      );

      if (total > 0) {
        if (successCount === total) {
          addLog(`Visible beatmaps download finished! ${successCount}/${total} beatmaps processed.`, 'success');
        } else if (successCount > 0) {
          addLog(`Visible beatmaps download finished with some errors. ${successCount}/${total} beatmaps processed.`, 'warning');
        } else {
          addLog('No beatmaps were successfully downloaded from the visible results.', 'warning');
        }
      }
    } catch (error) {
      console.error('Visible beatmaps download error:', error);
      addLog(`Visible beatmaps download error: ${error.message}`, 'error');
    } finally {
      setDownloading(false);
      setDownloadProgress({ current: 0, total: 0, currentBeatmap: '' });
    }
  };

  const handleBeatmapSearch = async (event) => {
    event?.preventDefault();

    setBeatmapLoading(true);
    setBeatmapError(null);

    try {
      const params = new URLSearchParams();
      const trimmedTerm = beatmapSearchTerm.trim();

      if (trimmedTerm) {
        if (beatmapSearchMode === 'artists') {
          params.append('artist', trimmedTerm);
        } else if (beatmapSearchMode === 'mappers') {
          params.append('mapper', trimmedTerm);
        } else {
          params.append('query', trimmedTerm);
        }
      }

      if (beatmapFilters.status && beatmapFilters.status !== 'all') {
        params.append('status', beatmapFilters.status);
      }
      if (beatmapFilters.mode && beatmapFilters.mode !== 'all') {
        params.append('mode', beatmapFilters.mode);
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const endpoint = params.toString() ? `/api/search?${params.toString()}` : '/api/search';
      const response = await fetch(endpoint, { headers });

      if (!response.ok) {
        if (response.status === 429) {
          addLog('Search rate limit reached. Please wait a moment and try again.', 'warning');
        }
        throw new Error(`Search failed with status ${response.status}`);
      }

      const data = await response.json();
      setBeatmapResults(data.beatmaps || []);
      setBeatmapCurrentPage(1);
    } catch (error) {
      console.error('Beatmap search error:', error);
      setBeatmapResults([]);
      setBeatmapError('Failed to fetch beatmaps. Please try again later.');
    } finally {
      setBeatmapLoading(false);
    }
  };

  const handleBeatmapPageChange = (pageNumber) => {
    setBeatmapCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBeatmapItemsPerPageChange = (value) => {
    setBeatmapItemsPerPage(value);
    setBeatmapCurrentPage(1);
  };

  const searchPlaceholder = beatmapSearchMode === 'artists'
    ? 'Search artists'
    : beatmapSearchMode === 'mappers'
      ? 'Search mappers'
      : 'Search beatmaps';

  const collectionBeatmapCount = collections?.beatmaps ? Object.keys(collections.beatmaps).length : 0;
  const otherMirrorLabel = selectedMirror === 'bancho' ? MIRROR_LABELS.catboy : MIRROR_LABELS.bancho;

  return (
    <div className="downloader-page">
      <div className="downloader-container">
        <h1 className="downloader-title">Beatmap Downloader</h1>

        <section className="download-section user-section">
          <h2>Search osu! Users</h2>

          <div className="download-options-container">
            <div className="zip-checkbox-container">
              <label className="zip-checkbox-label">
                <input
                  type="checkbox"
                  checked={zipDownload}
                  onChange={(e) => setZipDownload(e.target.checked)}
                  disabled={downloading}
                  className="zip-checkbox"
                />
                <span>Download beatmaps as archive (.zip)</span>
              </label>
            </div>

            <div className="mirror-selection">
              <label className="mirror-label">Mirror:</label>
              <div className="mirror-options">
                {(['bancho', 'catboy']).map(mirror => (
                  <label key={mirror} className="mirror-option">
                    <input
                      type="radio"
                      name="mirror"
                      value={mirror}
                      checked={selectedMirror === mirror}
                      onChange={(e) => setSelectedMirror(e.target.value)}
                      disabled={downloading}
                    />
                    <span>{MIRROR_LABELS[mirror]}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="search-panel">
            <div className="search-input-group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                placeholder="Enter username or user ID..."
                className="user-search-input"
                disabled={downloading}
              />
              <button
                onClick={searchUsers}
                disabled={searching || downloading}
                className="search-button"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <>
                <div className="results-controls">
                  <div className="results-info">
                    <span>
                      Showing {startIndex + 1}-{endIndex} of {searchResults.length} users
                    </span>
                  </div>
                  <div className="results-per-page">
                    <label htmlFor="results-select">Results per page:</label>
                    <select
                      id="results-select"
                      value={resultsPerPage}
                      onChange={(e) => handleResultsPerPageChange(parseInt(e.target.value, 10))}
                      className="results-select"
                    >
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                <div className="search-results">
                  {currentResults.map(user => {
                    const counts = beatmapCounts[user.id];
                    const currentMirrorCounts = counts?.[selectedMirror];
                    const otherMirrorCounts = counts?.[selectedMirror === 'bancho' ? 'catboy' : 'bancho'] || {};
                    const displayRanked = currentMirrorCounts?.ranked ?? user.ranked_beatmapset_count ?? 0;
                    const displayLoved = currentMirrorCounts?.loved ?? user.loved_beatmapset_count ?? 0;
                    const displayFavourite = currentMirrorCounts?.favourite ?? user.favourite_beatmapset_count ?? 0;
                    const displayGraveyard = currentMirrorCounts?.graveyard ?? user.graveyard_beatmapset_count ?? 0;

                    const unavailableRanked = Math.max(0, (otherMirrorCounts.ranked || 0) - displayRanked);
                    const unavailableGraveyard = Math.max(0, (otherMirrorCounts.graveyard || 0) - displayGraveyard);
                    const unavailableLoved = Math.max(0, (otherMirrorCounts.loved || 0) - displayLoved);
                    const totalUnavailable = unavailableRanked + unavailableGraveyard + unavailableLoved;

                    return (
                      <div key={user.id} className="user-result-card">
                        <div className="user-info">
                          <a
                            href={`https://osu.ppy.sh/users/${user.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="user-avatar-link"
                          >
                            <Image
                              src={user.avatar_url}
                              alt={user.username}
                              width={80}
                              height={80}
                              className="user-avatar"
                              unoptimized
                            />
                          </a>
                          <div className="user-details">
                            <a
                              href={`https://osu.ppy.sh/users/${user.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="user-username-link"
                            >
                              <h3 className="user-username">{user.username}</h3>
                            </a>
                            <p className="user-country">
                              {user.country?.name || user.country_code}
                            </p>
                            <div className="user-stats">
                              <span>Ranked Beatmaps: <strong>{displayRanked}</strong></span>
                              <span>Loved Beatmaps: <strong>{displayLoved}</strong></span>
                              <span>Favourite Beatmaps: <strong>{displayFavourite}</strong></span>
                              <span>Graveyard Beatmaps: <strong>{displayGraveyard}</strong></span>
                              {totalUnavailable > 0 && (
                                <span className="unavailable-count">
                                  Unavailable on {otherMirrorLabel}: <strong>{totalUnavailable}</strong>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="download-actions">
                          <button
                            onClick={() => downloadUserBeatmaps(user.id, 'ranked')}
                            disabled={downloading || displayRanked === 0}
                            className="download-button ranked-button"
                          >
                            Download Ranked ({displayRanked})
                          </button>
                          <button
                            onClick={() => downloadUserBeatmaps(user.id, 'loved')}
                            disabled={downloading || displayLoved === 0}
                            className="download-button loved-button"
                          >
                            Download Loved ({displayLoved})
                          </button>
                          <button
                            onClick={() => downloadUserBeatmaps(user.id, 'favourite')}
                            disabled={downloading || selectedMirror === 'catboy' || displayFavourite === 0}
                            className="download-button favourite-button"
                          >
                            Download Favourites ({displayFavourite})
                          </button>
                          <button
                            onClick={() => downloadUserBeatmaps(user.id, 'graveyard')}
                            disabled={downloading || displayGraveyard === 0}
                            className="download-button graveyard-button"
                          >
                            Download Graveyard ({displayGraveyard})
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="pagination">
                    {totalPages > 5 && currentPage > 3 && (
                      <button
                        onClick={() => handlePageChange(1)}
                        className="pagination-button first"
                      >
                        ← First
                      </button>
                    )}

                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-button prev"
                    >
                      ← Previous
                    </button>

                    <div className="pagination-numbers">
                      {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNumber => {
                        const showPage = pageNumber === 1
                          || pageNumber === totalPages
                          || Math.abs(pageNumber - currentPage) <= 2;

                        if (!showPage) {
                          if (pageNumber === 2 && currentPage > 4) {
                            return <span key={pageNumber} className="pagination-ellipsis">...</span>;
                          }
                          if (pageNumber === totalPages - 1 && currentPage < totalPages - 3) {
                            return <span key={pageNumber} className="pagination-ellipsis">...</span>;
                          }
                          return null;
                        }

                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`pagination-button ${currentPage === pageNumber ? 'active' : ''}`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="pagination-button next"
                    >
                      Next →
                    </button>

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className="pagination-button last"
                      >
                        Last →
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {downloading && (
          <section className="download-section progress-section">
            <h2>Download Progress</h2>
            <div className="progress-info">
              <p>
                Downloading {downloadProgress.current} of {downloadProgress.total}
              </p>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: downloadProgress.total === 0 ? '0%' : `${(downloadProgress.current / downloadProgress.total) * 100}%` }}
                />
              </div>
              {downloadProgress.currentBeatmap && (
                <p className="current-beatmap">Current: {downloadProgress.currentBeatmap}</p>
              )}
            </div>
          </section>
        )}

        {downloadLogs.length > 0 && (
          <section className="download-section logs-section">
            <div className="logs-header">
              <h2>Download Logs</h2>
              <button onClick={() => setDownloadLogs([])} className="clear-logs-button">
                Clear Logs
              </button>
            </div>
            <div className="logs-container">
              {downloadLogs.map((log, index) => (
                <div key={`${log.timestamp}-${index}`} className={`log-entry log-${log.type}`}>
                  <span className="log-timestamp">[{log.timestamp}]</span>
                  <span className="log-message">{log.message}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="download-section beatmap-search-section">
          <div className="beatmap-search-heading">
            <h2>Search Beatmaps</h2>
            <div className="beatmap-search-heading-actions">
              <label className="beatmap-results-select-label">
                <span>Beatmaps per page</span>
                <select
                  value={beatmapItemsPerPage}
                  onChange={(e) => handleBeatmapItemsPerPageChange(Number(e.target.value))}
                  disabled={beatmapLoading || downloading}
                  className="beatmap-results-select"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </label>

              <button
                type="button"
                className="download-button visible-download-button"
                onClick={downloadVisibleBeatmaps}
                disabled={downloading || beatmapLoading || visibleBeatmapsets.length === 0}
              >
                {downloading ? 'Downloading...' : `Download all visible beatmaps (${visibleBeatmapsets.length})`}
              </button>
            </div>
          </div>

          <form onSubmit={handleBeatmapSearch} className="beatmap-search-form">
            <div className="beatmap-search-form-inputs">
              <div className="beatmap-search-input-row">
                <div className="beatmap-search-input-group">
                  <input
                    type="text"
                    value={beatmapSearchTerm}
                    onChange={(e) => setBeatmapSearchTerm(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="beatmap-search-input"
                    disabled={beatmapLoading || downloading}
                  />
                </div>
                <fieldset
                  className="beatmap-search-mode-group"
                  disabled={beatmapLoading || downloading}
                >
                  <legend>Search:</legend>
                  <label className="beatmap-search-mode-option">
                    <input
                      type="radio"
                      name="beatmap-search-mode"
                      value="beatmaps"
                      checked={beatmapSearchMode === 'beatmaps'}
                      onChange={() => setBeatmapSearchMode('beatmaps')}
                    />
                    <span>Beatmaps</span>
                  </label>
                  <label className="beatmap-search-mode-option">
                    <input
                      type="radio"
                      name="beatmap-search-mode"
                      value="mappers"
                      checked={beatmapSearchMode === 'mappers'}
                      onChange={() => setBeatmapSearchMode('mappers')}
                    />
                    <span>Mappers</span>
                  </label>
                  <label className="beatmap-search-mode-option">
                    <input
                      type="radio"
                      name="beatmap-search-mode"
                      value="artists"
                      checked={beatmapSearchMode === 'artists'}
                      onChange={() => setBeatmapSearchMode('artists')}
                    />
                    <span>Artists</span>
                  </label>
                </fieldset>
              </div>

              <div className="beatmap-search-selects">
                <div className="beatmap-search-select-group">
                  <label className="beatmap-search-select-label">Status</label>
                  <select
                    value={beatmapFilters.status}
                    onChange={(e) => setBeatmapFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="beatmap-search-select"
                    disabled={beatmapLoading || downloading}
                  >
                    <option value="all">All Status</option>
                    <option value="ranked">Ranked</option>
                    <option value="loved">Loved</option>
                    <option value="pending">Pending</option>
                    <option value="graveyard">Graveyard</option>
                  </select>
                </div>

                <div className="beatmap-search-select-group">
                  <label className="beatmap-search-select-label">Game Mode</label>
                  <select
                    value={beatmapFilters.mode}
                    onChange={(e) => setBeatmapFilters(prev => ({ ...prev, mode: e.target.value }))}
                    className="beatmap-search-select"
                    disabled={beatmapLoading || downloading}
                  >
                    <option value="all">All Modes</option>
                    <option value="0">osu!</option>
                    <option value="1">osu!taiko</option>
                    <option value="2">osu!catch</option>
                    <option value="3">osu!mania</option>
                  </select>
                </div>

                <div className="beatmap-search-select-group">
                  <label className="beatmap-search-select-label">Layout</label>
                  <select
                    value={beatmapRowCount}
                    onChange={(e) => setBeatmapRowCount(Number(e.target.value))}
                    className="beatmap-search-select"
                    disabled={beatmapLoading || downloading}
                  >
                    <option value={1}>1 column</option>
                    <option value={2}>2 columns</option>
                    <option value={3}>3 columns</option>
                    <option value={4}>4 columns</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="beatmap-search-button"
              disabled={beatmapLoading || downloading || !token}
            >
              {beatmapLoading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {beatmapError && (
            <div className="beatmap-search-error">
              {beatmapError}
            </div>
          )}

          {beatmapTotalResults > 0 && (
            <div className="beatmap-search-results-info">
              Showing {beatmapRangeStart}-{beatmapRangeEnd} of {beatmapTotalResults} results
            </div>
          )}

          <BeatmapSearchResults
            results={visibleBeatmapsets}
            currentPage={beatmapCurrentPage}
            itemsPerPage={beatmapItemsPerPage}
            rowCount={beatmapRowCount}
            onPageChange={handleBeatmapPageChange}
            totalResults={beatmapTotalResults}
          />

          {visibleBeatmapsets.length > 0 && (
            <div className="visible-download-footer">
              <button
                type="button"
                className="download-button visible-download-button"
                onClick={downloadVisibleBeatmaps}
                disabled={downloading || beatmapLoading}
              >
                {downloading ? 'Downloading...' : `Download all visible beatmaps (${visibleBeatmapsets.length})`}
              </button>
            </div>
          )}
        </section>

        <section className="download-section collection-section">
          <h2>Download from Your Osuverse Collection</h2>
          <div className="collection-download-panel">
            <p className="collection-info">
              You have <strong>{collectionBeatmapCount}</strong> beatmap{collectionBeatmapCount !== 1 ? 's' : ''} in your collection
            </p>
            <button
              onClick={downloadCollectionBeatmaps}
              disabled={downloading || collectionBeatmapCount === 0}
              className="download-button collection-button"
            >
              {downloading ? 'Downloading...' : `Download All Collection Beatmaps (${collectionBeatmapCount})`}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
