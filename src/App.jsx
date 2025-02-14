import './App.css'
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import UserColletionsPage from './pages/UserColletionsPage';

function App() {

  return (
    <div className="osuverse-main-container">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/collections" element={<UserColletionsPage />} />
      </Routes>
    </div>
  )
}

export default App
