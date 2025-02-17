import './App.css'
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import UserColletionsPage from './pages/UserColletionsPage';
import Header from './layout/Header';
import AppContainer from './layout/AppContainer';
import ContentContainer from './layout/ContentContainer';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';

function App() {

  return (
      <AppContainer>
        <Header />
        <Navbar />
        <ContentContainer>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/collections" element={<UserColletionsPage />} />
          </Routes>
        </ContentContainer>
        <Footer />
      </AppContainer>
  )
}

export default App
