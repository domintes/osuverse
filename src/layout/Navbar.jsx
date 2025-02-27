import { useNavigate } from 'react-router-dom';
import './navbar.scss';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <div className="osuverse-navbar">
      <div className="osuverse-navbar-item" onClick={() => navigate('/')}>Home</div>
      <div className="osuverse-navbar-item" onClick={() => navigate('/collections')}>Collection</div>
      <div className="osuverse-navbar-item" onClick={() => navigate('/about')}>About</div>
      <div className="osuverse-navbar-item" onClick={() => navigate('/add')}>Add Map</div>
      <div className="osuverse-navbar-item" onClick={() => navigate('/testo')}>Testo</div>
    </div>
  );
}
