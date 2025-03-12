import axios from 'axios';
import { API_CONFIG, createApiEndpoint } from './api.config';

class OsuApiService {
    constructor() {
        this.token = null;
        this.tokenExpiry = null;
    }

    async getToken() {
        // Return existing token if it's still valid
        if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.token;
        }

        try {
            const response = await axios.post(
                API_CONFIG.OSU_API.TOKEN_URL,
                {
                    client_id: API_CONFIG.OSU_API.CLIENT_ID,
                    client_secret: API_CONFIG.OSU_API.CLIENT_SECRET,
                    grant_type: 'client_credentials',
                    scope: 'public'
                }
            );

            this.token = response.data.access_token;
            this.tokenExpiry = Date.now() + (API_CONFIG.CACHE.TOKEN_EXPIRY * 1000);
            return this.token;
        } catch (error) {
            console.error('Error getting token:', error);
            throw new Error('Failed to get access token');
        }
    }

    async searchBeatmaps(query, page = 1, limit = 8) {
        try {
            const token = await this.getToken();
            const response = await axios.get(
                createApiEndpoint(`beatmapsets/search`),
                {
                    params: {
                        query,
                        limit,
                        offset: (page - 1) * limit
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
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
            const token = await this.getToken();
            const response = await axios.get(
                createApiEndpoint(`beatmapsets/${beatmapId}`),
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error getting beatmap details:', error);
            throw error;
        }
    }
}

export const osuApi = new OsuApiService();
