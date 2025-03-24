"use client";

import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { authAtom } from "../store/authAtom";

export default function SearchInput() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const token = useAtom(authAtom)[0];

    useEffect(() => {
        if (!query || !token) {
            setResults([]);
            setError(null);
            return;
        }

        const timeout = setTimeout(async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/search?query=${query}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || "Failed to fetch maps");
                }
                
                const data = await res.json();
                setResults(data.beatmaps);
            } catch (err) {
                console.error("Search error:", err.message);
                setError(err.message);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 1000); // 1s debounce

        return () => clearTimeout(timeout);
    }, [query, token]);

    return (
        <div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search beatmaps..."
                disabled={!token}
            />
            {!token && (
                <p className="text-red-500">Waiting for authentication...</p>
            )}
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            <ul>
                {results.map((map) => (
                    <li key={map.id}>{map.title}</li>
                ))}
            </ul>
        </div>
    );
}
