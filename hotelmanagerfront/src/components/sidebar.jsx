import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaBars, FaHome, FaBed, FaClipboardCheck, FaTachometerAlt, FaTimes, 
  FaTools, FaBroom, FaUserCircle, FaSignOutAlt, FaUser
} from 'react-icons/fa';
import './sidebar.css';
import logo from './logo-blanco.png'; 

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Obtener el rol del usuario logueado
  const perfil = localStorage.getItem('perfil'); 
  const roles = {
    "A": "Administrador",
    "B": "Mantenimiento",
    "C": "Recepcionista",
    "D": "Limpieza"
  };

  // Obtener el nombre completo del usuario y extraer el primer nombre
  const nombreCompleto = localStorage.getItem('nombreUsuario') || 'Usuario';
  const primerNombre = nombreCompleto.split(' ')[0]; // Si hay espacios, toma sólo el primer token

  const menuItems = [
    perfil === "A" && { name: "Usuarios", icon: <FaUser />, path: "/dashboard" },
    (perfil === "A" || perfil === "C") && { name: "Habitaciones", icon: <FaBed />, path: "/habitaciones" },
    (perfil === "A" || perfil === "C") && { name: "Check-in", icon: <FaClipboardCheck />, path: "/checkin" },
    (perfil === "A" || perfil === "B") && { name: "Mantenimiento", icon: <FaTools />, path: "/mantenimiento" },
    (perfil === "A" || perfil === "D") && { name: "Limpieza", icon: <FaBroom />, path: "/limpieza" },
  ].filter(Boolean); 

  return (
    <>
      {/* Botón de menú */}
      <div className="menu-button" onClick={toggleSidebar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </div>

      {/* Fondo oscurecido cuando el sidebar está abierto */}
      {isOpen && <div className="overlay" onClick={toggleSidebar}></div>}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        
        {/* 🔹 LOGO SUPERIOR 🔹 */}
        <div className="sidebar-header">
          <img src={logo} alt="Logo del Hotel" className="sidebar-logo" />
          <h2 className="sidebar-title">HOTEL MANAGER KOM</h2>
        </div>

        {/* 🔹 MENÚ DE OPCIONES 🔹 */}
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

        {/* 🔹 SECCIÓN DE USUARIO ABAJO (modificada para incluir el primer nombre arriba del rol, antes del ícono) 🔹 */}
        <div className="sidebar-footer">
          <FaUserCircle className="user-icon" />
          <span className="user-role">{primerNombre}</span>
          <span className="user-role">{roles[perfil] || "Usuario"}</span>
          <button className="logout-button" onClick={() => { 
            localStorage.removeItem("perfil"); 
            navigate("/"); 
          }}>
            <FaSignOutAlt className="logout-icon" />
            <span>Salir</span>
          </button>
        </div>

      </div>
    </>
  );
};

export default Sidebar;
