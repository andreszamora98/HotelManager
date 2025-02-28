import React from 'react';
import './footer.css';

const Footer = ({ title }) => {
  return (
    <div className="top-footer">
      <h1 className="titulo-checkin">{title}</h1> {/* Usamos el título dinámico */}
    </div>
  );
};

export default Footer;
