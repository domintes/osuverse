import './global.scss'
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import UserColletionsPage from './pages/UserColletionsPage';
import Testo from './pages/Testo';
import Header from './layout/Header';
import AppContainer from './layout/AppContainer';
import ContentContainer from './layout/ContentContainer';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import React from 'react';
import BeatmapList from './components/BeatmapList';
import { CollectionProvider } from './context/CollectionProvider';
import BeatmapSearch from './components/BeatmapSearch';
import AddBeatmapModal from './components/AddBeatmapModal';

function App() {

  return (
      <CollectionProvider>
        <AppContainer>
          <Header />
          <Navbar />
          <ContentContainer>
            <BeatmapSearch />
            <AddBeatmapModal onClose={() => {}} />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/collections" element={<UserColletionsPage />} />
              <Route path="/testo" element={<Testo />} />
            </Routes>
            <BeatmapList />
          </ContentContainer>
          <Footer />
        </AppContainer>
      </CollectionProvider>
  )
}

export default App
