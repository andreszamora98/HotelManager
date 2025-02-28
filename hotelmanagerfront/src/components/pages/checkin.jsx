import React, { useState } from "react";
import Sidebar from "../sidebar";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import "./checkin.css"; // Importamos los estilos solo para Check-in
import Footer from '../footer';

const CheckIn = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    rfc: "",
    direccion: "",
    fechaEntrada: "",
    fechaSalida: "",
    tipoHabitacion: "",
    costoPorNoche: 0,
  });

  const [pdfUrl, setPdfUrl] = useState(null); // Almacenar la URL de la factura generada

  const preciosHabitaciones = {
    estandar: 1500,
    suite: 2500,
    presidencial: 5000,
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "tipoHabitacion") {
      setFormData({
        ...formData,
        tipoHabitacion: value,
        costoPorNoche: preciosHabitaciones[value],
      });
    }
  };

  const calcularTotal = () => {
    const fechaInicio = new Date(formData.fechaEntrada);
    const fechaFin = new Date(formData.fechaSalida);
    const noches = (fechaFin - fechaInicio) / (1000 * 60 * 60 * 24);

    const subtotal = noches * formData.costoPorNoche;
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    return { noches, subtotal, iva, total };
  };

  const generarFacturaPDF = () => {
    const { noches, subtotal, iva, total } = calcularTotal();
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("FACTURA DE HOSPEDAJE", 20, 20);

    doc.setFontSize(12);
    doc.text(`Cliente: ${formData.nombre}`, 20, 40);
    doc.text(`RFC: ${formData.rfc}`, 20, 50);
    doc.text(`Dirección: ${formData.direccion}`, 20, 60);

    doc.text(`Fecha de entrada: ${formData.fechaEntrada}`, 20, 80);
    doc.text(`Fecha de salida: ${formData.fechaSalida}`, 20, 90);
    doc.text(`Tipo de habitación: ${formData.tipoHabitacion.toUpperCase()}`, 20, 100);
    doc.text(`Noches: ${noches}`, 20, 110);
    doc.text(`Costo por noche: $${formData.costoPorNoche}`, 20, 120);

    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 20, 140);
    doc.text(`IVA (16%): $${iva.toFixed(2)}`, 20, 150);
    doc.text(`Total: $${total.toFixed(2)}`, 20, 160);

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    setPdfUrl(pdfUrl);
  };

  return (
    <div className="checkin-container">
      <Footer title="GESTOR DE CHECK-IN" />  
      <Sidebar />
      {/* 
      <div className="checkin-wrapper">
      <div className="top-footer">
        <h1 className="titulo-checkin"> GESTOR DE CHECK-IN </h1>
      </div>
      */}
      <div className="checkin-content">
        {/* FORMULARIO A LA IZQUIERDA */}
        <div className="form-container">
          <h2 className="title">Registro de Check-in</h2>

          <label>Nombre del Cliente:</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} />

          <label>RFC:</label>
          <input type="text" name="rfc" value={formData.rfc} onChange={handleInputChange} />

          <label>Dirección:</label>
          <input type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} />

          <label>Fecha de Entrada:</label>
          <input type="date" name="fechaEntrada" value={formData.fechaEntrada} onChange={handleInputChange} />

          <label>Fecha de Salida:</label>
          <input type="date" name="fechaSalida" value={formData.fechaSalida} onChange={handleInputChange} />

          <label>Tipo de Habitación:</label>
          <select name="tipoHabitacion" value={formData.tipoHabitacion} onChange={handleInputChange}>
            <option value="">Seleccione una opción</option>
            <option value="estandar">Estándar - $1,500 por noche</option>
            <option value="suite">Suite - $2,500 por noche</option>
            <option value="presidencial">Presidencial - $5,000 por noche</option>
          </select>

          <button className="generate-button" onClick={generarFacturaPDF}>Generar Factura</button>
        </div>

        {/* PREVISUALIZACIÓN DE FACTURA A LA DERECHA */}
        <div className="invoice-preview">
          <h3>Previsualización de Factura</h3>
          {pdfUrl ? (
            <>
              <iframe className="pdf-preview" src={pdfUrl} title="Factura PDF"></iframe>
              <a className="download-button" href={pdfUrl} download="Factura_CheckIn.pdf">
                Descargar Factura
              </a>
            </>
          ) : (
            <p>No hay factura generada aún.</p>
          )}
        </div>
       </div>

      
    </div>
  );
};

export default CheckIn;


