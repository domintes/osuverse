import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaInfoCircle, FaPlus, FaFolderOpen, FaUserPlus } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <NavLink 
        to="/" 
        className={({ isActive }) => 
          isActive ? "navbar__link navbar__link--active" : "navbar__link"
        }
      >
        <FaHome className="navbar__icon" />
        <span className="navbar__text">Strona główna</span>
      </NavLink>
      
      <NavLink 
        to="/collections" 
        className={({ isActive }) => 
          isActive ? "navbar__link navbar__link--active" : "navbar__link"
        }
      >
        <FaFolderOpen className="navbar__icon" />
        <span className="navbar__text">Kolekcje</span>
      </NavLink>
      
      <NavLink 
        to="/add" 
        className={({ isActive }) => 
          isActive ? "navbar__link navbar__link--active" : "navbar__link"
        }
      >
        <FaPlus className="navbar__icon" />
        <span className="navbar__text">Dodaj beatmapę</span>
      </NavLink>
      
      <NavLink 
        to="/mappers" 
        className={({ isActive }) => 
          isActive ? "navbar__link navbar__link--active" : "navbar__link"
        }
      >
        <FaUserPlus className="navbar__icon" />
        <span className="navbar__text">Dodaj mappera</span>
      </NavLink>
      
      <NavLink 
        to="/about" 
        className={({ isActive }) => 
          isActive ? "navbar__link navbar__link--active" : "navbar__link"
        }
      >
        <FaInfoCircle className="navbar__icon" />
        <span className="navbar__text">O projekcie</span>
      </NavLink>
    </nav>
  );
};

export default Navbar;
