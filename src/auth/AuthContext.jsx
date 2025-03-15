import React, { createContext, useContext, useState, useEffect } from 'react';
import { postWithCors, fetchWithCors } from '../utils/apiUtils';

// Stałe dla autoryzacji osu!
const OSU_CLIENT_ID = '38309';
const OSU_CLIENT_SECRET = '13hePdYOxB2WwJTvO9t9PuF6xlqxgYgVNb7gZ0f0';
const OSU_REDIRECT_URI = 'http://localhost:5173/oauth/callback'; // Bez proxy w URI przekierowania
const OSU_SCOPE = 'public identify';

// Tryb testowy - ustaw na true, aby pominąć logowanie OAuth
const TEST_MODE = true;
const TEST_USER = {
  id: 12345,
  username: 'TestUser',
  avatar_url: 'https://a.ppy.sh/1',
  access_token: 'fake_token',
  refresh_token: 'fake_refresh',
  expires_at: new Date().getTime() + 86400000, // +24h
  // Dodaj inne potrzebne pola
};

const AuthContext = createContext(null);

// Tworzymy hook useAuth w tym samym pliku
function useAuth() {
  return useContext(AuthContext);
}

export { useAuth };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUser = () => {
      console.log('🔍 Sprawdzanie sesji użytkownika...');
      
      // Zapisz informację o trybie testowym w localStorage dla innych komponentów
      localStorage.setItem('test_mode', TEST_MODE.toString());
      
      // Jeśli włączony tryb testowy, ustaw użytkownika testowego
      if (TEST_MODE) {
        console.log('⚠️ TRYB TESTOWY AKTYWNY - używanie testowego użytkownika');
        setUser(TEST_USER);
        // Zapisz testowego użytkownika w localStorage
        localStorage.setItem('osuverseUser', JSON.stringify(TEST_USER));
        setLoading(false);
        return;
      }
      
      const storedUser = localStorage.getItem('osuverseUser');
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          console.log('✅ Załadowano dane użytkownika z localStorage:', userData.username);
          setUser(userData);
        } catch (e) {
          console.error('❌ Błąd podczas ładowania danych użytkownika:', e);
          localStorage.removeItem('osuverseUser');
        }
      } else {
        console.log('ℹ️ Brak zapisanego użytkownika');
      }
      
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = () => {
    console.log('🔐 Rozpoczynam proces logowania...');
    
    // Jeśli włączony tryb testowy, ustaw użytkownika testowego bez przekierowania
    if (TEST_MODE) {
      console.log('⚠️ TRYB TESTOWY AKTYWNY - logowanie automatyczne');
      setUser(TEST_USER);
      localStorage.setItem('osuverseUser', JSON.stringify(TEST_USER));
      return;
    }
    
    // Tworzenie URL autoryzacji dla osu! - BEZ PROXY dla przekierowania
    const baseAuthUrl = 'https://osu.ppy.sh/oauth/authorize';
    const authUrl = new URL(baseAuthUrl);
    
    // Dodawanie parametrów
    authUrl.searchParams.append('client_id', OSU_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', OSU_REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', OSU_SCOPE);
    
    console.log('🔄 Przekierowuję do URL autoryzacji:', authUrl.toString());
    
    // Przekierowanie do strony logowania osu!
    window.location.href = authUrl.toString();
  };

  const handleOAuthCallback = async (code) => {
    try {
      setError('');
      console.log('🔄 Rozpoczynam wymianę kodu na token...');
      console.log('📝 Kod autoryzacyjny (pierwsze 10 znaków):', code.substring(0, 10) + '...');
      
      // Wymiana kodu autoryzacji na token dostępu
      const tokenUrl = 'https://cors-anywhere.herokuapp.com/https://osu.ppy.sh/oauth/token';
      const tokenData = {
        client_id: OSU_CLIENT_ID,
        client_secret: OSU_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: OSU_REDIRECT_URI
      };
      
      console.log('📤 Wysyłam dane do wymiany tokena:', JSON.stringify(tokenData, null, 2));
      
      const tokenResponse = await postWithCors(tokenUrl, tokenData);
      console.log('📥 Otrzymano token. Typ tokena:', tokenResponse.data.token_type);

      const { access_token, refresh_token, expires_in } = tokenResponse.data;
      
      // Pobieranie danych użytkownika
      console.log('🔍 Pobieranie danych użytkownika...');
      const userResponse = await fetchWithCors('https://osu.ppy.sh/api/v2/me', {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });
      
      console.log('✅ Pobrano dane użytkownika:', userResponse.data.username);

      const userData = {
        ...userResponse.data,
        access_token,
        refresh_token,
        expires_at: new Date().getTime() + expires_in * 1000
      };

      // Zapisywanie danych użytkownika
      localStorage.setItem('osuverseUser', JSON.stringify(userData));
      setUser(userData);
      
      return userData;
    } catch (err) {
      console.error('❌ Błąd podczas autoryzacji OAuth:', err);
      
      if (err.response) {
        console.error('📄 Status błędu:', err.response.status);
        console.error('📄 Dane odpowiedzi:', err.response.data);
        console.error('📄 Nagłówki odpowiedzi:', err.response.headers);
      } else if (err.request) {
        console.error('📄 Błąd żądania - brak odpowiedzi:', err.request);
      } else {
        console.error('📄 Błąd konfiguracji:', err.message);
      }
      
      // Pobieranie szczegółów błędu z odpowiedzi
      const errorDetails = err.response?.data?.error || err.message || 'Nieznany błąd autoryzacji';
      const errorMessage = err.response?.data?.error_description || 'Nie udało się zalogować. Spróbuj ponownie.';
      
      setError(`${errorDetails}: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    console.log('🚪 Wylogowywanie użytkownika...');
    localStorage.removeItem('osuverseUser');
    setUser(null);
    console.log('✅ Użytkownik wylogowany');
  };

  const isAuthenticated = () => {
    return !!user;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error,
      login, 
      logout, 
      handleOAuthCallback, 
      isAuthenticated,
      testMode: TEST_MODE
    }}>
      {children}
    </AuthContext.Provider>
  );
};
