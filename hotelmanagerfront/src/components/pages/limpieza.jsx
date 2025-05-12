import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar";
import Footer from "../footer";
import "./limpieza.css";
import Modal from "../modal"; 
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const LimpiezaPage = () => {
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

  const handleMarcarLimpieza = async (numeroHabitacion) => {
    try {
      const response = await fetch(`http://localhost:3001/habitaciones/${numeroHabitacion}/en-limpieza`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        setModalMessage(`La habitación ${numeroHabitacion} ahora está en limpieza.`);
        setHabitaciones(habitaciones.map(h => 
          h.NUMERO_HABITACION === numeroHabitacion ? { ...h, ESTADO: "limpieza" } : h
        ));
      }
    } catch (error) {
      console.error("Error al actualizar el estado de la habitación:", error);
      setModalMessage("Error al cambiar el estado. Intenta de nuevo.");
    }
  };


const handleEstadoChange = async (numeroHabitacion, nuevoEstado) => {
    try {
      const response = await fetch(`http://localhost:3001/habitaciones/${numeroHabitacion}/limpiar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        setModalMessage(`Mantenimiento listo. La habitación ${numeroHabitacion} ahora está disponible.`);
        setHabitaciones(habitaciones.map(h => 
          h.NUMERO_HABITACION === numeroHabitacion ? { ...h, ESTADO: "disponible" } : h
        ));
      }
    } catch (error) {
      console.error("Error al actualizar el estado de la habitación:", error);
      setModalMessage("Error al actualizar el estado. Intenta de nuevo.");
    }
  };


  const handleRegistrarReporte = async () => {
    const nuevosErrores = {
        habitacion: !nuevoReporte.habitacion,
        descripcion: !nuevoReporte.descripcion,
    };

    setErrores(nuevosErrores);

    if (nuevosErrores.habitacion || nuevosErrores.descripcion) {
        setModalMessage("Ningún campo puede estar vacío");
        return;
    }

    try {
        const response = await fetch("http://localhost:3001/limpieza", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoReporte),
        });

        if (response.ok) {
            setModalMessage(`Incidencia registrada. La habitación ${nuevoReporte.habitacion} ahora está en limpieza.`);
            // 🔄 Volver a obtener la lista de habitaciones para actualizar la tabla
            fetch("http://localhost:3001/habitaciones")
                .then(response => response.json())
                .then(data => setHabitaciones(data))
                .catch(error => console.error("Error al actualizar habitaciones:", error));

            setNuevoReporte({ habitacion: "", descripcion: "" });
        }
    } catch (error) {
        console.error("Error al registrar incidencia:", error);
        setModalMessage("Error al registrar incidencia. Intenta de nuevo.");
    }
};


const generarReporteLimpieza = async () => {
  try {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    // Suponemos que el usuario logueado y el área se obtienen de localStorage:
    const nombreUsuario = localStorage.getItem("nombreUsuario") || "Usuario Desconocido";
    // Para la sección de limpieza, el área será "Departamento de Limpieza"
    const departamento = "Departamento de Limpieza";

    // Carga el logo (asegúrate que la ruta sea correcta)
    const logo = new Image();
    logo.src = "/logo.png";

    logo.onload = async () => {
      // 1) Obtener los registros de limpieza desde el backend.
      // Se asume que existe un endpoint que retorna los registros de la tabla Limpieza.
      const res = await fetch("http://localhost:3001/limpieza/reporte");
      const limpiezaData = await res.json();

      if (!limpiezaData || limpiezaData.length === 0) {
        alert("No hay datos de limpieza disponibles.");
        return;
      }

      // Calcular totales globales para el reporte
      const totalIncidencias = limpiezaData.length;
      const totalLimpieza = limpiezaData.filter(r => r.ESTADO.toLowerCase() === "limpieza").length;
      const totalDisponible = limpiezaData.filter(r => r.ESTADO.toLowerCase() === "disponible").length;
      const totalOcupada = limpiezaData.filter(r => r.ESTADO.toLowerCase() === "ocupada").length;

      // 2) Configurar paginación
      let itemsPorPagina = 13;
      let totalPaginas = Math.ceil(limpiezaData.length / itemsPorPagina);

      for (let pagina = 0; pagina < totalPaginas; pagina++) {
        // Agregar nueva página (excepto en la primera)
        if (pagina > 0) {
          doc.addPage();
        }

        // 🔹 A) Encabezado + Info Principal (mismo estilo y posiciones que en los otros reportes)
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
        doc.text("Hora: ", 170, 40);
        doc.setFont("helvetica", "normal");
        doc.text(horaReporte, 183, 40);

        doc.setFont("helvetica", "bolditalic");
        doc.text("Generado por: ", 20, 49);
        doc.setFont("helvetica", "normal");
        doc.text(nombreUsuario, 52, 49);

        doc.setFont("helvetica", "bolditalic");
        doc.text("Área:", 20, 58);
        doc.setFont("helvetica", "normal");
        doc.text(departamento, 33, 58);

        // Aquí definimos el concepto del reporte para limpieza:
        doc.setFont("helvetica", "bolditalic");
        doc.setFontSize(14);
        doc.text("REPORTE DE LIMPIEZA: REGISTRO DE INCIDENCIAS", 45, 68);

        // 🔹 B) Items de esta página
        const inicio = pagina * itemsPorPagina;
        const fin = inicio + itemsPorPagina;
        const limpiezaPagina = limpiezaData.slice(inicio, fin);

        // 🔹 C) Datos para la tabla
        const tablaData = limpiezaPagina.map((row) => [
          row.NUMERO_HABITACION,
          row.ESTADO,
          row.DESCRIPCION || "",
          row.FECHA_REGISTRO ? row.FECHA_REGISTRO.split("T")[0] : ""
        ]);

        // 🔹 D) Dibujar la tabla con autoTable
        autoTable(doc, {
          startY: 75,
          head: [["Número", "Estado", "Descripción", "Fecha Registro"]],
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
          doc.text(`Total de Incidencias: ${totalIncidencias}`, 150, finalY + 8);
          doc.text(`Limpieza: ${totalLimpieza}`, 150, finalY + 16);
          doc.text(`Disponible: ${totalDisponible}`, 150, finalY + 24);
          doc.text(`Ocupada: ${totalOcupada}`, 150, finalY + 32);
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
      doc.save("Reporte_Limpieza_Detallado.pdf");
    };
  } catch (error) {
    console.error("Error al generar el reporte de limpieza:", error);
  }
};


 
return (
    <div className="limpieza-container">
      {modalMessage && <Modal message={modalMessage} onClose={() => setModalMessage(null)} />}
      <Footer title="GESTOR DE LIMPIEZA" generarReporte={generarReporteLimpieza}/>
      <Sidebar />
      <div className="limpieza-content">
        {/* Dashboard */}
        <div className="limpieza-dashboard-panel">
          <h2>Panel de Limpieza</h2>
          <label>Filtrar habitaciones:</label>
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="todas">Todas</option>
            <option value="disponible">Disponibles</option>
            <option value="ocupada">Ocupadas</option>
            <option value="limpieza">En Limpieza</option>
          </select>

          <div className="limpieza-table-container">
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
                        {hab.ESTADO === "disponible" && (
                          <button onClick={() =>handleMarcarLimpieza(hab.NUMERO_HABITACION)}>
                            Enviar a Limpieza
                          </button>
                        )}
                        {hab.ESTADO === "limpieza" && (
                          <button onClick={() => handleEstadoChange(hab.NUMERO_HABITACION)}>
                            Marcar como Lista
                          </button>
                        )}
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Registro de Incidencias */}
        <div className="limpieza-registro">
          <h3>Registrar Incidencia</h3>
          <select 
          name="habitacion" 
          value={nuevoReporte.habitacion} 
          onChange={handleChange} 
          onBlur={() => setErrores({ ...errores, habitacion: !nuevoReporte.habitacion })}
            className={errores.habitacion ? "input-error" : ""}>
            <option value="">Selecciona una habitación</option>
            {habitaciones
            .filter(h => h.ESTADO === "disponible")
            .map(hab => (
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

export default LimpiezaPage;
