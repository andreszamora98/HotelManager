import React, { useState, useEffect } from 'react';
import './dashboard.css';
import Sidebar from './sidebar';
import logo from './logo.png'
import Footer from './footer'
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FaSearch, FaUserCircle, FaChartBar, FaTimes } from "react-icons/fa";

const Dashboard = () => {

  const [selectedOption, setSelectedOption] = useState("inicio");

  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('CORREO'); // Filtro por defecto
  const [busqueda, setBusqueda] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [errors, setErrors] = useState({}); // Estado para los errores

  const [botonActivo, setBotonActivo] = useState(null); // null, 'inactivos' o 'todos'

  const [formData, setFormData] = useState({
    CORREO: '',
    NOMBRE_CLIENTE: '',
    RFC: '',
    DIRECCION: '',
    CONTRASEÑA: '',
    PERFIL: '',
    ESTATUS: '',
    ALTA_REG: ''
  });

  const [modalMensaje, setModalMensaje] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isFormFilled, setIsFormFilled] = useState(false);
  const [modalReporteSeleccionVisible, setModalReporteSeleccionVisible] = useState(false);
  const [modalFadeOut, setModalFadeOut] = useState(false);
  

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const handleModalBackdropClick = () => {
    setModalFadeOut(true);
    setTimeout(() => {
      setModalReporteSeleccionVisible(false);
      setModalFadeOut(false);
    }, 500); // 500ms para que coincida con la transición CSS
  };

  const mostrarModal = (mensaje) => {
  setModalMensaje(mensaje);
  setModalVisible(true);

  // Esperar más tiempo para que la animación de salida se complete
  setTimeout(() => {
    setModalVisible(false);
  }, 1500); // Ajustado para coincidir con la animación
};


  const obtenerUsuarios = async () => {
    try {
        const response = await fetch('http://localhost:3001/users/');
        if (!response.ok) {
            throw new Error('Error obteniendo usuarios');
        }
        let data = await response.json();
        setUsuarios(data);
    } catch (error) {
        console.error('Error:', error);
    }
};

const validateFields = () => {
  const newErrors = {};
  if (!formData.CORREO.trim()) newErrors.CORREO = '*Campo obligatorio*';
  if (!formData.NOMBRE_CLIENTE.trim()) newErrors.NOMBRE_CLIENTE = '*Campo obligatorio*';
  if (!formData.RFC.trim()) newErrors.RFC = '*Campo obligatorio*';
  if (!formData.DIRECCION.trim()) newErrors.DIRECCION = '*Campo obligatorio*';
  if (!formData.CONTRASEÑA.trim()) newErrors.CONTRASEÑA = '*Campo obligatorio*';
  if (!formData.PERFIL) newErrors.PERFIL = '*Campo obligatorio*';
  if (!formData.ESTATUS) newErrors.ESTATUS = '*Campo obligatorio*';

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
const checkFormFilled = (updatedFormData) => {
    const isFilled = Object.values(updatedFormData).some(value => value.trim() !== '');
    setIsFormFilled(isFilled);
};

const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData({ ...formData, [name]: value });

  // Si el usuario empieza a escribir, eliminar el error
  if (value.trim() !== '') {
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  }
};


// Validar si el campo está vacío cuando el usuario sale del input
const handleBlur = (e) => {
  const { name, value } = e.target;
  if (value.trim() === '') {
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '*Campo obligatorio*' }));
  }
};

