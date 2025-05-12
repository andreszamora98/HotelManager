import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar";
import Footer from "../footer";
import "./habitaciones.css";
import Modal from "../modal"; 
import { FaUpload } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";



const Habitaciones = () => {
  const [formData, setFormData] = useState({
    numero: "",
    tipo: "",
    capacidad: 1,
    precio: "",
    estado: "disponible",
    descripcion: "",
  });

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [tipoHabitacion, setTipoHabitacion] = useState('');
  const [precio, setPrecio] = useState('');

const handleInputChange = (e) => {
  const { name, value } = e.target;

  setFormData((prevFormData) => {
    const updatedFormData = {
      ...prevFormData,
      [name]: value,
      // Si el usuario cambia el tipo de habitación, actualizamos el precio automáticamente
      precio: name === "tipo" ? obtenerPrecioPorTipo(value) : prevFormData.precio,
    };

    return updatedFormData;
  });

  setErrors((prevErrors) => {
    const newErrors = { ...prevErrors };
    if (value.trim() === "") {
      newErrors[name] = "*Campo obligatorio*";
    } else {
      delete newErrors[name];
    }
    return newErrors;
  });
};

// Función para obtener el precio según el tipo de habitación
const obtenerPrecioPorTipo = (tipo) => {
  switch (tipo) {
    case "Estándar":
      return "1500";
    case "Suite":
      return "2500";
    case "Presidencial":
      return "5000";
    default:
      return "";
  }
};


  //Enviar habitación al backend
  const registrarHabitacion = async () => {
    if (!validarFormulario()) {
        setModalMessage("Ningún campo puede estar vacío");
        setModalVisible(true);
        return;
    }

    const data = {
        numero_habitacion: formData.numero,  
        tipo: formData.tipo,
        capacidad: formData.capacidad,
        precio_por_noche: formData.precio,
        estado: formData.estado,
        descripcion: formData.descripcion
    };

    try {
        const response = await fetch("http://localhost:3001/habitaciones", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        setMessage(result.message);
    } catch (error) {
        console.error("Error al registrar habitación:", error);
        setMessage("Error al registrar la habitación.");
    }
};

 const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setMessage("Archivo cargado correctamente. Ahora puedes enviarlo a la BD.");
};
const handleBlur = (e) => {
  const { name, value } = e.target;
  if (value.trim() === '') {
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '*Campo obligatorio*' }));
  }
};


