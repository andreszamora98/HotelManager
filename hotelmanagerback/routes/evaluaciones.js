const express = require('express');
const router = express.Router();
const db = require('../db'); // Asegúrate de tener la conexión a la base de datos

// Ruta para guardar la evaluación
router.post('/guardar', (req, res) => {
  const { satisfaccion, comentarios } = req.body;

  if (satisfaccion === null || satisfaccion === undefined) {
    return res.status(400).json({ error: 'La satisfacción es obligatoria' });
  }

  // Insertar la evaluación en la base de datos
  const query = 'INSERT INTO evaluaciones (satisfaccion, comentarios) VALUES (?, ?)';
  db.query(query, [satisfaccion, comentarios || null], (err, result) => {
    if (err) {
      console.error('Error al guardar la evaluación:', err);
      return res.status(500).json({ error: 'Error al guardar la evaluación' });
    }
    res.status(201).json({ message: 'Evaluación guardada con éxito', id: result.insertId });
  });
});

module.exports = router;
