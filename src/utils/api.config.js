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

import axios from 'axios';

// Create and export the osuApi axios instance
export const osuApi = axios.create({
    baseURL: API_CONFIG.OSU_API.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor to include auth token
osuApi.interceptors.request.use(
    async (config) => {
        // Get token from localStorage or other auth mechanism
        const token = localStorage.getItem('osu_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
