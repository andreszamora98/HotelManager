import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaHome, FaBed, FaClipboardCheck, FaTachometerAlt, FaTimes } from 'react-icons/fa';
import './sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Hook para obtener la ruta actual

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { name: "Inicio", icon: <FaHome />, path: "/" },
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
    { name: "Habitaciones", icon: <FaBed />, path: "/habitaciones" },
    { name: "Check-in", icon: <FaClipboardCheck />, path: "/checkin" },
  ];

  return (
    <>
      {/* Botón para abrir/cerrar el menú */}
      <div className="menu-button" onClick={toggleSidebar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </div>

      {/* Fondo oscurecido cuando la barra está abierta */}
      {isOpen && <div className="overlay" onClick={toggleSidebar}></div>}

      {/* Sidebar con animación */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <ul className="menu">
          {menuItems.map((item) => (
            <li 
              key={item.path} 
              className={location.pathname === item.path ? "active" : ""}
              onClick={() => { navigate(item.path); toggleSidebar(); }}
            >
              {item.icon} <span className={isOpen ? "show-text" : "hide-text"}>{item.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
