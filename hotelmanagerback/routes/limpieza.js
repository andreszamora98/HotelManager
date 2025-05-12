const express = require("express");
const router = express.Router();
const db = require("../db");

// 📌 Obtener todas las habitaciones con su estado
router.get("/habitaciones", (req, res) => {
    const query = "SELECT NUMERO_HABITACION, ESTADO FROM Habitaciones";
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener habitaciones:", err);
            return res.status(500).json({ error: "Error en la base de datos" });
        }
        res.json(results);
    });
});

// 📌 Marcar una habitación como limpia y disponible// 
router.put("/:numero/limpiar", (req, res) => {
    const { numero } = req.params;
    const query = "UPDATE Habitaciones SET ESTADO = 'disponible' WHERE NUMERO_HABITACION = ?";

    db.query(query, [numero], (err, result) => {
        if (err) {
            console.error("Error al actualizar el estado de la habitación:", err);
            return res.status(500).json({ error: "Error al actualizar el estado" });
        }

        // 📌 Verificar si se actualizó alguna fila
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: `Habitación ${numero} no encontrada.` });
        }

        res.json({ message: `Habitación ${numero} marcada como limpia y disponible.` });
    });
});


// 📌 Cambiar estado de una habitación a "limpieza"
router.put("/:numero/en-limpieza", (req, res) => {
    const { numero } = req.params;
    const query = "UPDATE Habitaciones SET ESTADO = 'limpieza' WHERE NUMERO_HABITACION = ?";

    db.query(query, [numero], (err, result) => {
        if (err) {
            console.error("Error al actualizar el estado de la habitación a limpieza:", err);
            return res.status(500).json({ error: "Error al actualizar el estado" });
        }
        res.json({ message: `Habitación ${numero} ahora está en limpieza.` });
    });
});

// 📌 Registrar una incidencia de limpieza
router.post("/", (req, res) => {
    const { habitacion, descripcion } = req.body;

    if (!habitacion || !descripcion) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // 📌 Verificar que la habitación no esté ya en mantenimiento o limpieza
    db.query("SELECT ESTADO FROM Habitaciones WHERE NUMERO_HABITACION = ?", [habitacion], (err, results) => {
        if (err) {
            console.error("Error al verificar el estado de la habitación:", err);
            return res.status(500).json({ error: "Error en la base de datos" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "La habitación no existe" });
        }

        const estadoActual = results[0].ESTADO;
        if (estadoActual === "limpieza" || estadoActual === "mantenimiento") {
            return res.status(400).json({ error: `No se puede registrar una incidencia en una habitación en ${estadoActual}.` });
        }

        // 📌 Registrar la incidencia y cambiar el estado a "limpieza"
        db.query("UPDATE Habitaciones SET ESTADO = 'limpieza' WHERE NUMERO_HABITACION = ?", [habitacion], (err) => {
            if (err) {
                console.error("Error al cambiar el estado de la habitación:", err);
                return res.status(500).json({ error: "Error al actualizar el estado de la habitación" });
            }

            db.query("INSERT INTO Limpieza (NUMERO_HABITACION, DESCRIPCION, ESTADO) VALUES (?, ?, 'limpieza')", [habitacion, descripcion], (err) => {
                if (err) {
                    console.error("Error al registrar la incidencia:", err);
                    return res.status(500).json({ error: "Error al registrar la incidencia" });
                }
                res.status(201).json({ message: `Incidencia en habitación ${habitacion} registrada y cambiada a estado de limpieza.` });
            });
        });
    });
});
// Obtener todos los registros de la tabla Limpieza
router.get("/reporte", (req, res) => {
  const query = `
    SELECT 
      ID_LIMPIEZA,
      NUMERO_HABITACION,
      ESTADO,
      DESCRIPCION,
      FECHA_REGISTRO
    FROM Limpieza
    ORDER BY FECHA_REGISTRO DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener el reporte de limpieza:", err);
      return res.status(500).json({ error: "Error en la base de datos" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "No hay registros de limpieza." });
    }

    // Enviar el array de objetos Limpieza
    res.json(results);
  });
});

module.exports = router;
