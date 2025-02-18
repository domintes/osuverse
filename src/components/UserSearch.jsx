import { useState } from 'react';
import axios from 'axios';
import './userSearch.scss';

export default function UserSearch() {
    const [userQuery, setUserQuery] = useState('');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchUser = async (username) => {
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
                `https://cors-anywhere.herokuapp.com/https://osu.ppy.sh/api/v2/users/${username}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            setUserData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching user:', error);
            setLoading(false);
        }
    };

    return (
        <div className="osuverse-search-container">
            <input
                type="text"
                placeholder="Search user..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="osuverse-search-input"
            />
            <button onClick={() => fetchUser(userQuery)}>SEARCH USER</button>

            {loading ? (
                <p>Loading...</p>
            ) : (
                userData && (
                    <div className="osuverse-user-data">
                        <h2>{userData.username}</h2>
                        <img src={userData.avatar_url} alt={`${userData.username}'s avatar`} />
                        <p>Country: {userData.country.name}</p>
                        <p>Rank: {userData.statistics.global_rank}</p>
                        <p>PP: {userData.statistics.pp}</p>
                    </div>
                )
            )}
        </div>
    );
}
