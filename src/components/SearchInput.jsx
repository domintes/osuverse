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

    console.log(results);

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search beatmaps..."
                disabled={!token}
                className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
            />
            {!token && (
                <p className="text-red-500 mt-2">Waiting for authentication...</p>
            )}
            {loading && <p className="text-gray-500 mt-2">Loading...</p>}
            {error && <p className="text-red-500 mt-2">Error: {error}</p>}
            <div className="mt-4 space-y-4">
                {results.map((map) => (
                    <div key={map.id} className="grid grid-cols-[120px_1fr] gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="aspect-square">
                            <img 
                                src={`${map.covers.card}`}
                                alt={`${map.title} Beatmap Background`}
                                className="w-full h-full object-cover rounded-md"
                            />
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="text-lg font-semibold">
                                {map.artist} - {map.title}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <span className="flex items-center">
                                    {map.difficulty_rating}
                                    <svg className="w-4 h-4 ml-1 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                </span>
                                <span className="text-sm">
                                    mapped by <a href={`https://osu.ppy.sh/users/${map.user_id}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{map.creator}</a>
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
