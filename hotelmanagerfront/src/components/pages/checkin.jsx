import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar";
import { useNavigate, useLocation } from 'react-router-dom';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; 
import "./checkin.css"; // Importamos los estilos solo para Check-in
import Footer from "../footer";
import Modal from "../modal";
import { PDFDocument, rgb } from "pdf-lib"; 
import ModalEncuesta from "../modalencuesta";  

const CheckIn = () => {
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    rfc: "",
    direccion: "",
    fechaEntrada: "",
    fechaSalida: "",
    tipoHabitacion: "",
    costoPorNoche: 0,
  });

  const [errors, setErrors] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [showModalEncuesta, setShowModalEncuesta] = useState(false);

  const activarModalEncuesta = () => {
    setShowModalEncuesta(true);
  };



  const preciosHabitaciones = {
    estandar: 1500,
    suite: 2500,
    presidencial: 5000,
  };

  useEffect(() => {
    const obtenerClientes = async () => {
      try {
        const response = await fetch("http://localhost:3001/checkin/clientes");
        if (!response.ok) {
          throw new Error("Error al obtener clientes");
        }
        const data = await response.json();
        setClientes(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    obtenerClientes();
  }, []);
 


  const handleNombreChange = (e) => {
    const selectedNombre = e.target.value;
    setFormData({ ...formData, nombre: selectedNombre });

    const clienteSeleccionado = clientes.find(
      (cliente) => cliente.NOMBRE_CLIENTE === selectedNombre
    );

    if (clienteSeleccionado) {
      setFormData({
        ...formData,
        nombre: clienteSeleccionado.NOMBRE_CLIENTE,
        rfc: clienteSeleccionado.RFC,
        direccion: clienteSeleccionado.DIRECCION,
      });
    }
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

    // Limpiar errores al ingresar valores
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value ? "" : "*Campo obligatorio*",
    }));
  };
const handleBlur = (e) => {
  const { name, value } = e.target;
  if (value.trim() === '') {
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '*Campo obligatorio*' }));
  }
};
const validarFormulario = () => {
  let newErrors = {};
  let isValid = true;
  let errorMessage = ""; 

  Object.keys(formData).forEach((key) => {
    if (!formData[key]) {
      newErrors[key] = "*Campo obligatorio*";
      isValid = false;
    }
  });

  if (!isValid) {
    errorMessage = "Ningún campo puede estar vacío";
  }

  if (formData.fechaEntrada && formData.fechaSalida) {
    const fechaEntrada = new Date(formData.fechaEntrada);
    const fechaSalida = new Date(formData.fechaSalida);

    if (fechaEntrada >= fechaSalida) {
      newErrors.fechaEntrada = "La fecha de entrada debe ser menor a la fecha de salida";
      newErrors.fechaSalida = "La fecha de salida debe ser mayor a la fecha de entrada";
      errorMessage = "La fecha de entrada debe ser menor a la fecha de salida";
      isValid = false;
    }
  }

  setErrors(newErrors);
  return isValid ? null : errorMessage; 
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

const generarFacturaPDF = async () => {
  const errorMessage = validarFormulario();

  if (errorMessage) {
    setModalMessage(errorMessage);
    setModalVisible(true);
    return;
  }

  const { noches, subtotal, iva, total } = calcularTotal();

  const checkinData = {
    nombre: formData.nombre,
    rfc: formData.rfc,
    direccion: formData.direccion,
    fechaEntrada: formData.fechaEntrada,
    fechaSalida: formData.fechaSalida,
    tipoHabitacion: formData.tipoHabitacion,
    costoPorNoche: formData.costoPorNoche,
    noches,
    subtotal,
    iva,
    total,
  };

  try {
    console.log("Enviando datos al backend:", checkinData);

    const response = await fetch("http://localhost:3001/checkin/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checkinData),
    });

    const result = await response.json();

    console.log("Respuesta del servidor:", result);

    if (!response.ok) {
      throw new Error(result.error || "Error al guardar en la base de datos");
    }

    console.log("Check-in guardado en la BD con ID:", result.id);
    
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
  } catch (error) {
    console.error("Error al enviar los datos:", error);
    setModalMessage("Error al registrar el check-in. Inténtalo de nuevo.");
    setModalVisible(true);
  }
};


