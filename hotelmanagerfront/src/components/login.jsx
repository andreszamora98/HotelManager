import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import Modal from './modal';
import logo from './logo.png';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [modalMessage, setModalMessage] = useState(null);
  const [redirectPath, setRedirectPath] = useState(null); // Estado para la redirección
  const navigate = useNavigate();

  useEffect(() => {
    if (redirectPath) {
      setTimeout(() => {
        navigate(redirectPath);
      }, 1500);
    }
  }, [redirectPath, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contraseña }),
      });

      if (response.ok) {
        const data = await response.json();
        setModalMessage(data.message);

        // Guardar el perfil en localStorage
        localStorage.setItem('perfil', data.perfil);
        // Al iniciar sesión correctamente
        localStorage.setItem('nombreUsuario', data.usuario.NOMBRE_CLIENTE ); 


        // Determinar la ruta de redirección según el perfil
        let path = '/';
        if (data.perfil === 'A') path = '/dashboard';
        else if (data.perfil === 'B') path = '/mantenimiento';
        else if (data.perfil === 'C') path = '/checkin';
        else if (data.perfil === 'D') path = '/limpieza';

        setRedirectPath(path); // Activar la redirección

      } else if (response.status === 401) {
        setModalMessage('No tienes privilegios suficientes');
      } else {
        setModalMessage('Error en el servidor. Intente más tarde.');
      }
    } catch (err) {
      setModalMessage('No se pudo conectar al servidor.');
    }
  };

  return (
    <div className="login-container">
      <h1>Hotel Manager KOM</h1>
      <img src={logo} alt="Logo del Hotel" className="logo" />
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="correo">Usuario:</label>
          <input
            type="text"
            id="correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="Ingrese su usuario"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="contraseña">Contraseña:</label>
          <input
            type="password"
            id="contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            placeholder="Ingrese su contraseña"
            required
          />
        </div>
        <div className="button-group">
          <button type="submit">Iniciar Sesión</button>
          <button type="button" className="clear-button" onClick={() => { setCorreo(''); setContraseña(''); }}>Limpiar</button>
        </div>
      </form>

      {modalMessage && <Modal message={modalMessage} onClose={() => setModalMessage(null)} />}
    </div>
  );
};

export default Login;
