import React, { useState } from "react";
import { FaSadTear, FaMeh, FaSmile, FaGrinStars } from "react-icons/fa"; // Importamos los íconos de react-icons
import "./modalEncuesta.css"; // Importamos los estilos específicos para esta encuesta

const ModalEncuesta = ({ isVisible, onClose }) => {
  const [satisfaccion, setSatisfaccion] = useState(null);
  const [comentarios, setComentarios] = useState("");
  const [showGraciasModal, setShowGraciasModal] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [mensajeAgradecimiento, setMensajeAgradecimiento] = useState("¡Gracias por tu evaluación!"); // Estado para el mensaje

  const handleSatisfaccionChange = (value) => {
    if (satisfaccion === value) {
      // Si la carita ya está seleccionada, desmarcarla
      setSatisfaccion(null);
    } else {
      // Si no está seleccionada, seleccionarla
      setSatisfaccion(value);
    }
  };

  const handleComentarioChange = (e) => {
    setComentarios(e.target.value);
  };

  const handleGuardar = async () => {
  // Guardamos los datos en la base de datos (esto se integrará más adelante)
  console.log("Satisfacción:", satisfaccion);
  console.log("Comentarios:", comentarios);

  try {
    // Enviar la evaluación al backend
    const response = await fetch("http://localhost:3001/evaluaciones/guardar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        satisfaccion,
        comentarios,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(`Error: ${result.error || "Hubo un problema al guardar la evaluación."}`);
    } 
  } catch (error) {
    console.error("Error al guardar la evaluación:", error);
    alert("Hubo un problema al guardar la evaluación.");
  }

  setMensajeAgradecimiento("¡Gracias por tu evaluación!");
  setShowGraciasModal(true);
  setTimeout(() => {
    setFadeOut(true);
    setTimeout(() => {
      setShowGraciasModal(false);
      onClose();
    }, 3000);
  }, 500);
};


  const handleOmitir = () => {
    setMensajeAgradecimiento("¡Hasta luego!"); 
    setShowGraciasModal(true); 
    setTimeout(() => {
      setFadeOut(true); 
      setTimeout(() => {
        setShowGraciasModal(false); 
        onClose();
      }, 3000); 
    }, 500);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Modal de Encuesta */}
      <div className={`encuesta-modal ${fadeOut ? 'fade-out' : ''}`}>
        <div className="encuesta-modal-content">
          <span className="encuesta-close" onClick={onClose}>&times;</span>
          <h2>ENCUESTA DE SATISFACCIÓN</h2>
          <p>¿Cómo calificarías tu estadía?</p>

          <div className="encuesta-caritas">
            <div className="encuesta-carita-container">
              <FaSadTear
                onClick={() => handleSatisfaccionChange(0)}
                className={`encuesta-carita ${satisfaccion === 0 ? 'selected' : ''}`}
                style={{ fontSize: "40px", cursor: "pointer", color: "#e74c3c" }}
              />
              <p className="encuesta-titulo mala">Mala</p>
            </div>

            <div className="encuesta-carita-container">
              <FaMeh
                onClick={() => handleSatisfaccionChange(1)}
                className={`encuesta-carita ${satisfaccion === 1 ? 'selected' : ''}`}
                style={{ fontSize: "40px", cursor: "pointer", color: "#f39c12" }}
              />
              <p className="encuesta-titulo regular">Regular</p>
            </div>

            <div className="encuesta-carita-container">
              <FaSmile
                onClick={() => handleSatisfaccionChange(2)}
                className={`encuesta-carita ${satisfaccion === 2 ? 'selected' : ''}`}
                style={{ fontSize: "40px", cursor: "pointer", color: "#2ecc71" }}
              />
              <p className="encuesta-titulo buena">Buena</p>
            </div>

            <div className="encuesta-carita-container">
              <FaGrinStars
                onClick={() => handleSatisfaccionChange(3)}
                className={`encuesta-carita ${satisfaccion === 3 ? 'selected' : ''}`}
                style={{ fontSize: "40px", cursor: "pointer", color: "#3498db" }}
              />
              <p className="encuesta-titulo excelente">Excelente</p>
            </div>
          </div>

          {satisfaccion !== null && (
            <>
              <textarea
                value={comentarios}
                onChange={handleComentarioChange}
                placeholder="Escribe tus comentarios (opcional)"
                className="encuesta-textarea"
              ></textarea>
              <div className="encuesta-modal-buttons">
                <button onClick={handleGuardar} className="encuesta-button">GUARDAR</button>
                <button onClick={handleOmitir} className="encuesta-button">OMITIR</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de Agradecimiento */}
      {showGraciasModal && (
        <div className={`gracias-modal ${fadeOut ? 'fade-out' : ''}`}>
          <div className="gracias-modal-content">
            <h2>{mensajeAgradecimiento}</h2> {/* Mostrar el mensaje dinámico */}
          </div>
        </div>
      )}
    </>
  );
};

export default ModalEncuesta;
