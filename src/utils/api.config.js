export const API_CONFIG = {
    OSU_API: {
        BASE_URL: 'https://cors-anywhere.herokuapp.com/https://osu.ppy.sh/api/v2',
        TOKEN_URL: 'https://cors-anywhere.herokuapp.com/https://osu.ppy.sh/oauth/token',
        AUTH_URL: 'https://cors-anywhere.herokuapp.com/https://osu.ppy.sh/oauth/authorize',
        CLIENT_ID: '38309',
        CLIENT_SECRET: '13hePdYOxB2WwJTvO9t9PuF6xlqxgYgVNb7gZ0f0',
        REDIRECT_URI: 'http://localhost:5173/oauth/callback',
        SCOPES: ['public', 'identify']
    },
    CACHE: {
        TOKEN_EXPIRY: 86400 // 24 hours in seconds
    }
};

export const createApiEndpoint = (endpoint) => `${API_CONFIG.OSU_API.BASE_URL}/${endpoint}`;

import axios from 'axios';

// Funkcja sprawdzająca czy używamy trybu testowego
const isTestMode = () => {
    return localStorage.getItem('test_mode') === 'true';
};

// Funkcja pobierająca token z localStorage lub zwracająca token testowy
const getToken = () => {
    // Jeśli tryb testowy, zwróć token testowy
    if (isTestMode()) {
        console.log('🔑 Używam testowego tokenu API');
        return 'fake_token';
    }
    
    // Próba pobrania tokenu z osuverseUser
    const storedUser = localStorage.getItem('osuverseUser');
    if (storedUser) {
        try {
            const userData = JSON.parse(storedUser);
            console.log('🔑 Pobrano token z danych użytkownika');
            return userData.access_token;
        } catch (e) {
            console.error('❌ Błąd podczas pobierania tokenu:', e);
        }
    }
    
    // Jeśli nic nie działa, sprawdź stary sposób
    return localStorage.getItem('osu_token');
};

// Create and export the osuApi axios instance
export const osuApi = axios.create({
    baseURL: API_CONFIG.OSU_API.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin,
        'X-Requested-With': 'XMLHttpRequest'
    }
});

// Add request interceptor to include auth token
osuApi.interceptors.request.use(
    async (config) => {
        // Get token using our function
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Dodaj nagłówki CORS zawsze
        config.headers['Origin'] = window.location.origin;
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        
        console.log(`🔄 Wysyłam żądanie API do: ${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ Błąd w interceptorze żądania:', error);
        return Promise.reject(error);
    }
);

// Dodaj interceptor odpowiedzi dla lepszej diagnostyki
osuApi.interceptors.response.use(
    (response) => {
        console.log(`✅ Otrzymano odpowiedź z API: ${response.status}`);
        return response;
    },
    (error) => {
        console.error('❌ Błąd odpowiedzi API:', error);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Dane:', error.response.data);
            console.error('Nagłówki:', error.response.headers);
        } else if (error.request) {
            console.error('Brak odpowiedzi:', error.request);
        } else {
            console.error('Błąd konfiguracji:', error.message);
        }
        return Promise.reject(error);
    }
);
