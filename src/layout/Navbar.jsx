import { css } from 'goober';

export default function Navbar() {
    return (
        <div className={navbarStyle}>
            <div className="navbar-item">Home</div>
            <div className="navbar-item">Collection</div>
            <div className="navbar-item">About</div>
        </div>
    );
}

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
