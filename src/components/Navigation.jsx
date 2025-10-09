'use client';
import UserPanel from './UserPanel';
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import './navigation.scss';
import OsuverseMainSearchBox from './OsuverseMainSearchBox';
import OsuverseLogo from './OsuverseLogo/OsuverseLogo';
import { useAtom } from 'jotai';
import { collectionsAtom } from '../store/collectionAtom';
import { useApp } from '../context/AppContext';

export default function Navigation() {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);
  // Dodajemy stan dla mobilnego menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [userCollectionResults, setUserCollectionResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const searchBoxRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const [collections] = useAtom(collectionsAtom);
  const { simpleMode, toggleSimpleMode } = useApp();

  // Funkcja do zamykania mobilnego menu po kliknięciu w link
  const handleNavLinkClick = () => {
    setMobileMenuOpen(false);
  };
  
  useEffect(() => {
    setMounted(true);
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/check");
        const data = await res.json();
        if (data.loggedIn) setUser(data.user);
        else setUser(null);
      } catch {
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.altKey || e.ctrlKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        setShowSearchBox(true);
        setTimeout(() => {
          if (searchBoxRef.current) {
            const input = searchBoxRef.current.querySelector('input[type="text"]');
            if (input) input.focus();
          }
        }, 50);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Zamknij search box po kliknięciu poza nim lub po Escape
  useEffect(() => {
    if (!showSearchBox) return;
    const handleClick = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSearchBox(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowSearchBox(false);
    };
    document.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [showSearchBox]);

  // Obsługa eksportu danych (placeholder)
  const handleExport = () => {
    // TODO: implementacja eksportu danych użytkownika
    alert('Export coming soon!');
  };

  // Obsługa zmiany avatara (placeholder)
  const handleAvatarChange = () => {
    // TODO: implementacja zmiany avatara
    alert('Avatar change coming soon!');
  };

  // Obsługa wylogowania (usuń OAuth i dane)
  const handleLogout = async () => {
    await fetch('/api/auth/logout');
    setUser(null);
    router.refresh();
  };

  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const handleSearchInputChangeImmediate = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };
  const debouncedSearch = debounce(async (query) => {
    if (query.trim()) {
      // Szukaj w kolekcjach użytkownika
      if (collections && collections.beatmaps) {
        const userBeatmaps = Object.values(collections.beatmaps).filter(beatmap => 
          beatmap.title?.toLowerCase().includes(query.toLowerCase()) || 
          beatmap.artist?.toLowerCase().includes(query.toLowerCase()) ||
          (beatmap.userTags && beatmap.userTags.some(tag => 
            typeof tag === 'string' 
              ? tag.toLowerCase().includes(query.toLowerCase())
              : tag.tag && tag.tag.toLowerCase().includes(query.toLowerCase())
          ))
        );
        setUserCollectionResults(userBeatmaps);
      }

      // Szukaj w API osu! po kolekcjach (backend sam doda Authorization)
      try {
        const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSearchResults(data.beatmaps || []);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
      setUserCollectionResults([]);
    }
  }, 500);

  // Rozbudowane renderowanie wyników wyszukiwania w navbarze
  const renderSearchResults = () => {
    if (!showSearchBox || (!searchResults.length && !userCollectionResults.length && !searchQuery)) return null;
    return (
      <div className="search-results-dropdown">
        {/* Najpierw: Beatmapy powiązane z kolekcjami użytkownika */}
        <div className="search-results-section">
          <div className="search-results-header">Powiązane z Twoimi kolekcjami</div>
          {userCollectionResults.length > 0 ? (
            userCollectionResults.slice(0, 5).map((bm) => (
              <div 
                key={bm.id} 
                className="search-result-item" 
                onClick={() => {
                  // Zapisz ID beatmapy w localStorage
                  localStorage.setItem('scrollToBeatmapId', bm.id);
                  // Przekieruj do strony kolekcji
                  router.push('/collections');
                  setShowSearchBox(false);
                }}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={bm.cover || '/favicon.ico'}
                  alt="cover"
                  className="search-result-cover"
                  style={{ width: 36, height: 36, borderRadius: 6, marginRight: 10, objectFit: 'cover', background: '#23262f' }}
                  onError={e => { e.target.src = '/favicon.ico'; }}
                />
                <span style={{ fontWeight: 600 }}>{bm.artist} - {bm.title}</span>
                {bm.version && (
                  <span style={{ color: 'var(--text-secondary, #b8a6c1)', marginLeft: 8, fontSize: '0.95em' }}>[{bm.version}]</span>
                )}
                {bm.userTags && bm.userTags.length > 0 && (
                  <span style={{ marginLeft: 8, fontSize: '0.9em', color: '#64c8ff' }}>
                    {bm.userTags.map(t => typeof t === 'string' ? `#${t}` : `#${t.tag}`).join(' ')}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="search-result-empty">Brak powiązanych beatmap w Twoich kolekcjach</div>
          )}
        </div>
        {/* Następnie: Wyniki z osu! API */}
        <div className="search-results-section">
          <div className="search-results-header">Wyniki z osu! API</div>
          {searchResults.length > 0 ? (
            searchResults.slice(0, 5).map((result) => (
              <a
                key={result.id}
                className="search-result-item"
                href={`https://osu.ppy.sh/beatmapsets/${result.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={result.covers?.card || result.covers?.cover || result.covers?.list || result.covers?.slimcover || '/favicon.ico'}
                  alt="cover"
                  className="search-result-cover"
                  style={{ width: 36, height: 36, borderRadius: 6, marginRight: 10, objectFit: 'cover', background: '#23262f' }}
                  onError={e => { e.target.src = '/favicon.ico'; }}
                />
                <span style={{ fontWeight: 600 }}>{result.artist} - {result.title}</span>
                {result.creator && (
                  <span style={{ color: 'var(--text-secondary, #b8a6c1)', marginLeft: 8, fontSize: '0.95em' }}>by {result.creator}</span>
                )}
              </a>
            ))
          ) : (
            <div className="search-result-empty">Brak wyników z osu! API</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <nav>
      <div className="navbar-container">
        <ul id="primary-navigation" className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <li className="logo-container">
            <Link href="/" className={pathname === '/' ? 'active logo-link' : 'logo-link'} onClick={handleNavLinkClick}>
              <OsuverseLogo />
            </Link>
          </li>
          <li>
            <Link href="/collections" className={pathname === '/collections' ? 'active' : ''} onClick={handleNavLinkClick}>Collections</Link>
          </li>
          <li>
            <Link href="/coolections" className={pathname === '/coolections' ? 'active' : ''} onClick={handleNavLinkClick}>Coolections</Link>
          </li>
          <li>
            <Link href="/about" className={pathname === '/about' ? 'active' : ''} onClick={handleNavLinkClick}>About</Link>
          </li>
          <li>
            <Link href="/search" className={pathname === '/search' ? 'active' : ''} onClick={handleNavLinkClick}>Search</Link>
          </li>
          <li>
            <Link href="/downloader" className={pathname === '/downloader' ? 'active' : ''} onClick={handleNavLinkClick}>Downloader</Link>
          </li>
          {/* Formularz wyszukiwania w navbarze */}
          <li className="search-container">
            <div ref={searchBoxRef} className={`search-dropdown ${showSearchBox ? 'visible' : 'hidden'}`}>
              {renderSearchResults()}
            </div>
            <form className="navbar-search-form">
              <input
                type="text"
                name="osuverse-search-input"
                placeholder="Search beatmaps..."
                className="navbar-search-input"
                onClick={() => setShowSearchBox(true)}
                onChange={handleSearchInputChangeImmediate}
                value={searchQuery}
              />
            </form>
          </li>
          <li className="simple-mode-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={simpleMode}
                onChange={toggleSimpleMode}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">Focus Mode</span>
            </label>
          </li>
          <li className="user-panel-container">
            {mounted && (
              user ? (
                <UserPanel
                  user={user}
                  onLogout={handleLogout}
                  onExport={handleExport}
                  onAvatarChange={handleAvatarChange}
                />
              ) : (                <button
                  onClick={() => { window.location.href = "/api/auth/login"; }}
                  className="login-btn grid-pattern"
                  type="button"
                >
                  Login with osu!
                </button>
              )
            )}
          </li>
        </ul>
        {/* Przycisk menu hamburgera dla mniejszych ekranów */}
        <button
          className="hamburger"
          aria-label="Toggle navigation menu"
          aria-controls="primary-navigation"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          type="button"
        >
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </button>
      </div>
    </nav>
  );
}