import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar";
import Footer from "../footer";
import "./mantenimiento.css";
import Modal from "../modal"; 
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const MantenimientoPage = () => {
  const [habitaciones, setHabitaciones] = useState([]);
  const [filtro, setFiltro] = useState("todas");
  const [nuevoReporte, setNuevoReporte] = useState({ habitacion: "", descripcion: "" });
  const [errores, setErrores] = useState({ habitacion: false, descripcion: false });
  const [modalMessage, setModalMessage] = useState(null); 

  useEffect(() => {
    fetch("http://localhost:3001/habitaciones")
      .then(response => response.json())
      .then(data => setHabitaciones(data))
      .catch(error => console.error("Error al cargar habitaciones:", error));
  }, []);

  const handleChange = (e) => {
    setNuevoReporte({ ...nuevoReporte, [e.target.name]: e.target.value });
  };


const handleRegistrarReporte = async () => {
  let erroresTemp = { habitacion: false, descripcion: false };

  if (!nuevoReporte.habitacion) erroresTemp.habitacion = true;
  if (!nuevoReporte.descripcion) erroresTemp.descripcion = true;

  setErrores(erroresTemp);

  if (erroresTemp.habitacion || erroresTemp.descripcion) {
    setModalMessage("Ningún campo puede estar vacío");
    return;
  }

  try {
    const response = await fetch(`http://localhost:3001/mantenimiento`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoReporte),
    });

    if (response.ok) {
      setModalMessage(`Mantenimiento registrado en habitación ${nuevoReporte.habitacion}`);

      // 🔹 Vuelve a cargar la lista de habitaciones para reflejar el cambio en la UI
      fetch("http://localhost:3001/habitaciones")
        .then(response => response.json())
        .then(data => setHabitaciones(data))
        .catch(error => console.error("Error al actualizar habitaciones:", error));

      setNuevoReporte({ habitacion: "", descripcion: "" });
      setErrores({ habitacion: false, descripcion: false });
    }
  } catch (error) {
    console.error("Error al registrar mantenimiento:", error);
    setModalMessage("Hubo un error al registrar el mantenimiento. Intenta de nuevo.");
  }
};


  const handleEstadoChange = async (numeroHabitacion, nuevoEstado) => {
    try {
      const response = await fetch(`http://localhost:3001/mantenimiento/${numeroHabitacion}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (response.ok) {
        setModalMessage(`Mantenimiento listo. La habitación ${numeroHabitacion} ahora está disponible.`);
        setHabitaciones(habitaciones.map(h => 
          h.NUMERO_HABITACION === numeroHabitacion ? { ...h, ESTADO: nuevoEstado } : h
        ));
      }
    } catch (error) {
      console.error("Error al actualizar el estado de la habitación:", error);
    }
  };


const generarReporteMantenimiento = async () => {
  try {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    // Obtenemos el nombre del usuario logueado y definimos el área
    const nombreUsuario = localStorage.getItem("nombreUsuario") || "Usuario Desconocido";
    const departamento = "Departamento de Mantenimiento";

    // Cargar el logo (verifica que la ruta sea correcta)
    const logo = new Image();
    logo.src = "/logo.png";

    logo.onload = async () => {
      // 1) Obtener todos los registros de habitaciones mediante el endpoint de mantenimiento
      const res = await fetch("http://localhost:3001/mantenimiento");
      const allData = await res.json();
      // Filtramos solo las habitaciones en mantenimiento
      const mantenimientoData = allData.filter(
        (hab) => hab.ESTADO && hab.ESTADO.toLowerCase() === "mantenimiento"
      );

      if (!mantenimientoData || mantenimientoData.length === 0) {
        alert("No hay habitaciones en mantenimiento disponibles.");
        return;
      }

      // Calcular totales (al filtrar, todas son de mantenimiento)
      const totalHabitaciones = mantenimientoData.length;
      // Opcional: si deseas mostrar un desglose, las demás categorías serán 0
      const totalMantenimiento = totalHabitaciones;
      const totalDisponibles = mantenimientoData.filter(
        (hab) => hab.ESTADO.toLowerCase() === "disponible"
      ).length;
      const totalOcupadas = mantenimientoData.filter(
        (hab) => hab.ESTADO.toLowerCase() === "ocupada"
      ).length;
      const totalLimpieza = mantenimientoData.filter(
        (hab) => hab.ESTADO.toLowerCase() === "limpieza"
      ).length;

      // 2) Configurar la paginación
      let itemsPorPagina = 13;
      let totalPaginas = Math.ceil(mantenimientoData.length / itemsPorPagina);

      for (let pagina = 0; pagina < totalPaginas; pagina++) {
        if (pagina > 0) {
          doc.addPage();
        }

        // 🔹 A) Encabezado e información principal (manteniendo la estructura de los reportes anteriores)
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
        doc.text("Fecha de Reporte:", 20, 40);
        doc.setFont("helvetica", "normal");
        doc.text(fechaReporte, 60, 40);

        doc.setFont("helvetica", "bolditalic");
        doc.text("Hora:", 170, 40);
        doc.setFont("helvetica", "normal");
        doc.text(horaReporte, 183, 40);

        doc.setFont("helvetica", "bolditalic");
        doc.text("Generado por:", 20, 49);
        doc.setFont("helvetica", "normal");
        doc.text(nombreUsuario, 52, 49);

        doc.setFont("helvetica", "bolditalic");
        doc.text("Área:", 20, 58);
        doc.setFont("helvetica", "normal");
        doc.text(departamento, 33, 58);

        // 🔹 Concepto del reporte para mantenimiento
        doc.setFont("helvetica", "bolditalic");
        doc.setFontSize(14);
        doc.text("REPORTE GENERAL DE MANTENIMIENTO", 60, 68);

        // 🔹 B) Items de esta página
        const inicio = pagina * itemsPorPagina;
        const fin = inicio + itemsPorPagina;
        const mantenimientoPagina = mantenimientoData.slice(inicio, fin);

        // 🔹 C) Datos para la tabla (mostrando campos relevantes de la entidad Habitaciones)
        const tablaData = mantenimientoPagina.map((hab) => [
          hab.NUMERO_HABITACION,
          hab.TIPO,
          hab.CAPACIDAD,
          `$${parseFloat(hab.PRECIO_POR_NOCHE).toFixed(2)}`,
          hab.ESTADO,
          hab.DESCRIPCION || "",
          hab.FECHA_REGISTRO ? hab.FECHA_REGISTRO.split("T")[0] : ""
        ]);

        // 🔹 D) Dibujar la tabla
        autoTable(doc, {
          startY: 75,
          head: [
            ["Número", "Tipo", "Capacidad", "Precio/Noche", "Estado", "Descripción", "Fecha Registro"]
          ],
          body: tablaData,
          theme: "grid",
          headStyles: { fillColor: [23, 70, 145] },
          margin: { top: 10 },
        });

        // 🔹 E) Pie de página (paginación)
        doc.setFontSize(10);
        doc.text(`Página ${pagina + 1} de ${totalPaginas}`, 105, 290, { align: "center" });

        // 🔹 F) En la última página, mostrar los totales (solo habitaciones en mantenimiento)
        if (pagina === totalPaginas - 1) {
          const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 75;
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0, 0, 0);
          doc.text(`Total en Mantenimiento: ${totalHabitaciones}`, 140, finalY + 8);
          // Opcional: Si deseas mostrar los otros totales (probablemente 0), se pueden agregar
          //doc.text(`Disponibles: ${totalDisponibles}`, 150, finalY + 16);
          //doc.text(`Ocupadas: ${totalOcupadas}`, 150, finalY + 24);
          //doc.text(`En Limpieza: ${totalLimpieza}`, 150, finalY + 32);
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
      doc.save("Reporte_Mantenimiento_Detallado.pdf");
    };
  } catch (error) {
    console.error("Error al generar el reporte de mantenimiento:", error);
  }
};





  return (
    <div className="mantenimiento-container">
      {modalMessage && <Modal message={modalMessage} onClose={() => setModalMessage(null)} />}
      <Footer title="GESTOR DE MANTENIMIENTO" generarReporte={generarReporteMantenimiento}/>
      <Sidebar />

      <div className="mantenimiento-content">
        {/* Dashboard */}
        <div className="mantenimiento-dashboard">
          <h2>Panel de Mantenimiento</h2>

          <label>Filtrar habitaciones:</label>
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="todas">Todas</option>
            <option value="disponible">Disponibles</option>
            <option value="ocupada">Ocupadas</option>
            <option value="mantenimiento">En Mantenimiento</option>
            <option value="limpieza">En Limpieza</option> 
          </select>
        <div className="mantenimiento-table-container">
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {habitaciones
                .filter(h => filtro === "todas" || h.ESTADO === filtro)
                .map((hab) => (
                  <tr key={hab.NUMERO_HABITACION}>
                    <td>{hab.NUMERO_HABITACION}</td>
                    <td>{hab.ESTADO}</td>
                    <td>
                      {hab.ESTADO === "mantenimiento" && (
                        <button onClick={() => handleEstadoChange(hab.NUMERO_HABITACION, "disponible")}>
                          Marcar como Listo
                        </button>
                      )}
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>

        {/* Registro de Reportes */}
        <div className="mantenimiento-registro ">
          <h3>Registrar Mantenimiento</h3>
          <select name="habitacion" value={nuevoReporte.habitacion} onChange={handleChange} onBlur={() => setErrores({ ...errores, habitacion: !nuevoReporte.habitacion })} className={errores.habitacion ? "input-error" : ""} >
            <option value="">Selecciona una habitación</option>
            {habitaciones.filter(hab => hab.ESTADO !== "mantenimiento").filter(hab => hab.ESTADO !== "ocupada").filter(hab => hab.ESTADO !== "limpieza").map(hab => (
              <option key={hab.NUMERO_HABITACION} value={hab.NUMERO_HABITACION}>
                Habitación {hab.NUMERO_HABITACION}
              </option>
            ))}
          </select>
          {errores.habitacion && <p className="error-text">*Campo obligatorio*</p>} 
          <input
            type="text"
            name="descripcion"
            value={nuevoReporte.descripcion}
            onChange={handleChange}
            onBlur={() => setErrores({ ...errores, descripcion: !nuevoReporte.descripcion })}

            placeholder="Descripción del problema"
            className={errores.descripcion ? "input-error" : ""}
          />
          {errores.descripcion && <p className="error-text">*Campo obligatorio*</p>}
          <button onClick={handleRegistrarReporte}>Registrar</button>
        </div>
      </div>
    </div>
  );
};

export default MantenimientoPage;
