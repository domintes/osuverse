export const API_CONFIG = {
    OSU_API: {
        BASE_URL: 'https://osu.ppy.sh/api/v2',
        TOKEN_URL: 'https://osu.ppy.sh/oauth/token',
        CLIENT_ID: process.env.VITE_OSU_CLIENT_ID,
        CLIENT_SECRET: process.env.VITE_OSU_CLIENT_SECRET
    },
    CACHE: {
        TOKEN_EXPIRY: 86400 // 24 hours in seconds
    }
};

export const createApiEndpoint = (endpoint) => `${API_CONFIG.OSU_API.BASE_URL}/${endpoint}`;
