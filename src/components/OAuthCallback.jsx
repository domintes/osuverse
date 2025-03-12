import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function OAuthCallback() {
    const [error, setError] = useState('');
    const { handleCallback } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const processOAuthCallback = async () => {
            // Pobierz kod z URL
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const error = urlParams.get('error');

            if (error) {
                setError('Wystąpił błąd podczas logowania: ' + error);
                return;
            }

            if (!code) {
                setError('Nie otrzymano kodu autoryzacji');
                return;
            }

            try {
                const success = await handleCallback(code);
                if (success) {
                    navigate('/'); // Przekieruj do głównej strony po udanym logowaniu
                } else {
                    setError('Nie udało się zalogować. Spróbuj ponownie.');
                }
            } catch (err) {
                setError('Wystąpił błąd podczas przetwarzania logowania');
                console.error('OAuth callback error:', err);
            }
        };

        processOAuthCallback();
    }, [handleCallback, navigate]);

    return (
        <div className="oauth-callback-container">
            <div className="callback-box">
                {error ? (
                    <>
                        <h2>Błąd logowania</h2>
                        <p className="error-message">{error}</p>
                        <button onClick={() => navigate('/login')}>
                            Wróć do strony logowania
                        </button>
                    </>
                ) : (
                    <>
                        <h2>Logowanie...</h2>
                        <div className="loading-spinner"></div>
                        <p>Trwa przetwarzanie logowania, proszę czekać...</p>
                    </>
                )}
            </div>
        </div>
    );
}
