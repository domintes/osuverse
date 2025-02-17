import { useState, useEffect } from 'react';
import { css } from 'goober';
import axios from 'axios';

const containerStyle = css`
  width: 100%;
  padding: 16px;
`;

const inputStyle = css`
  padding: 8px;
  width: 100%;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-bottom: 16px;
`;

const resultListStyle = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const resultItemStyle = css`
  display: block;
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  text-decoration: none;
  overflow: hidden;
  color: white;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  & > div {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 8px;
    border-radius: 8px;
  }

  .title {
    font-size: 1.2rem;
    font-weight: bold;
  }

  .difficulty,
  .mapper {
    font-size: 0.9rem;
  }
`;

export default function BeatmapSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Opóźnienie w wywołaniu API (debouncing)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query) {
                fetchBeatmaps(query);
            }
        }, 1000); // 1 sekunda opóźnienia

        return () => clearTimeout(timer); // Czyszczenie timera przy zmianie zapytania
    }, [query]);

    const fetchBeatmaps = async (term) => {
        try {
            setLoading(true);
            const tokenResponse = await axios.post(
                'https://cors-anywhere.herokuapp.com/https://osu.ppy.sh/oauth/token',
                {
                    client_id: '38309',
                    client_secret: '13hePdYOxB2WwJTvO9t9PuF6xlqxgYgVNb7gZ0f0',
                    grant_type: 'client_credentials',
                    scope: 'public',
                }
            );

            const accessToken = tokenResponse.data.access_token;

            const response = await axios.get(
                `https://cors-anywhere.herokuapp.com/https://osu.ppy.sh/api/v2/beatmapsets/search?query=${term}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            setResults(response.data.beatmapsets || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching beatmaps:', error);
            setLoading(false);
        }
    };

    return (
        <div className={containerStyle}>
            <input
                type="text"
                placeholder="Search beatmaps..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={inputStyle}
            />

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className={resultListStyle}>
                    {results.map((beatmap) => (
                        <a
                            key={beatmap.id}
                            href={`https://osu.ppy.sh/beatmapsets/${beatmap.id}`}
                            className={resultItemStyle}
                            style={{
                                backgroundImage: `url(${beatmap.covers['cover@2x']})`,
                            }}
                        >
                            <div>
                                <p className="title">{beatmap.artist} - {beatmap.title}</p>
                                <p className="difficulty">{`Difficulty: ${beatmap.beatmaps.length > 0 ? beatmap.beatmaps[0].difficulty_rating : 'N/A'}`}</p>
                                <p className="mapper">
                                    Mapper: <a href={`https://osu.ppy.sh/users/${beatmap.user_id}`} className="underline text-blue-200">{beatmap.creator}</a>
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