const generarReporteCheckIn = async () => {
  try {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const nombreUsuario = localStorage.getItem('nombreUsuario') || 'Usuario Desconocido';
    const perfilUsuario = localStorage.getItem('perfil');
    const departamento = perfilUsuario === 'A' ? "Departamento de Administración" :
                         perfilUsuario === 'B' ? "Departamento de Mantenimiento" :
                         perfilUsuario === 'C' ? "Departamento de Recepción" :
                         perfilUsuario === 'D' ? "Departamento de Limpieza" : "Departamento Desconocido";

    // Carga el logo para usarlo en cada página
    const logo = new Image();
    logo.src = "/logo.png";

    logo.onload = async () => {
      // 1) Obtener todos los check-ins
      const res = await fetch("http://localhost:3001/checkin/reporte");
      const checkinData = await res.json();

      if (!checkinData || checkinData.length === 0) {
        alert("No hay datos de check-in disponibles.");
        return;
      }

      // 2) Configurar items por página
      let itemsPorPagina = 13;
      let totalPaginas = Math.ceil(checkinData.length / itemsPorPagina);
      let totalGeneral = 0;

      for (let pagina = 0; pagina < totalPaginas; pagina++) {
        // Agregar nueva página (excepto en la primera)
        if (pagina > 0) {
          doc.addPage();
        }

        // 🔹 A) Encabezado + Info Principal
        doc.setFillColor(200, 230, 255);
        doc.rect(0, 0, 210, 30, "F");
        doc.addImage(logo, "PNG", 15, 1, 28, 28);

        doc.setFontSize(16);
        doc.setFont("times", "bolditalic");
        doc.setTextColor(0, 22, 100);
        doc.text("''Tu comodidad, nuestra prioridad''", 115, 20);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        const fechaActual = new Date();
        const fechaReporte = fechaActual.toLocaleDateString();
        const horaReporte = fechaActual.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        doc.setFont("helvetica", "bolditalic");
        doc.text(`Fecha de Reporte:`, 20, 40);
        doc.setFont("helvetica", "normal");
        doc.text(`${fechaReporte}`, 60, 40);

        doc.setFont("helvetica", "bolditalic");
        doc.text(`Hora: `, 170, 40);
        doc.setFont("helvetica", "normal");
        doc.text(`${horaReporte}`, 183, 40);

        doc.setFont("helvetica", "bolditalic");
        doc.text(`Generado por: `, 20, 49);
        doc.setFont("helvetica", "normal");
        doc.text(`${nombreUsuario}`, 52, 49);

        doc.setFont("helvetica", "bolditalic");
        doc.text(`Área:`, 20, 58);
        doc.setFont("helvetica", "normal");
        doc.text(`${departamento}`, 33, 58);

        doc.setFont("helvetica", "bolditalic");
        doc.setFontSize(14);
        doc.text("REPORTE DE CHECK-IN: DETALLE DE ESTANCIAS", 45, 68);

        // 🔹 B) Items de esta página
        const inicio = pagina * itemsPorPagina;
        const fin = inicio + itemsPorPagina;
        const checkinsPagina = checkinData.slice(inicio, fin);

        // 🔹 C) Datos para la tabla
        const tablaData = checkinsPagina.map((row) => {
          totalGeneral += parseFloat(row.total);
          return [
            row.nombre,
            row.rfc,
            row.direccion,
            row.fechaEntrada,
            row.fechaSalida,
            row.tipoHabitacion,
            `$${parseFloat(row.total).toFixed(2)}`
          ];
        });

        // 🔹 D) Dibujar la tabla
        autoTable(doc, {
          startY: 75,
          head: [["Nombre", "RFC", "Dirección", "Fecha Entrada", "Fecha Salida", "Tipo Habitación", "Total"]],
          body: tablaData,
          theme: "grid",
          headStyles: { fillColor: [23, 70, 145] },
          margin: { top: 10 },
        });

        // 🔹 E) Pie de página (paginación)
        doc.setFontSize(10);
        doc.text(`Página ${pagina + 1} de ${totalPaginas}`, 105, 290, { align: "center" });

        // 🔹 F) Si es la última página, agregar el total debajo de la tabla
        if (pagina === totalPaginas - 1) {
          // Usar doc.lastAutoTable para saber dónde terminó la tabla
          const finalY = doc.lastAutoTable
            ? doc.lastAutoTable.finalY
            : 75; // Valor por defecto si algo falla

          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0, 0, 0);
          doc.text(`Total: $${totalGeneral.toFixed(2)}`, 163, finalY + 8);
        }
      }

      // 🔹 G) Marca de agua en todas las páginas
      const totalPaginasFinal = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPaginasFinal; i++) {
        doc.setPage(i);
        doc.setFontSize(100);
        doc.setTextColor(0, 51, 153);
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.2 }));
        doc.text("Sin validez", 140, 200, {
          angle: 45,
          align: "center",
        });
        doc.restoreGraphicsState();
      }

      // 🔹 H) Descargar PDF
      doc.save("Reporte_CheckIn_Detallado.pdf");
    };
  } catch (error) {
    console.error("Error al generar el reporte:", error);
  }
};





  return (
    <div className="checkin-container">
      <Footer title="GESTOR DE CHECK-IN"  generarReporte={generarReporteCheckIn}  />
      <Sidebar />
      {showModalEncuesta && (
      <ModalEncuesta
        isVisible={showModalEncuesta}
        onClose={() => setShowModalEncuesta(false)}
      />
      )}
      <div className="checkin-content">
        <div className="form-container">
          <h2 className="title">REGISTRO DE CHECK-IN</h2>

          <label>Nombre del Cliente:</label>
          <select
            name="nombre"
            value={formData.nombre}
            onChange={handleNombreChange}
            onBlur={handleBlur} 
            className={errors.nombre ? "error-input" : ""}
          >
            <option value="">Seleccione un cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.RFC} value={cliente.NOMBRE_CLIENTE}>
                {cliente.NOMBRE_CLIENTE}
              </option>
            ))}
          </select>
          {errors.nombre && <p className="error-text">{errors.nombre}</p>}

          <label>RFC:</label>
          <input type="text" name="rfc" value={formData.rfc} readOnly />

          <label>Dirección:</label>
          <input type="text" name="direccion" value={formData.direccion} readOnly />

          <label>Fecha de Entrada:</label>
          <input
            type="date"
            name="fechaEntrada"
            value={formData.fechaEntrada}
            onChange={handleInputChange}
            onBlur={handleBlur} 
            className={errors.fechaEntrada ? "error-input" : ""}
          />
          {errors.fechaEntrada && <p className="error-text">{errors.fechaEntrada}</p>}

          <label>Fecha de Salida:</label>
          <input
            type="date"
            name="fechaSalida"
            value={formData.fechaSalida}
            onChange={handleInputChange}
            onBlur={handleBlur} 
            className={errors.fechaSalida ? "error-input" : ""}
          />
          {errors.fechaSalida && <p className="error-text">{errors.fechaSalida}</p>}

          <label>Tipo de Habitación:</label>
          <select
            name="tipoHabitacion"
            value={formData.tipoHabitacion}
            onChange={handleInputChange}
            onBlur={handleBlur} 
            className={errors.tipoHabitacion ? "error-input" : ""}
          >
            <option value="">Seleccione una opción</option>
            <option value="estandar">Estándar - $1,500 por noche</option>
            <option value="suite">Suite - $2,500 por noche</option>
            <option value="presidencial">Presidencial - $5,000 por noche</option>
          </select>
          {errors.tipoHabitacion && <p className="error-text">{errors.tipoHabitacion}</p>}

          <button className="generate-button" onClick={generarFacturaPDF}>
            Generar Factura
          </button>
          {pdfUrl && (
          <button onClick={activarModalEncuesta}>Dejar Encuesta</button>)}
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

      {modalVisible && (
        <Modal
          title="Error de Validación"
          message={modalMessage}
          onClose={() => setModalVisible(false)}
        />
      )}
    </div>
  );
};

export default CheckIn;