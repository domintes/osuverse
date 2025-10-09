'use client';

import { useState } from 'react';
import { useAtom } from 'jotai';
import Image from 'next/image';
import { collectionsAtom } from '@/store/collectionAtom';
import './downloader.scss';

export default function DownloaderPage() {
  const [collections] = useAtom(collectionsAtom);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0, currentBeatmap: '' });
  const [downloadLogs, setDownloadLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    setDownloadLogs(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(`/api/downloader/user-search?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      if (data.users) {
        setSearchResults(data.users);
      } else {
        addLog('No users found', 'error');
      }
    } catch (error) {
      console.error('Search error:', error);
      addLog(`Search error: ${error.message}`, 'error');
    } finally {
      setSearching(false);
    }
  };

  const downloadUserBeatmaps = async (userId, type = 'all') => {
    setDownloading(true);
    setDownloadProgress({ current: 0, total: 0, currentBeatmap: '' });
    addLog(`Starting download of ${type} beatmaps for user ${userId}...`, 'info');

    try {
      const res = await fetch(`/api/downloader/user-beatmaps?userId=${userId}&type=${type}`);
      const data = await res.json();
      
      if (!data.beatmaps || data.beatmaps.length === 0) {
        addLog('No beatmaps found for this user', 'warning');
        setDownloading(false);
        return;
      }

      const beatmaps = data.beatmaps;
      setDownloadProgress({ current: 0, total: beatmaps.length, currentBeatmap: '' });
      addLog(`Found ${beatmaps.length} beatmaps to download`, 'success');

      for (let i = 0; i < beatmaps.length; i++) {
        const beatmap = beatmaps[i];
        setDownloadProgress({ 
          current: i + 1, 
          total: beatmaps.length, 
          currentBeatmap: `${beatmap.artist} - ${beatmap.title}` 
        });
        
        try {
          const downloadRes = await fetch('/api/downloader/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ beatmapsetId: beatmap.id })
          });

          if (downloadRes.ok) {
            const blob = await downloadRes.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${beatmap.id} ${beatmap.artist} - ${beatmap.title}.osz`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            addLog(`✓ Downloaded: ${beatmap.artist} - ${beatmap.title}`, 'success');
            
            // Delay to avoid rate limiting (1-2 seconds between downloads)
            await new Promise(resolve => setTimeout(resolve, 1500));
          } else {
            const errorData = await downloadRes.json();
            addLog(`✗ Failed: ${beatmap.artist} - ${beatmap.title} (${errorData.error})`, 'error');
          }
        } catch (error) {
          addLog(`✗ Error downloading ${beatmap.artist} - ${beatmap.title}: ${error.message}`, 'error');
        }
      }

      addLog(`Download completed! ${beatmaps.length} beatmaps processed.`, 'success');
    } catch (error) {
      console.error('Download error:', error);
      addLog(`Download error: ${error.message}`, 'error');
    } finally {
      setDownloading(false);
      setDownloadProgress({ current: 0, total: 0, currentBeatmap: '' });
    }
  };

  const downloadCollectionBeatmaps = async () => {
    if (!collections || !collections.beatmaps) {
      addLog('No collection beatmaps found', 'warning');
      return;
    }

    const beatmaps = Object.values(collections.beatmaps);
    if (beatmaps.length === 0) {
      addLog('Your collection is empty', 'warning');
      return;
    }

    setDownloading(true);
    setDownloadProgress({ current: 0, total: beatmaps.length, currentBeatmap: '' });
    addLog(`Starting download of ${beatmaps.length} beatmaps from your collection...`, 'info');

    for (let i = 0; i < beatmaps.length; i++) {
      const beatmap = beatmaps[i];
      setDownloadProgress({ 
        current: i + 1, 
        total: beatmaps.length, 
        currentBeatmap: `${beatmap.artist} - ${beatmap.title}` 
      });
      
      try {
        const downloadRes = await fetch('/api/downloader/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ beatmapsetId: beatmap.beatmapset_id || beatmap.id })
        });

        if (downloadRes.ok) {
          const blob = await downloadRes.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${beatmap.beatmapset_id || beatmap.id} ${beatmap.artist} - ${beatmap.title}.osz`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          addLog(`✓ Downloaded: ${beatmap.artist} - ${beatmap.title}`, 'success');
          
          await new Promise(resolve => setTimeout(resolve, 1500));
        } else {
          const errorData = await downloadRes.json();
          addLog(`✗ Failed: ${beatmap.artist} - ${beatmap.title} (${errorData.error})`, 'error');
        }
      } catch (error) {
        addLog(`✗ Error downloading ${beatmap.artist} - ${beatmap.title}: ${error.message}`, 'error');
      }
    }

    addLog(`Download completed! ${beatmaps.length} beatmaps processed.`, 'success');
    setDownloading(false);
    setDownloadProgress({ current: 0, total: 0, currentBeatmap: '' });
  };

  const collectionBeatmapCount = collections?.beatmaps ? Object.keys(collections.beatmaps).length : 0;

  return (
    <div className="downloader-page">
      <div className="downloader-container">
        <h1 className="downloader-title">Beatmap Downloader</h1>
        
        {/* User Collection Download Section */}
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

        {/* User Search Section */}
        <section className="download-section user-section">
          <h2>Search osu! Users</h2>
          <div className="search-panel">
            <div className="search-input-group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
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

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(user => (
                  <div key={user.id} className="user-result-card">
                    <div className="user-info">
                      <Image 
                        src={user.avatar_url} 
                        alt={user.username}
                        width={80}
                        height={80}
                        className="user-avatar"
                        unoptimized
                      />
                      <div className="user-details">
                        <h3 className="user-username">{user.username}</h3>
                        <p className="user-country">
                          {user.country?.name || user.country_code}
                        </p>
                        <div className="user-stats">
                          <span>Ranked Beatmaps: <strong>{user.ranked_beatmapset_count || 0}</strong></span>
                          <span>Favourite Beatmaps: <strong>{user.favourite_beatmapset_count || 0}</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="download-actions">
                      <button
                        onClick={() => downloadUserBeatmaps(user.id, 'ranked')}
                        disabled={downloading || !user.ranked_beatmapset_count}
                        className="download-button"
                      >
                        Download Ranked ({user.ranked_beatmapset_count || 0})
                      </button>
                      <button
                        onClick={() => downloadUserBeatmaps(user.id, 'favourite')}
                        disabled={downloading || !user.favourite_beatmapset_count}
                        className="download-button favourite-button"
                      >
                        Download Favourites ({user.favourite_beatmapset_count || 0})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Download Progress */}
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
                  style={{ width: `${(downloadProgress.current / downloadProgress.total) * 100}%` }}
                />
              </div>
              {downloadProgress.currentBeatmap && (
                <p className="current-beatmap">Current: {downloadProgress.currentBeatmap}</p>
              )}
            </div>
          </section>
        )}

        {/* Download Logs */}
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
                <div key={index} className={`log-entry log-${log.type}`}>
                  <span className="log-timestamp">[{log.timestamp}]</span>
                  <span className="log-message">{log.message}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
