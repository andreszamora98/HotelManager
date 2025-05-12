import React from "react";
import { FaFileDownload } from "react-icons/fa";
import "./footer.css";

const Footer = ({ title, generarReporte }) => {
  return (
    <div className="top-footer">
      {/* Título centrado */}
      <h1 className="titulo-checkin">{title}</h1>
      {/* 🔹 BOTÓN DE GENERAR REPORTE 🔹 */}
      <button className="report-button" onClick={generarReporte} title="Generar Reporte">
        <FaFileDownload className="report-icon" />
      </button>
    </div>
  );
};

export default Footer;