const handleEliminar = async (correo) => {
  try {
    const response = await fetch(`http://localhost:3001/users/${correo}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    console.log('Respuesta del servidor:', data);
    if (!response.ok) {
      throw new Error(data.error || 'Error al deshabilitar el usuario');
    }
    mostrarModal('Usuario deshabilitado correctamente');
    obtenerUsuarios();
  } catch (error) {
    console.error('Error al deshabilitar usuario:', error);
    mostrarModal('Error al deshabilitar el usuario');
  }
};


  const handleSeleccionarUsuario = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setFormData({
        CORREO: usuario?.CORREO || '',
        CONTRASEÑA: '',
        PERFIL: usuario?.PERFIL || '',
        ESTATUS: usuario?.ESTATUS || '',
        ALTA_REG: usuario?.ALTA_REG || ''
    });
};

const validarCorreo = async () => {
    try {
        const response = await fetch(`http://localhost:3001/users/validar/${encodeURIComponent(formData.CORREO)}`);

        if (!response.ok) {
            throw new Error(`Error en validación: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("🔎 Respuesta de validación:", data);
        return data.correoExiste;
    } catch (error) {
        console.error("❌ Error al validar correo:", error);
        return false;
    }
};

const handleRegistrar = async () => {
    if (!validateFields()) {
        mostrarModal('Ningún campo puede estar vacío');
        return;
    }

    const correoRepetido = await validarCorreo();
    if (correoRepetido) {
        mostrarModal('Correo repetido');
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/users/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                correo: formData.CORREO,
                nombre_cliente: formData.NOMBRE_CLIENTE, // ✅ Agregar nombre
                rfc: formData.RFC, // ✅ Agregar RFC
                direccion: formData.DIRECCION, // ✅ Agregar dirección
                contraseña: formData.CONTRASEÑA,
                perfil: formData.PERFIL,
                estatus: formData.ESTATUS
            }),
        });

        const data = await response.json();
        console.log(' Respuesta del servidor:', data);

        if (!response.ok) {
            throw new Error(`Error: ${data.error}`);
        }

        obtenerUsuarios();
        setFormData({ 
            CORREO: '', 
            NOMBRE_CLIENTE: '', 
            RFC: '', 
            DIRECCION: '', 
            CONTRASEÑA: '', 
            PERFIL: '', 
            ESTATUS: '' 
        });
        setErrors({}); // Limpiar errores después del registro exitoso
        mostrarModal('Usuario registrado exitosamente');

    } catch (error) {
        mostrarModal('Error de formato en algún campo');
        console.error(" Error al registrar usuario:", error);
    }
};



const handleActualizar = async () => {
    if (!usuarioSeleccionado) return;

    if (!validateFields()) {
        mostrarModal('Ningún campo puede estar vacío');
        return;
    }

    console.log('Datos enviados para actualización:', formData);

    try {
        const response = await fetch(`http://localhost:3001/users/${usuarioSeleccionado.CORREO}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                correoNuevo: formData.CORREO,  // Nuevo campo
                contraseña: formData.CONTRASEÑA,
                perfil: formData.PERFIL,
                estatus: formData.ESTATUS
            }),
        });

        const data = await response.json();
        console.log('Respuesta del servidor:', data);

        if (!response.ok) {
            throw new Error(data.error || 'Error en la actualización');
        }

        obtenerUsuarios();  // Recargar la lista de usuarios actualizada
        setUsuarioSeleccionado(null);
        setFormData({ CORREO: '', CONTRASEÑA: '', PERFIL: '', ESTATUS: '', ALTA_REG: '' });
        setErrors({}); // Limpiar errores después de la actualización exitosa
        mostrarModal('Usuario actualizado exitosamente');

    } catch (error) {
        if (error.message.includes('correo')) {
            mostrarModal('El correo ya está en uso');
        } else {
            mostrarModal('Error de formato en algún campo');
        }
        console.error('Error al actualizar usuario:', error);
    }
};

const handleHabilitar = async (correo) => {
  try {
    const response = await fetch(`http://localhost:3001/users/habilitar/${correo}`, {
      method: 'PUT',
    });

    const data = await response.json();
    console.log('Respuesta del servidor:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Error al habilitar el usuario');
    }

    obtenerUsuarios(); // Recargar la lista de usuarios
    mostrarModal('Usuario habilitado exitosamente');
  } catch (error) {
    console.error('Error al habilitar usuario:', error);
    mostrarModal('Error al habilitar el usuario');
  }
};

  

const handleEliminarDesdeFormulario = async () => {
  try {
    if (usuarioSeleccionado) {
      await handleEliminar(usuarioSeleccionado.CORREO); // Llama a handleEliminar
      mostrarModal('Usuario deshabilitado correctamente'); // Muestra el modal
    }
  } catch (error) {
    console.error('Error al deshabilitar usuario:', error);
    mostrarModal('Error al deshabilitar el usuario');
  } finally {
    // Limpiar el formulario y deseleccionar el usuario
    setUsuarioSeleccionado(null);
    setFormData({ CORREO: '', CONTRASEÑA: '', PERFIL: '', ESTATUS: '', ALTA_REG: '' });
  }
};

