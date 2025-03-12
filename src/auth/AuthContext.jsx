import { createContext, useContext, useState, useEffect } from 'react';
import { osuApi } from '../utils/osuApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Sprawdź czy mamy zapisany token w localStorage
        const checkAuth = async () => {
            const token = localStorage.getItem('osu_token');
            if (token) {
                try {
                    const userData = await osuApi.getCurrentUser();
                    setUser(userData);
                } catch (error) {
                    console.error('Error checking auth:', error);
                    localStorage.removeItem('osu_token');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = () => {
        const clientId = import.meta.env.VITE_OSU_CLIENT_ID;
        const redirectUri = import.meta.env.VITE_OSU_REDIRECT_URI;
        const scope = 'public identify';

        const authUrl = new URL('https://osu.ppy.sh/oauth/authorize');
        authUrl.searchParams.append('client_id', clientId);
        authUrl.searchParams.append('redirect_uri', redirectUri);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('scope', scope);

        window.location.href = authUrl.toString();
    };

    const logout = () => {
        localStorage.removeItem('osu_token');
        localStorage.removeItem('osu_refresh_token');
        setUser(null);
    };

    const handleCallback = async (code) => {
        try {
            const tokens = await osuApi.getTokenFromCode(code);
            localStorage.setItem('osu_token', tokens.access_token);
            localStorage.setItem('osu_refresh_token', tokens.refresh_token);

            const userData = await osuApi.getCurrentUser();
            setUser(userData);
            return true;
        } catch (error) {
            console.error('Error handling OAuth callback:', error);
            return false;
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        handleCallback
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
