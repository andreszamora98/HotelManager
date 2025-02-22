import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate
import './login.css';
import Modal from './modal';
import logo from './logo.png'


const Login = () => {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [modalMessage, setModalMessage] = useState(null);
  const navigate = useNavigate(); // Hook para la navegación

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, contraseña }),
      });

      if (response.ok) {
        const data = await response.json();
        setModalMessage(data.message);
        setTimeout(() => navigate('/dashboard'), 1500); // Redirigir después de 3s
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
