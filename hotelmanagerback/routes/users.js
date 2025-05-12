const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/validar/:correo', (req, res) => {
    const { correo } = req.params;

    console.log("Correo recibido para validación:", correo); 

    if (!correo) {
        return res.status(400).json({ error: "Correo no proporcionado" });
    }

    const queryCorreo = 'SELECT COUNT(*) as correoExiste FROM Usuarios WHERE CORREO = ?';

    db.query(queryCorreo, [correo], (err, resultCorreo) => {
        if (err) {
            console.error("Error en la consulta SQL:", err); 
            return res.status(500).json({ error: "Error en la base de datos" });
        }

        console.log("Resultado de validación:", resultCorreo); 

        res.json({
            correoExiste: resultCorreo[0]?.correoExiste > 0
        });
    });
});



router.get('/', (req, res) => {
  db.query('SELECT CORREO, NOMBRE_CLIENTE, RFC, DIRECCION, PERFIL, ESTATUS, ALTA_REG FROM Usuarios', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});



router.post('/', (req, res) => {
    console.log('Datos recibidos:', req.body);

    const { correo, nombre_cliente, rfc, direccion, contraseña, perfil, estatus } = req.body;

    if (!correo || !nombre_cliente || !rfc || !direccion || !contraseña || !perfil || !estatus) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const query = `
        INSERT INTO Usuarios (CORREO, NOMBRE_CLIENTE, RFC, DIRECCION, CONTRASEÑA, PERFIL, ESTATUS, ALTA_REG) 
        VALUES (?, ?, ?, ?, SHA2(?, 256), ?, ?, NOW())`;

    db.query(query, [correo, nombre_cliente, rfc, direccion, contraseña, perfil, estatus], (err, result) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'El correo ya está registrado' });
            }
            return res.status(500).json({ error: err.message });
        }

        res.json({ message: 'Usuario registrado exitosamente' });
    });
});


router.put('/habilitar/:correo', (req, res) => {
  const { correo } = req.params;
  const query = 'UPDATE Usuarios SET ESTATUS = 1 WHERE CORREO = ?';

  db.query(query, [correo], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Usuario habilitado exitosamente' });
  });
});


router.put('/:correo', (req, res) => {
    console.log('Datos recibidos para actualización:', req.body);

    const { correoNuevo, nombre_cliente, rfc, direccion, contraseña, perfil, estatus } = req.body;
    const { correo } = req.params;

    if (!correo || !correoNuevo || !nombre_cliente || !rfc || !direccion || !perfil || !estatus) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios excepto la contraseña' });
    }

    let query, params;
    if (contraseña) {
        query = `
            UPDATE Usuarios 
            SET CORREO = ?, NOMBRE_CLIENTE = ?, RFC = ?, DIRECCION = ?, CONTRASEÑA = SHA2(?, 256), PERFIL = ?, ESTATUS = ? 
            WHERE CORREO = ?`;
        params = [correoNuevo, nombre_cliente, rfc, direccion, contraseña, perfil, estatus, correo];
    } else {
        query = `
            UPDATE Usuarios 
            SET CORREO = ?, NOMBRE_CLIENTE = ?, RFC = ?, DIRECCION = ?, PERFIL = ?, ESTATUS = ? 
            WHERE CORREO = ?`;
        params = [correoNuevo, nombre_cliente, rfc, direccion, perfil, estatus, correo];
    }

    db.query(query, params, (err, result) => {
        if (err) {
            console.error('Error en la actualización SQL:', err);
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'No se encontró el usuario o no se realizaron cambios' });
        }

        res.json({ message: 'Usuario actualizado exitosamente' });
    });
});



// Baja lógica del usuario (cambia estatus de 1 a 2)
router.delete('/:correo', (req, res) => {
    const { correo } = req.params;
    const query = 'UPDATE Usuarios SET ESTATUS = 2 WHERE CORREO = ?';

    db.query(query, [correo], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Usuario marcado como inactivo' });
    });
});


module.exports = router;