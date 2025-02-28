import React, { useEffect, useState } from 'react';
import './modal.css';

const Modal = ({ message, onClose }) => {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setClosing(true); // Activa la animación de salida
      setTimeout(onClose, 500); // Esperar a que la animación termine antes de cerrar
    }, 2000); // Tiempo total que el modal permanece visible

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`modal-backdrop ${closing ? 'fade-out' : ''}`}>
      <div className={`modal-content ${closing ? 'slide-down' : ''}`}>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default Modal;

