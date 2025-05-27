'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import './navigation.scss';

export default function Navigation() {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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

  return (
    <nav>
      <ul>
        <li>
          <Link href="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
        </li>
        <li>
          <Link href="/search" className={pathname === '/search' ? 'active' : ''}>Search</Link>
        </li>
        <li>
          <Link href="/collections" className={pathname === '/collections' ? 'active' : ''}>Collections</Link>
        </li>
        <li>
          <Link href="/about" className={pathname === '/about' ? 'active' : ''}>About</Link>
        </li>
        <li style={{ marginLeft: 'auto' }}>
          {mounted && (
            user ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img src={user.avatar_url} alt={user.username} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                <span>{user.username}</span>
                <Link href="/api/auth/logout" style={{ marginLeft: 8 }} onClick={async (e) => {
                  e.preventDefault();
                  await fetch('/api/auth/logout');
                  setUser(null);
                  router.refresh(); // natychmiastowy refresh stanu po wylogowaniu
                }}>Logout</Link>
              </span>
            ) : (
              <button
                onClick={() => { window.location.href = "/api/auth/login"; }}
                className="login-btn"
                type="button"
              >
                Login with osu!
              </button>
            )
          )}
        </li>
      </ul>
    </nav>
  );
}