const cargarDatosEnBD = async () => {
    if (!file) {
        setModalMessage("No has seleccionado ningún archivo.");
        setModalVisible(true);
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("http://localhost:3001/habitaciones/carga-masiva", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();

        if (response.ok) {
            if (result.insertados > 0 && result.omitidos === 0) {
                // Validación 1: Se insertaron todos los registros
                setModalMessage(`Carga exitosa: Se insertaron todos los registros. Registros insertados: ${result.insertados}`);
            } else if (result.insertados > 0 && result.omitidos > 0) {
                // Validación 2: Se insertaron algunos registros pero hubo duplicados
                setModalMessage(`Carga exitosa: Se omitieron algunos registros duplicados. Registros insertados: ${result.insertados}`);
            } else if (result.insertados === 0 && result.omitidos > 0) {
                // Validación 3: Todos los registros ya existían
                setModalMessage("Carga fallida: los registros del archivo ya existen en la BD.");
            }
        } else {
            // Validación 4: Otro error en la carga
            setModalMessage("Error en la carga.");
        }

    } catch (error) {
        console.error("Error al cargar datos en la BD:", error);
        setModalMessage("Error en la carga.");
    }

    setModalVisible(true);
};


const validarFormulario = () => {
  let newErrors = {};
  let isValid = true;

  Object.keys(formData).forEach((key) => {
    if (typeof formData[key] === "string" && formData[key].trim() === "") {
      newErrors[key] = "*Campo obligatorio*";
      isValid = false;
    } else if (formData[key] === null || formData[key] === undefined) {
      newErrors[key] = "*Campo obligatorio*";
      isValid = false;
    }
  });

  setErrors(newErrors);
  return isValid;
};



const generarReporteHabitaciones = async () => {
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
      // 1) Obtener la información de habitaciones
      const res = await fetch("http://localhost:3001/habitaciones");
      const habitacionesData = await res.json();

      if (!habitacionesData || habitacionesData.length === 0) {
        alert("No hay datos de habitaciones disponibles.");
        return;
      }

      // Calcular totales globales para cada categoría
      const totalEstandar = habitacionesData.filter(hab => hab.TIPO.toLowerCase() === "estandar").length;
      const totalSuite = habitacionesData.filter(hab => hab.TIPO.toLowerCase() === "suite").length;
      const totalPresidencial = habitacionesData.filter(hab => hab.TIPO.toLowerCase() === "presidencial").length;

      const totalDisponible = habitacionesData.filter(hab => hab.ESTADO.toLowerCase() === "disponible").length;
      const totalOcupada = habitacionesData.filter(hab => hab.ESTADO.toLowerCase() === "ocupada").length;
      const totalMantenimiento = habitacionesData.filter(hab => hab.ESTADO.toLowerCase() === "mantenimiento").length;
      const totalLimpieza = habitacionesData.filter(hab => hab.ESTADO.toLowerCase() === "limpieza").length;

      // 2) Configurar paginación
      let itemsPorPagina = 13;
      let totalPaginas = Math.ceil(habitacionesData.length / itemsPorPagina);
      let totalHabitaciones = 0;

      for (let pagina = 0; pagina < totalPaginas; pagina++) {
        // Agregar nueva página (excepto en la primera)
        if (pagina > 0) {
          doc.addPage();
        }

        // 🔹 A) Encabezado + Info Principal (mismo estilo que en Check-In)
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
        doc.text("REPORTE GENERAL DE HABITACIONES", 55, 68);

        // 🔹 B) Items de esta página
        const inicio = pagina * itemsPorPagina;
        const fin = inicio + itemsPorPagina;
        const habitacionesPagina = habitacionesData.slice(inicio, fin);

        // 🔹 C) Datos para la tabla y actualización del contador de habitaciones
        const tablaData = habitacionesPagina.map((hab) => {
          totalHabitaciones++;
          return [
            hab.NUMERO_HABITACION,
            hab.TIPO,
            hab.CAPACIDAD,
            `$${parseFloat(hab.PRECIO_POR_NOCHE).toFixed(2)}`,
            hab.ESTADO,
            hab.DESCRIPCION || "",
            hab.FECHA_REGISTRO ? hab.FECHA_REGISTRO.split("T")[0] : ""
          ];
        });

        // 🔹 D) Dibujar la tabla
        autoTable(doc, {
          startY: 75,
          head: [["Número", "Tipo", "Capacidad", "Precio/Noche", "Estado", "Descripción", "Fecha Registro"]],
          body: tablaData,
          theme: "grid",
          headStyles: { fillColor: [23, 70, 145] },
          margin: { top: 10 },
        });

        // 🔹 E) Pie de página (paginación)
        doc.setFontSize(10);
        doc.text(`Página ${pagina + 1} de ${totalPaginas}`, 105, 290, { align: "center" });

        // 🔹 F) Si es la última página, agregar totales debajo de la tabla
        if (pagina === totalPaginas - 1) {
          const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 75;
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0, 0, 0);

          // Total de habitaciones
          doc.text(`Total de Habitaciones: ${totalHabitaciones}`, 15, finalY + 8);
          // Totales por tipo
          doc.text(`Total Estandar: ${totalEstandar}`,15, finalY + 16);
          doc.text(`Total Suite: ${totalSuite}`, 15, finalY + 24);
          doc.text(`Total Presidencial: ${totalPresidencial}`, 15, finalY + 32);
          // Totales por estado
          doc.text(`Total Disponible: ${totalDisponible}`, 15, finalY + 40);
          doc.text(`Total Ocupada: ${totalOcupada}`, 15, finalY + 48);
          doc.text(`Total Mantenimiento: ${totalMantenimiento}`, 15, finalY + 56);
          doc.text(`Total Limpieza: ${totalLimpieza}`, 15, finalY + 64);
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
        doc.text("Sin validez", 140, 200, { angle: 45, align: "center" });
        doc.restoreGraphicsState();
      }

      // 🔹 H) Descargar PDF
      doc.save("Reporte_Habitaciones_Detallado.pdf");
    };
  } catch (error) {
    console.error("Error al generar el reporte de habitaciones:", error);
  }
};





  return (
  <div className="habitaciones-container">
    <Footer title="GESTOR DE HABITACIONES" generarReporte={generarReporteHabitaciones} />
    <Sidebar />

    <div className="habitaciones-content">
      <div className="form-container">
        <h2 className="title">REGISTRO DE HABITACIÓN</h2>

        <label>Número:</label>
        <input
          type="text"
          name="numero"
          value={formData.numero}
          onChange={handleInputChange}
          onBlur={handleBlur} 
          className={errors.numero ? "error-input" : ""}
        />
        {errors.numero && <p className="error-text">{errors.numero}</p>}

        <label>Tipo:</label>
        <select
          name="tipo"
          value={formData.tipo}
          onChange={handleInputChange} 
          onBlur={handleBlur} 
          className={errors.tipo ? "error-input" : ""}
        >
          <option value="">Seleccione un tipo</option>
          <option value="Estándar">Estándar</option>
          <option value="Suite">Suite</option>
          <option value="Presidencial">Presidencial</option>
        </select>
        {errors.tipo && <p className="error-text">{errors.tipo}</p>}

        <label>Capacidad:</label>
        <input
          type="number"
          name="capacidad"
          min="1"
          value={formData.capacidad}
          onChange={handleInputChange}
          onBlur={handleBlur} 
          className={errors.capacidad ? "error-input" : ""}
        />
        {errors.capacidad && <p className="error-text">{errors.capacidad}</p>}

        <label>Precio por Noche:</label>
        <input
          type="text"
          name="precio"
          value={formData.precio}
          readOnly 
          className={errors.precio ? "error-input" : ""}
        />
        {errors.precio && <p className="error-text">{errors.precio}</p>}

        <label>Estado:</label>
        <select
          name="estado"
          value={formData.estado}
          onChange={handleInputChange}
          onBlur={handleBlur} 
          className={errors.estado ? "error-input" : ""}
        >
          <option value="Disponible">Disponible</option>
          <option value="Ocupada">Ocupada</option>
          <option value="Mantenimiento">Mantenimiento</option>
          <option value="Limpieza">En Limpieza</option> 
        </select>
        {errors.estado && <p className="error-text">{errors.estado}</p>}

        <label>Descripción:</label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleInputChange}
          onBlur={handleBlur} 
          className={errors.descripcion ? "error-input" : ""}
        ></textarea>
        {errors.descripcion && <p className="error-text">{errors.descripcion}</p>}

        <button onClick={registrarHabitacion}>Registrar Habitación</button>
      </div>

      {/*Panel Derecho: Carga Masiva */}
      <div className="upload-container">
        <h2>Carga Masiva de Habitaciones</h2>

        {/*Botón con ícono de carga */}
        <label htmlFor="file-upload" className="custom-file-upload">
          <FaUpload className="upload-icon" />
          <span> Subir Archivo</span>
        </label>
        <input id="file-upload" type="file" accept=".csv" onChange={handleFileUpload} style={{ display: "none" }} />

        {/*Mostrar el nombre del archivo seleccionado */}
        {file && <p className="file-name">📄 {file.name}</p>}

        {/*Botón para cargar el archivo a la BD */}
        {file && (
          <button className="load-db-button" onClick={cargarDatosEnBD}>
            Cargar a la BD
          </button>
        )}
      </div>
      {/*Tabla de habitaciones */}
       {/* <div className="table-containerr">
          <h2>Habitaciones Registradas</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Número</th>
                <th>Tipo</th>
                <th>Capacidad</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {habitaciones.map((hab) => (
                <tr key={hab.ID_HABITACION}>
                  <td>{hab.ID_HABITACION}</td>
                  <td>{hab.NUMERO_HABITACION}</td>
                  <td>{hab.TIPO}</td>
                  <td>{hab.CAPACIDAD}</td>
                  <td>${hab.PRECIO_POR_NOCHE}</td>
                  <td>{hab.ESTADO}</td>
                  <td>
                    <button onClick={() => eliminarHabitacion(hab.ID_HABITACION)} className="delete-button">
                      <FaTrash /> Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>*/}
    </div>

    {message && <p className="message">{message}</p>}

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

export default Habitaciones;

