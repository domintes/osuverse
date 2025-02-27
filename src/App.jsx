import './global.scss'
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AddBeatmap from './pages/AddBeatmap.jsx';
import UserColletionsPage from './pages/UserColletionsPage';
import Testo from './pages/Testo';
import Header from './layout/Header';
import AppContainer from './layout/AppContainer';
import ContentContainer from './layout/ContentContainer';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import React from 'react';
import { CollectionProvider } from './context/CollectionProvider';


function App() {

  return (
      <CollectionProvider>
        <AppContainer>
          <div className="osuverse-header-container">
          < Header />
            <Navbar />
          </div>
          <ContentContainer>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/add" element={<AddBeatmap />} />
              <Route path="/collections" element={<UserColletionsPage />} />
              <Route path="/testo" element={<Testo />} />
            </Routes>
          </ContentContainer>
          <Footer />
        </AppContainer>
      </CollectionProvider>
  )
}

export default App
