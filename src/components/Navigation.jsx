'use client';
import UserPanel from './UserPanel';
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import './navigation.scss';
import OsuverseMainSearchBox from './OsuverseMainSearchBox';

export default function Navigation() {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);
  // Dodajemy stan dla mobilnego menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [homepageConfig, setHomepageConfig] = useState({
    showCollections: true,
    showTags: true,
    showSearch: true,
    showRanked: false,
    showCustomSection: false,
  });
  const searchBoxRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

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

  return (
    <nav>
      <div className="navbar-container">
        <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <li>
            <Link href="/" className={pathname === '/' ? 'active' : ''} onClick={handleNavLinkClick}>Home</Link>
          </li>
          <li>
            <Link href="/search" className={pathname === '/search' ? 'active' : ''} onClick={handleNavLinkClick}>Search</Link>
          </li>
          {/* OsuverseMainSearchBox w navbarze, tuż za Search */}          <li className="search-container">
            <div ref={searchBoxRef} className={`search-dropdown ${showSearchBox ? 'visible' : 'hidden'}`}>
              <OsuverseMainSearchBox />
            </div>
          </li>
          <li>
            <Link href="/collections" className={pathname === '/collections' ? 'active' : ''} onClick={handleNavLinkClick}>Collections</Link>
          </li>
          <li>
            <Link href="/about" className={pathname === '/about' ? 'active' : ''} onClick={handleNavLinkClick}>About</Link>
          </li>
          <li style={{ marginLeft: 'auto' }}>
            {mounted && (
              user ? (
                <UserPanel
                  user={user}
                  onLogout={handleLogout}
                  onExport={handleExport}
                  onAvatarChange={handleAvatarChange}
                  homepageConfig={homepageConfig}
                  setHomepageConfig={setHomepageConfig}
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
        <div className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </div>
      </div>
    </nav>
  );
}