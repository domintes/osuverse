import { useAuth } from '../auth/AuthContext';

export default function Login() {
    const { login } = useAuth();

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Osuverse</h1>
                <p>Zaloguj się przez swoje konto osu! aby rozpocząć</p>
                <button onClick={login} className="osu-login-button">
                    <img src="/osu-logo.png" alt="osu! logo" />
                    Zaloguj przez osu!
                </button>
            </div>
        </div>
    );
}