const handleLimpiarFormulario = () => {
    setFormData({ 
        CORREO: '', 
        NOMBRE_CLIENTE: '', 
        RFC: '', 
        DIRECCION: '', 
        CONTRASEÑA: '', 
        PERFIL: '', 
        ESTATUS: '', 
        ALTA_REG: '' 
    });
    setUsuarioSeleccionado(null);
};

  const usuariosFiltrados = usuarios
  .filter(user => {
    if (mostrarTodos) {
      return true; // Mostrar todos los usuarios
    } else if (mostrarInactivos) {
      return user.ESTATUS === '2'; // Mostrar solo inactivos
    } else {
      return user.ESTATUS === '1'; // Mostrar solo activos
    }
  })
  .filter(user => user?.[filtro]?.toString().toLowerCase().includes(busqueda.toLowerCase()));

  

const generarReporteUsuarios = async () => {
  try {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    // Obtener el usuario y perfil para mostrar quién genera el reporte y desde qué área
    const nombreUsuario = localStorage.getItem("nombreUsuario") || "Usuario Desconocido";
    const perfilUsuario = localStorage.getItem("perfil");
    // Si sólo el Administrador (A) puede generar este reporte, asumimos:
    const departamento = "Departamento de Administración";

    // Cargar el logo (asegúrate de que la ruta sea correcta)
    const logo = new Image();
    logo.src = "/logo.png";

    logo.onload = async () => {
      // 1) Obtener la información de los usuarios
      const res = await fetch("http://localhost:3001/users/");
      const usuariosData = await res.json();

      if (!usuariosData || usuariosData.length === 0) {
        alert("No hay datos de usuarios disponibles.");
        return;
      }

      // 🔹 A) Calcular totales globales (opcional)
      const totalUsuarios = usuariosData.length;
      const totalPerfilA = usuariosData.filter(u => u.PERFIL === "A").length;
      const totalPerfilB = usuariosData.filter(u => u.PERFIL === "B").length;
      const totalPerfilC = usuariosData.filter(u => u.PERFIL === "C").length;
      const totalPerfilD = usuariosData.filter(u => u.PERFIL === "D").length;
      const totalActivos = usuariosData.filter(u => u.ESTATUS === "1").length;
      const totalInactivos = usuariosData.filter(u => u.ESTATUS === "2").length;

      // 2) Configurar paginación
      let itemsPorPagina = 13;
      let totalPaginas = Math.ceil(usuariosData.length / itemsPorPagina);

      // Contador interno para saber cuántos usuarios se van imprimiendo (si lo necesitas).
      // let conteoImpresos = 0;

      for (let pagina = 0; pagina < totalPaginas; pagina++) {
        // Agregar nueva página (excepto en la primera)
        if (pagina > 0) {
          doc.addPage();
        }

        // 🔹 B) Encabezado + Info Principal (idéntico a Check-In / Habitaciones)
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

        doc.setFont("helvetica", "bolditalic");
        doc.setFontSize(14);
        doc.text("REPORTE GENERAL DE USUARIOS", 60, 68);

        // 🔹 C) Items de esta página
        const inicio = pagina * itemsPorPagina;
        const fin = inicio + itemsPorPagina;
        const usuariosPagina = usuariosData.slice(inicio, fin);

        // 🔹 D) Datos para la tabla
        const tablaData = usuariosPagina.map((u) => [
          u.CORREO,
          u.NOMBRE_CLIENTE,
          u.RFC,
          u.DIRECCION,
          u.PERFIL,
          u.ESTATUS,
          // Formato simple para la fecha de registro (si viene en forma "YYYY-MM-DDTHH:MM:SS")
          u.ALTA_REG ? u.ALTA_REG.split("T")[0] : "",
        ]);

        // 🔹 E) Dibujar la tabla
        autoTable(doc, {
          startY: 75,
          head: [["Correo", "Nombre", "RFC", "Dirección", "Perfil", "Estatus", "Fecha Registro"]],
          body: tablaData,
          theme: "grid",
          headStyles: { fillColor: [23, 70, 145] },
          margin: { top: 10 },
        });

        // 🔹 F) Pie de página (paginación)
        doc.setFontSize(10);
        doc.text(`Página ${pagina + 1} de ${totalPaginas}`, 105, 290, { align: "center" });

        // 🔹 G) Si es la última página, agregar totales debajo de la tabla
        if (pagina === totalPaginas - 1) {
          const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 75;
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0, 0, 0);

          // Total de usuarios
          doc.text(`Total de Usuarios: ${totalUsuarios}`, 130, finalY + 8);
          // Totales por perfil (opcional)
          doc.text(`Perfil A: ${totalPerfilA}`, 130, finalY + 16);
          doc.text(`Perfil B: ${totalPerfilB}`, 160, finalY + 16);
          doc.text(`Perfil C: ${totalPerfilC}`, 130, finalY + 23);
          doc.text(`Perfil D: ${totalPerfilD}`, 160, finalY + 23);
          // Totales por estatus (opcional)
          doc.text(`Activos: ${totalActivos}`, 130, finalY + 30);
          doc.text(`Inactivos: ${totalInactivos}`, 160, finalY + 30);
        }
      }

      // 🔹 H) Marca de agua en todas las páginas
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

      // 🔹 I) Descargar PDF
      doc.save("Reporte_Usuarios.pdf");
    };
  } catch (error) {
    console.error("Error al generar el reporte de usuarios:", error);
  }
};
  

