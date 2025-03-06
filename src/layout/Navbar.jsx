import { useNavigate } from 'react-router-dom';
import './navbar.scss';

export default function Navbar() {
  const navigate = useNavigate();

  const menuItems = [
    { itemName: 'Home', itemNav: '/home', inactive: true},
    { itemName: 'Collections', itemNav: '/collections' },
    { itemName: 'About', itemNav: '/about', inactive: true },
    { itemName: 'Add Beatmap', itemNav: '/add' },
    { itemName: 'Add Mapper', itemNav: '/mappers' },
    { itemName: 'Testo', itemNav: '/testo'  }
  ];

  const renderMenuItems = () => {
    return menuItems
      .filter(item => !item.inactive)
      .map((item, index) => (
        <div 
          key={index} 
          className="osuverse-navbar-item" 
          onClick={() => navigate(item.itemNav)}
        >
          {item.itemName}
        </div>
      ));
  };

  return (
    <div className="osuverse-navbar">
      {renderMenuItems()}
    </div>
  );
}
