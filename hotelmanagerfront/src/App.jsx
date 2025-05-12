import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login';
import Dashboard from './components/dashboard';
import Habitaciones from './components/pages/habitaciones';
import CheckIn from './components/pages/checkin';
import Mantenimiento from './components/pages/mantenimiento';
import Limpieza from './components/pages/limpieza'
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/habitaciones" element={<Habitaciones />} />
        <Route path="/checkin" element={<CheckIn />} />
        <Route path="/mantenimiento" element={<Mantenimiento />} />
        <Route path="/limpieza" element={<Limpieza />} />
      </Routes>
    </Router>
  );
}

export default App;
