import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { CollectionProvider } from './context/CollectionProvider';
import AppContainer from './layout/AppContainer';
import ContentContainer from './layout/ContentContainer';
import Header from './layout/Header';
import Navbar from './layout/Navbar';
import Login from './components/Login';
import OAuthCallback from './components/OAuthCallback';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AddMapper from './pages/AddMapper';
import AddBeatmap from './pages/AddBeatmap';
import Testo from './pages/Testo';
import React from 'react';
import './global.scss';

// Komponent ochrony trasy - przekieruje na login jeśli użytkownik nie jest zalogowany
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="loading-screen">Ładowanie...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
};

// Główny komponent aplikacji
function AppContent() {
    const { user } = useAuth();

    // Jeśli użytkownik nie jest zalogowany i nie jest na stronie logowania/callback,
    // pokazujemy tylko komponent logowania
    if (!user && !['/login', '/oauth/callback'].includes(window.location.pathname)) {
        return <Navigate to="/login" />;
    }

    return (
        <CollectionProvider>
            <AppContainer>
                {user && (
                    <div className="osuverse-header-container">
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
                    </Routes>
                </ContentContainer>
            </AppContainer>
        </CollectionProvider>
    );
}

// Wrapper aplikacji z providerami
export default function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}
