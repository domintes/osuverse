import { useState, useCallback } from 'react';
import { osuApi } from '../utils/api.config';

// Funkcja do zwracania mockowych wyników dla trybu testowego
const getMockUserResults = (query) => {
    const mockUsers = [
        {
            id: 1,
            username: "chocomint",
            avatar_url: "https://a.ppy.sh/124493",
            statistics: {
                global_rank: 1,
                pp: 19874.32
            }
        },
        {
            id: 2,
            username: "mrekk",
            avatar_url: "https://a.ppy.sh/7562902",
            statistics: {
                global_rank: 2,
                pp: 19521.45
            }
        },
        {
            id: 3,
            username: "WhiteCat",
            avatar_url: "https://a.ppy.sh/4504101",
            statistics: {
                global_rank: 3,
                pp: 19234.67
            }
        }
    ];

    if (!query) return [];

    return mockUsers.filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase())
    );
};

export default function useUserSearch() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Sprawdź czy używamy trybu testowego
    const isTestMode = useCallback(() => {
        return localStorage.getItem('test_mode') === 'true';
    }, []);

    // Funkcja do wyszukiwania użytkowników
    const searchUsers = useCallback(async (query) => {
        if (!query) return [];

        setIsLoading(true);
        setError(null);

        try {
            // Jeśli jesteśmy w trybie testowym, używamy mockowych danych
            if (isTestMode()) {
                console.log('⚠️ Używam mockowych danych dla wyszukiwania użytkowników');
                const results = getMockUserResults(query);
                setIsLoading(false);
                return results;
            }

            console.log('🔍 Wyszukiwanie użytkowników:', query);

            const response = await osuApi.get('/users/search', {
                params: { query }
            });

            console.log('✅ Otrzymano wyniki wyszukiwania użytkowników:', response.data.users?.length || 0);
            setIsLoading(false);
            return response.data.users || [];
        } catch (error) {
            console.error('❌ Błąd wyszukiwania użytkowników:', error);
            setError('Nie udało się wyszukać użytkowników');
            setIsLoading(false);

            // W przypadku błędu zwróć mockowe dane
            console.log('⚠️ Używam danych awaryjnych dla wyszukiwania użytkowników');
            return getMockUserResults(query);
        }
    }, [isTestMode]);

    return {
        searchUsers,
        isLoading,
        error
    };
} 