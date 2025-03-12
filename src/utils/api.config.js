export const API_CONFIG = {
    OSU_API: {
        BASE_URL: 'https://osu.ppy.sh/api/v2',
        TOKEN_URL: 'https://osu.ppy.sh/oauth/token',
        AUTH_URL: 'https://osu.ppy.sh/oauth/authorize',
        CLIENT_ID: import.meta.env.VITE_OSU_CLIENT_ID,
        CLIENT_SECRET: import.meta.env.VITE_OSU_CLIENT_SECRET,
        REDIRECT_URI: import.meta.env.VITE_OSU_REDIRECT_URI,
        SCOPES: ['public', 'identify']
    },
    CACHE: {
        TOKEN_EXPIRY: 86400 // 24 hours in seconds
    }
};

export const createApiEndpoint = (endpoint) => `${API_CONFIG.OSU_API.BASE_URL}/${endpoint}`;
