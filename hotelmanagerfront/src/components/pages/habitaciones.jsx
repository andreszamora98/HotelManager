import React from 'react';
import Sidebar from '../sidebar';

const Habitaciones = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="content">
        <h1 className="titulo-habitaciones"> GESTOR DE HABITACIONES </h1>
      </div>
    </div>
  );
};

export default Habitaciones;
