import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './OAuthCallback.css';

const OAuthCallback = () => {
    const { handleOAuthCallback, error } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [localError, setLocalError] = useState('');
    const [status, setStatus] = useState('Trwa przetwarzanie logowania...');

    useEffect(() => {
        const processAuth = async () => {
            try {
                // Pobierz kod autoryzacyjny z URL
                const params = new URLSearchParams(location.search);
                const code = params.get('code');
                const error = params.get('error');
                
                if (error) {
                    setLocalError(`Błąd autoryzacji: ${error}`);
                    setStatus('Wystąpił błąd');
                    return;
                }
                
                if (!code) {
                    setLocalError('Brak kodu autoryzacyjnego w URL');
                    setStatus('Wystąpił błąd');
                    return;
                }
                
                // Wyświetl informacje debugowania
                console.log('Otrzymany kod autoryzacyjny:', code);
                
                // Wywołaj funkcję do obsługi kodu autoryzacyjnego
                setStatus('Uzyskiwanie tokena...');
                await handleOAuthCallback(code);
                
                // Po pomyślnym zalogowaniu, przekieruj na stronę główną
                setStatus('Logowanie zakończone sukcesem! Przekierowywanie...');
                setTimeout(() => navigate('/'), 1000);
            } catch (err) {
                console.error('Błąd w komponencie OAuthCallback:', err);
                setLocalError(err.message || 'Wystąpił nieznany błąd podczas logowania');
                setStatus('Wystąpił błąd');
            }
        };
        
        processAuth();
    }, [handleOAuthCallback, navigate, location]);

    return (
        <div className="oauth-callback">
            <div className="oauth-callback__card">
                <h2>Logowanie przez osu!</h2>
                
                <div className="oauth-callback__status">
                    <div className="oauth-callback__spinner"></div>
                    <p>{status}</p>
                </div>
                
                {(localError || error) && (
                    <div className="oauth-callback__error">
                        <p>{localError || error}</p>
                        <button 
                            className="oauth-callback__button"
                            onClick={() => navigate('/login')}
                        >
                            Wróć do strony logowania
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OAuthCallback;
