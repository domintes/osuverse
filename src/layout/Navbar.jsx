import { css } from 'goober';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <div className={navbarStyle}>
      <div className="navbar-item" onClick={() => navigate('/')}>Home</div>
      <div className="navbar-item" onClick={() => navigate('/collections')}>Collection</div>
      <div className="navbar-item" onClick={() => navigate('/about')}>About</div>
      <div className="navbar-item" onClick={() => navigate('/testo')}>Testo</div>
    </div>
  );
}


//  Styles
const navbarStyle = css`
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #1c1c1c;
  padding: 20px 0;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);

  .navbar-item {
    padding: 10px 20px;
    color: #aaa;
    font-size: 18px;
    cursor: pointer;
    transition: color 0.3s ease;
  }

  .navbar-item:hover {
    color: #fff;
  }
`;
