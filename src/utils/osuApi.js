import axios from 'axios';
import { API_CONFIG, createApiEndpoint } from './api.config';

class OsuApiService {
    constructor() {
        this.axiosInstance = axios.create({
            baseURL: API_CONFIG.OSU_API.BASE_URL
        });

        // Interceptor do automatycznego dodawania tokenu
        this.axiosInstance.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('osu_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Interceptor do automatycznego odświeżania tokenu
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const refreshToken = localStorage.getItem('osu_refresh_token');
                        if (!refreshToken) {
                            throw new Error('No refresh token available');
                        }

                        const tokens = await this.refreshToken(refreshToken);
                        localStorage.setItem('osu_token', tokens.access_token);
                        localStorage.setItem('osu_refresh_token', tokens.refresh_token);

                        originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;
                        return this.axiosInstance(originalRequest);
                    } catch (refreshError) {
                        localStorage.removeItem('osu_token');
                        localStorage.removeItem('osu_refresh_token');
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    async getTokenFromCode(code) {
        try {
            const response = await axios.post(
                API_CONFIG.OSU_API.TOKEN_URL,
                {
                    client_id: API_CONFIG.OSU_API.CLIENT_ID,
                    client_secret: API_CONFIG.OSU_API.CLIENT_SECRET,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: import.meta.env.VITE_OSU_REDIRECT_URI
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error getting token from code:', error);
            throw error;
        }
    }

    async refreshToken(refreshToken) {
        try {
            const response = await axios.post(
                API_CONFIG.OSU_API.TOKEN_URL,
                {
                    client_id: API_CONFIG.OSU_API.CLIENT_ID,
                    client_secret: API_CONFIG.OSU_API.CLIENT_SECRET,
                    refresh_token: refreshToken,
                    grant_type: 'refresh_token'
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error refreshing token:', error);
            throw error;
        }
    }

    async getCurrentUser() {
        try {
            const response = await this.axiosInstance.get('/me');
            return response.data;
        } catch (error) {
            console.error('Error getting current user:', error);
            throw error;
        }
    }

    async searchBeatmaps(query, page = 1, limit = 8) {
        try {
            const response = await this.axiosInstance.get(
                '/beatmapsets/search',
                {
                    params: {
                        query,
                        limit,
                        offset: (page - 1) * limit
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error searching beatmaps:', error);
            throw error;
        }
    }

    async getBeatmapDetails(beatmapId) {
        try {
            const response = await this.axiosInstance.get(`/beatmapsets/${beatmapId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting beatmap details:', error);
            throw error;
        }
    }
}

export const osuApi = new OsuApiService();
