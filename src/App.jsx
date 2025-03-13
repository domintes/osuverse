import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { CollectionProvider } from './context/CollectionProvider';
import AppContainer from './layout/AppContainer';
import ContentContainer from './layout/ContentContainer';
import Header from './layout/Header';
import Navbar from './layout/Navbar';
import Background from './components/Background/Background';
import Login from './components/Login';
import OAuthCallback from './components/OAuthCallback';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AddMapper from './pages/AddMapper';
import AddBeatmap from './pages/AddBeatmap';
import UserColletionsPage from './pages/UserCollectionsPage';
import Testo from './pages/Testo';
import React, { useEffect } from 'react';
import CollectionManager from './components/CollectionManager/CollectionManager';
import CollectionDetails from './components/CollectionDetails/CollectionDetails';
import useBeatmapStore from './stores/beatmapStore';
import './styles/main.css';
import './components.css';

// Komponent ochrony trasy - przekieruje na login jeśli użytkownik nie jest zalogowany
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="void-container loading">
                <div className="loading-text">Ładowanie...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
};

// Główny komponent aplikacji
function AppContent() {
    const { user } = useAuth();
    const { loadCollections } = useBeatmapStore();

    useEffect(() => {
        loadCollections();
    }, [loadCollections]);

    // Jeśli użytkownik nie jest zalogowany i nie jest na stronie logowania/callback,
    // pokazujemy tylko komponent logowania
    if (!user && !['/login', '/oauth/callback'].includes(window.location.pathname)) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="app">
            <div className="stars-background">
                {Array.from({ length: 50 }).map((_, i) => (
                    <div key={i} className="star" style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`
                    }} />
                ))}
            </div>
            <Background />
            <CollectionProvider>
                <AppContainer>
                    {user && (
                        <div className="osuverse-header-container void-container">
                            <Header />
                            <Navbar />
                        </div>
                    )}
                    <ContentContainer>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/oauth/callback" element={<OAuthCallback />} />
                            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                            <Route path="/about" element={<ProtectedRoute><AboutPage /></ProtectedRoute>} />
                            <Route path="/add" element={<ProtectedRoute><AddBeatmap /></ProtectedRoute>} />
                            <Route path="/collections" element={<ProtectedRoute><UserColletionsPage /></ProtectedRoute>} />
                            <Route path="/mappers" element={<ProtectedRoute><AddMapper /></ProtectedRoute>} />
                            <Route path="/testo" element={<ProtectedRoute><Testo /></ProtectedRoute>} />
                            <Route path="/collection-manager" element={<ProtectedRoute><CollectionManager /></ProtectedRoute>} />
                            <Route path="/collection-details" element={<ProtectedRoute><CollectionDetails /></ProtectedRoute>} />
                        </Routes>
                    </ContentContainer>
                </AppContainer>
            </CollectionProvider>
        </div>
    );
}

// Wrapper aplikacji z providerami
export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
