const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

router.post('/login', (req, res) => {
  const { correo, contraseña } = req.body;
  const query = 'SELECT NOMBRE_CLIENTE, PERFIL FROM Usuarios WHERE CORREO = ? AND CONTRASEÑA = SHA2(?, 256)';

  db.query(query, [correo, contraseña], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (results.length > 0) {
      res.status(200).json({
      message: 'Bienvenido al sistema HOTELMANAGERKOM',
      perfil: results[0].PERFIL, // ✅ Perfil correcto
      usuario: {
        NOMBRE_CLIENTE: results[0].NOMBRE_CLIENTE, // ✅ Ahora incluimos el nombre
      },
  });
  } else {
    res.status(401).json({ message: 'No tienes privilegios suficientes' });
  }

  });
});

module.exports = router;