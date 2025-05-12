const express = require("express");
const router = express.Router();
const db = require("../db");

const updateHabitacion = (estado, id) => {
    return new Promise((resolve, reject) => {
        db.query("UPDATE Habitaciones SET ESTADO = ? WHERE NUMERO_HABITACION = ?", [estado, id], (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};
// Obtener habitaciones en mantenimiento
router.get("/", (req, res) => {
  db.query("SELECT * FROM Habitaciones", (err, results) => { // 🔹 Removemos la condición WHERE
    if (err) return res.status(500).json({ error: "Error al obtener habitaciones" });
    res.json(results);
  });
});


// Registrar reporte de mantenimiento
router.post("/", (req, res) => {
  const { habitacion, descripcion } = req.body;

  if (!habitacion || !descripcion) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  const query = `UPDATE Habitaciones SET ESTADO = 'mantenimiento' WHERE NUMERO_HABITACION = ?`;
  db.query(query, [habitacion], (err) => {
    if (err) return res.status(500).json({ error: "Error al actualizar estado de habitación" });

    res.json({ message: "Reporte de mantenimiento registrado" });
  });
});
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    try {
        const result = await updateHabitacion(estado, id);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Habitación no encontrada" });
        }

        res.json({ message: `Habitación ${id} actualizada a ${estado}` });
    } catch (error) {
        console.error("Error al actualizar habitación:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});


module.exports = router;