const generarReporteGeneral = async () => {
  try {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const nombreUsuario = localStorage.getItem("nombreUsuario") || "Usuario Desconocido";
    const departamento = "Departamento de Administración";

    const logo = new Image();
    logo.src = "/logo.png";

    logo.onload = async () => {
      // 1) OBTENER STATS ANTES DE USARLOS
      const res = await fetch("http://localhost:3001/reportes/estadisticas-generales");
      const stats = await res.json();

      // 2) AHORA SÍ: HACER TODO EL DIBUJO, usando `stats`
      // --- Encabezado ---
      doc.setFillColor(200, 230, 255);
      doc.rect(0, 0, 210, 30, "F");
      doc.addImage(logo, "PNG", 15, 1, 28, 28);

      doc.setFontSize(16);
      doc.setFont("times", "bolditalic");
      doc.setTextColor(0, 22, 100);
      doc.text("''Tu comodidad, nuestra prioridad''", 115, 20);

      // Datos de fecha y usuario
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

      // --- Título principal ---
      doc.setFont("helvetica", "bolditalic");
      doc.setFontSize(14);
      doc.text("REPORTE GENERAL DEL SISTEMA", 60, 73);

      // --- Descripción y Estadísticas Globales ---
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      let y = 80;

      // Descripción
      doc.text("Este reporte integra estadísticas de todas las áreas del sistema,", 20, y);
      doc.text("permitiendo visualizar el desempeño de Usuarios, Habitaciones, Check-in,", 20, y + 5);
      doc.text("Mantenimiento y Limpieza. Se incluyen gráficas de barras con porcentajes", 20, y + 10);
      doc.text("para cada uno de los desgloses solicitados.", 20, y + 15);
      y += 25;

      // Estadísticas Globales (en negrita las etiquetas)
      doc.setFont("helvetica", "bold");
      doc.text("ESTADÍSTICAS GLOBALES:", 20, y);
      y += 5;

      doc.text("Usuarios:", 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(`${stats.usuarios.total} (Activos: ${stats.usuarios.activos}; Inactivos: ${stats.usuarios.inactivos})`, 40, y);
      y += 5;

      doc.setFont("helvetica", "bold");
      doc.text("Habitaciones:", 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(
        `${stats.habitaciones.total} (Disponibles: ${stats.habitaciones.disponibles}; Ocupadas: ${stats.habitaciones.ocupadas}; Mantenimiento: ${stats.habitaciones.mantenimiento}; Limpieza: ${stats.habitaciones.limpieza})`,
        50,
        y
      );
      y += 5;

      doc.setFont("helvetica", "bold");
      doc.text("Check-ins:", 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(`${stats.checkins.totalEstancias} estancias, $${stats.checkins.totalFacturado}`, 43, y);
      y += 5;

      doc.setFont("helvetica", "bold");
      doc.text("Mantenimiento:", 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(`${stats.mantenimiento.totalReportes} reportes`, 53, y);
      y += 5;

      doc.setFont("helvetica", "bold");
      doc.text("Limpieza:", 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(`${stats.limpieza.totalIncidencias} incidencias`, 43, y);

      let currentY = y + 15;

      // Helper de paginación
      function checkAddPage(doc, currentY, neededSpace) {
        const pageHeight = doc.internal.pageSize.getHeight();
        const bottomMargin = 20;
        if (currentY + neededSpace > pageHeight - bottomMargin) {
          doc.addPage();
          return 30;
        }
        return currentY;
      }

      // Función para dibujar gráficas con recuadro
      async function drawChartWithBox({ doc, startX, startY, title, data, barMaxHeight }) {
        let minX = Infinity,
          minY = Infinity;
        let maxX = 0,
          maxY = 0;
        const TITLE_OFFSET = 10;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(title, startX, startY + TITLE_OFFSET);

        function updateBounds(x, y) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
        const titleWidth = doc.getTextWidth(title);
        updateBounds(startX, startY + TITLE_OFFSET);
        updateBounds(startX + titleWidth, startY + TITLE_OFFSET);

        let barsStartY = startY + TITLE_OFFSET + 8;
        let barX = startX + 5;
        const barWidth = 20;
        const gapBar = 15;
        const baseY = barsStartY + barMaxHeight;

        data.forEach((item) => {
          const valor = parseFloat(item.value) || 0;
          const altura = barMaxHeight * (valor / 100);

          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.2);
          doc.setFillColor(...item.color);
          doc.rect(barX, baseY - altura, barWidth, altura, "FD");

          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.text(item.label, barX + barWidth / 2, baseY + 5, { align: "center" });
          // Modificación: si existe 'raw' se muestra ese valor, de lo contrario se muestra el porcentaje
          doc.text(item.raw !== undefined ? `${item.raw}` : `${valor}%`, barX + barWidth / 2, baseY - altura - 2, { align: "center" });

          updateBounds(barX, baseY - altura);
          updateBounds(barX + barWidth, baseY + 5);
          barX += barWidth + gapBar;
        });

        const MARGIN = 3;
        minX -= MARGIN;
        minY -= MARGIN;
        maxX += MARGIN;
        maxY += MARGIN;

        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.3 }));
        doc.setFillColor(255, 255, 153);
        doc.rect(minX, minY, maxX - minX, maxY - minY, "F");
        doc.restoreGraphicsState();

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.rect(minX, minY, maxX - minX, maxY - minY, "D");

        return maxY + 10;
      }

      // 1) Usuarios Activos vs Inactivos
      currentY = checkAddPage(doc, currentY, 40);
      const totalUsuarios = stats.usuarios.total || 0;
      const percentActivos = totalUsuarios ? ((stats.usuarios.activos / totalUsuarios) * 100).toFixed(1) : 0;
      const percentInactivos = totalUsuarios ? ((stats.usuarios.inactivos / totalUsuarios) * 100).toFixed(1) : 0;
      const dataActivosInactivos = [
        { label: "Activos", value: percentActivos, color: [46, 204, 113] },
        { label: "Inactivos", value: percentInactivos, color: [231, 76, 60] },
      ];
      currentY = await drawChartWithBox({
        doc,
        startX: 20,
        startY: currentY,
        title: "Usuarios Activos vs Inactivos (%)",
        data: dataActivosInactivos,
        barMaxHeight: 30,
      });

      // 2) Usuarios por Perfil
      currentY = checkAddPage(doc, currentY, 40);
      const percentA = totalUsuarios ? ((stats.usuarios.perfilA / totalUsuarios) * 100).toFixed(1) : 0;
      const percentB = totalUsuarios ? ((stats.usuarios.perfilB / totalUsuarios) * 100).toFixed(1) : 0;
      const percentC = totalUsuarios ? ((stats.usuarios.perfilC / totalUsuarios) * 100).toFixed(1) : 0;
      const percentD = totalUsuarios ? ((stats.usuarios.perfilD / totalUsuarios) * 100).toFixed(1) : 0;
      const dataPerfiles = [
        { label: "A", value: percentA, color: [52, 152, 219] },
        { label: "B", value: percentB, color: [155, 89, 182] },
        { label: "C", value: percentC, color: [241, 196, 15] },
        { label: "D", value: percentD, color: [230, 126, 34] },
      ];
      currentY = await drawChartWithBox({
        doc,
        startX: 20,
        startY: currentY,
        title: "Usuarios por Perfil (%)",
        data: dataPerfiles,
        barMaxHeight: 30,
      });

      // 3) Habitaciones: Estados
      currentY = checkAddPage(doc, currentY, 40);
      const totalHab = stats.habitaciones.total || 0;
      const perDisp = totalHab ? ((stats.habitaciones.disponibles / totalHab) * 100).toFixed(1) : 0;
      const perOc = totalHab ? ((stats.habitaciones.ocupadas / totalHab) * 100).toFixed(1) : 0;
      const perMant = totalHab ? ((stats.habitaciones.mantenimiento / totalHab) * 100).toFixed(1) : 0;
      const perLimp = totalHab ? ((stats.habitaciones.limpieza / totalHab) * 100).toFixed(1) : 0;
      const dataHabEstados = [
        { label: "Disponibles", value: perDisp, color: [46, 204, 113] },
        { label: "Ocupadas", value: perOc, color: [231, 76, 60] },
        { label: "Mantenimiento", value: perMant, color: [241, 196, 15] },
        { label: "Limpieza", value: perLimp, color: [155, 89, 182] },
      ];
      currentY = await drawChartWithBox({
        doc,
        startX: 20,
        startY: currentY,
        title: "Habitaciones: Estados (%)",
        data: dataHabEstados,
        barMaxHeight: 30,
      });

      // 4) Habitaciones: Tipos
      currentY = checkAddPage(doc, currentY, 40);
      const perPres = totalHab ? ((stats.habitaciones.presidencial / totalHab) * 100).toFixed(1) : 0;
      const perSuite = totalHab ? ((stats.habitaciones.suite / totalHab) * 100).toFixed(1) : 0;
      const perEst = totalHab ? ((stats.habitaciones.estandar / totalHab) * 100).toFixed(1) : 0;
      const dataHabTipos = [
        { label: "Presidencial", value: perPres, color: [0, 128, 255] },
        { label: "Suite", value: perSuite, color: [255, 128, 0] },
        { label: "Estandar", value: perEst, color: [128, 0, 128] },
      ];
      currentY = await drawChartWithBox({
        doc,
        startX: 20,
        startY: currentY,
        title: "Habitaciones: Tipos (%)",
        data: dataHabTipos,
        barMaxHeight: 30,
      });

      // 5) Comparativo de Áreas
      currentY = checkAddPage(doc, currentY, 40);
      const areas = [
        { label: "Usuarios", value: stats.usuarios.total, color: [52, 152, 219] },
        { label: "Habitaciones", value: stats.habitaciones.total, color: [46, 204, 113] },
        { label: "Check-ins", value: stats.checkins.totalEstancias, color: [155, 89, 182] },
        { label: "Mantenimiento", value: stats.mantenimiento.totalReportes, color: [241, 196, 15] },
        { label: "Limpieza", value: stats.limpieza.totalIncidencias, color: [231, 76, 60] },
      ];
      const maxVal = Math.max(...areas.map(a => +a.value || 0));
      const dataAreas = areas.map(a => {
        const val = +a.value || 0;
        const normalized = maxVal ? (val / maxVal) * 100 : 0;
        return { label: a.label, value: normalized.toFixed(1), raw: val, color: a.color };
      });
      currentY = await drawChartWithBox({
        doc,
        startX: 20,
        startY: currentY,
        title: "Comparativo de Áreas",
        data: dataAreas,
        barMaxHeight: 30,
      });

      // Numeración y Marca de Agua
      const totalPaginas = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text(`Página ${i} de ${totalPaginas}`, 105, 290, { align: "center" });

        doc.setFontSize(100);
        doc.setTextColor(0, 51, 153);
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.2 }));
        doc.text("Sin validez", 140, 200, { angle: 45, align: "center" });
        doc.restoreGraphicsState();
      }

      // Descargar PDF
      doc.save("Reporte_General_Sistema.pdf");
    };
  } catch (error) {
    console.error("Error al generar el reporte general del sistema:", error);
  }
};







  // Handlers para cada opción del modal:
  const handleGenerarReporteUsuarios = () => {
    generarReporteUsuarios(); // Función ya existente
    setModalReporteSeleccionVisible(false);
  };

  const handleGenerarReporteGeneralSistema = () => {
    generarReporteGeneral(); // Función para el reporte general del sistema
    setModalReporteSeleccionVisible(false);
  };


  return (
    <div>
        {modalReporteSeleccionVisible && (
      <>
        <div
          className={`report-backdrop ${modalFadeOut ? "fade-out" : ""}`}
          onClick={handleModalBackdropClick}
        ></div>
        <div className={`report-modal ${modalFadeOut ? "fade-out" : ""}`}>
          <h3>Selecciona el tipo de reporte</h3>

          {/* Contenedor para los 2 botones de reporte en fila */}
          <div className="buttons-row">
            <button
              onClick={handleGenerarReporteUsuarios}
              className="btn-reporte"
            >
              <FaUserCircle size={30} />
              <span>Generar reporte de usuarios</span>
            </button>
            <button
              onClick={handleGenerarReporteGeneralSistema}
              className="btn-reporte"
            >
              <FaChartBar size={30} />
              <span>Generar reporte general del sistema</span>
            </button>
          </div>

          {/* Botón de cancelar debajo, más corto y rojo */}
          <button onClick={handleModalBackdropClick} className="btn-cancelar">
            <FaTimes size={16} />
            <span>Cancelar</span>
          </button>
        </div>
      </>
    )}


    {modalVisible && (
        <div className="modal">
          <p>{modalMensaje}</p>
        </div>
      )} 
    <Footer title="GESTOR DE USUARIOS" generarReporte={() => setModalReporteSeleccionVisible(true)} />
    {/* <img src={logo} alt="Logo del Hotel" className="logo" />*/}
    <div className="dashboard-container">
     <Sidebar />
      <div className="content">
         {/* <h2>Bienvenido al Dashboard</h2> */}
      </div>  
      <div className="panel-izquierdo"style={{ flex: 2.5, marginLeft: '-150px' }}>
        <div className="filtros-container">
          <h3>FILTRAR BÚSQUEDA</h3>
          <div className="filtros">
            {['CORREO', 'NOMBRE_CLIENTE', 'RFC', 'DIRECCION', 'PERFIL', 'ESTATUS', 'ALTA_REG'].map((campo) => (
              <button 
                key={campo} 
                onClick={() => setFiltro(campo)} 
                className={filtro === campo ? 'filtro-activo' : ''}
              >
            
              {campo === 'ALTA_REG' ? 'FECHA DE REGISTRO' : 
                campo === 'NOMBRE_CLIENTE' ? 'NOMBRE' : 
                campo === 'DIRECCION' ? 'DIRECCIÓN' : 
                campo.replace('_', ' ')}

                {/*{campo.toUpperCase()}*/}
              </button>
            ))}
            <button 
              onClick={() => {
                setMostrarInactivos(!mostrarInactivos);
                setMostrarTodos(false); // Desactiva el botón de "Mostrar todos"
              }}
              className={mostrarInactivos ? 'filtro-activo' : ''}
            >
              {mostrarInactivos ? 'MOSTRAR ACTIVOS' : 'MOSTRAR INACTIVOS'}
            </button>

            <button 
              onClick={() => {
                setMostrarTodos(!mostrarTodos);
                setMostrarInactivos(false); // Restablecer activos/inactivos a su color original
              }}
              className={mostrarTodos ? 'filtro-activo' : ''}
            >
              MOSTRAR TODOS LOS USUARIOS
            </button>

          </div>
        </div>
        <div className="search-container">
  <FaSearch className="search-icon" />
  <input 
    type="text" 
    placeholder="Buscar..." 
    value={busqueda} 
    onChange={(e) => setBusqueda(e.target.value)}
  />
</div>
      <div className="table-container">
        <table>
          <thead>
            <tr> 
              <th>Correo</th>
              <th>Nombre</th>
              <th>RFC</th>
              <th>Dirección</th>
              <th>Perfil</th>
              <th>Estatus</th>
              <th>Fecha de registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length > 0 ? (
              usuariosFiltrados.map((user) => (
                <tr key={user.CORREO} onClick={() => handleSeleccionarUsuario(user)}>
                 
                  <td>{user.CORREO}</td>
                  <td>{user.NOMBRE_CLIENTE}</td>
                  <td>{user.RFC}</td>
                  <td>{user.DIRECCION}</td>
                  <td>{user.PERFIL}</td>
                  <td>{user.ESTATUS}</td>
                  <td>{user.ALTA_REG}</td>
                  <td>
                    <button
                      className="delete-button"
                      onClick={(e) => {
                      e.stopPropagation();
                      if (user.ESTATUS === '2') {
                        handleHabilitar(user.CORREO); // Función para habilitar usuarios inactivos
                      } else {
                        handleEliminar(user.CORREO); // Función para eliminar usuarios activos
                      }
                    }}
                    >
                      {user.ESTATUS === '2' ? 'Habilitar' : 'Eliminar'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>No hay usuarios disponibles</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
      <div className="panel-derecho" style={{ flex: 1, marginRight: '280px' }}>
        <h2 className="titulo-dashboard">{usuarioSeleccionado ? 'EDITAR USUARIO' : 'REGISTRAR USUARIO'}</h2>
        
        {/* Campo de CORREO */}
  <div className="input-container">
    <input 
      type="text" 
      name="CORREO" 
      value={formData.CORREO} 
      onChange={handleInputChange} 
      onBlur={handleBlur} 
      placeholder="Correo" 
      className={errors.CORREO ? 'error-input' : ''}
    />
    {errors.CORREO && <p className="error-text">{errors.CORREO}</p>}
  </div>
  {/* Campo de Nombre Cliente */}
<div className="input-container">
    <input 
        type="text" 
        name="NOMBRE_CLIENTE" 
        value={formData.NOMBRE_CLIENTE} 
        onChange={handleInputChange} 
        onBlur={handleBlur} 
        placeholder="Nombre Completo" 
        className={errors.NOMBRE_CLIENTE ? 'error-input' : ''}
    />
    {errors.NOMBRE_CLIENTE && <p className="error-text">{errors.NOMBRE_CLIENTE}</p>}
</div>

{/* Campo de RFC */}
<div className="input-container">
    <input 
        type="text" 
        name="RFC" 
        value={formData.RFC} 
        onChange={handleInputChange} 
        onBlur={handleBlur} 
        placeholder="RFC" 
        className={errors.RFC ? 'error-input' : ''}
    />
    {errors.RFC && <p className="error-text">{errors.RFC}</p>}
</div>

{/* Campo de Dirección */}
<div className="input-container">
    <input 
        type="text" 
        name="DIRECCION" 
        value={formData.DIRECCION} 
        onChange={handleInputChange} 
        onBlur={handleBlur} 
        placeholder="Dirección" 
        className={errors.DIRECCION ? 'error-input' : ''}
    />
    {errors.DIRECCION && <p className="error-text">{errors.DIRECCION}</p>}
</div>
          
  {/* Campo de CONTRASEÑA */}
  <div className="input-container">
    <input 
      type="password" 
      name="CONTRASEÑA" 
      value={formData.CONTRASEÑA} 
      onChange={handleInputChange} 
      onBlur={handleBlur} 
      placeholder="Contraseña" 
      className={errors.CONTRASEÑA ? 'error-input' : ''}
    />
    {errors.CONTRASEÑA && <p className="error-text">{errors.CONTRASEÑA}</p>}
  </div>

  {/* Campo de PERFIL */}
  <div className="input-container">
    <select 
      name="PERFIL" 
      value={formData.PERFIL} 
      onChange={handleInputChange} 
      onBlur={handleBlur} 
      className={errors.PERFIL ? 'error-input' : ''}
    >
      <option value="">Seleccione un perfil</option>
      <option value="A">A</option>
      <option value="B">B</option>
      <option value="C">C</option>
      <option value="D">D</option>
    </select>
    {errors.PERFIL && <p className="error-text">{errors.PERFIL}</p>}
  </div>

  {/* Campo de ESTATUS */}
  <div className="input-container">
    <select 
      name="ESTATUS" 
      value={formData.ESTATUS} 
      onChange={handleInputChange} 
      onBlur={handleBlur} 
      className={errors.ESTATUS ? 'error-input' : ''}
    >
      <option value="">Seleccione un estatus</option>
      <option value="1">1</option>
      <option value="2">2</option>
    </select>
    {errors.ESTATUS && <p className="error-text">{errors.ESTATUS}</p>}
  </div>

        {/* <input type="text" name="ALTA_REG" value={formData.ALTA_REG} onChange={handleInputChange} placeholder="Alta Registro" disabled /> */}
        <div className="button-group">
  {usuarioSeleccionado ? (
    <>
      <button 
        className="update-button" 
        onClick={() => {
          if (validateFields()) {
            handleActualizar();
          } else {
            mostrarModal('Ningún campo puede estar vacío');
          }
        }}
      >
        Actualizar
      </button>

      <button
        className="delete-button"
        onClick={() => {
          if (usuarioSeleccionado.ESTATUS === '2') {
            handleHabilitar(usuarioSeleccionado.CORREO); // Función para habilitar usuarios inactivos
          } else {
            handleEliminarDesdeFormulario(); // Función para eliminar usuarios activos
          }
        }}
      >
        {usuarioSeleccionado.ESTATUS === '2' ? 'Habilitar' : 'Eliminar'}
      </button>
    </>
  ) : (
    <button 
      className="register-button" 
      onClick={() => {
        if (validateFields()) {
          handleRegistrar();
        } else {
          mostrarModal('Ningún campo puede estar vacío');
        }
      }}
    >
     Registrar

    </button>
  )}
  <button className="clear-button" 
    onClick={handleLimpiarFormulario}>
    Limpiar</button>
</div>

      </div>
    </div>
    </div>
  );
};

export default Dashboard;