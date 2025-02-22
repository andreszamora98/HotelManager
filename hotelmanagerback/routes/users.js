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
  db.query('SELECT CORREO, PERFIL, ESTATUS, ALTA_REG FROM Usuarios', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});



router.post('/', (req, res) => {
    console.log('Datos recibidos:', req.body);

    const { correo, contraseña, perfil, estatus } = req.body;

    if (!correo || !contraseña || !perfil || !estatus) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const query = 'INSERT INTO Usuarios (CORREO, CONTRASEÑA, PERFIL, ESTATUS, ALTA_REG) VALUES (?, SHA2(?, 256), ?, ?, NOW())';

    db.query(query, [correo, contraseña, perfil, estatus], (err, result) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            return res.status(500).json({ error: err.message });
        }

        res.json({ message: 'Usuario registrado exitosamente' });
    });
});




// Actualizar un usuario existente
/*
router.put('/:correo', (req, res) => {
    console.log('Datos recibidos para actualización:', req.body);

    const { contraseña, perfil, estatus } = req.body;
    const { correo } = req.params;

    if (!correo || !perfil || !estatus) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios excepto la contraseña' });
    }

    let query, params;
    if (contraseña) {
        query = 'UPDATE Usuarios SET CONTRASEÑA = SHA2(?, 256), PERFIL = ?, ESTATUS = ? WHERE CORREO = ?';
        params = [contraseña, perfil, estatus, correo];
    } else {
        query = 'UPDATE Usuarios SET PERFIL = ?, ESTATUS = ? WHERE CORREO = ?';
        params = [perfil, estatus, correo];
    }

    db.query(query, params, (err, result) => {
        if (err) {
            console.error('Error en la actualización SQL:', err);
            return res.status(500).json({ error: err.message });
        }

        res.json({ message: 'Usuario actualizado exitosamente' });
    });
});
*/
router.put('/:correo', (req, res) => {
    console.log('Datos recibidos para actualización:', req.body);

    const { correoNuevo, contraseña, perfil, estatus } = req.body;
    const { correo } = req.params;

    if (!correo || !correoNuevo || !perfil || !estatus) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios excepto la contraseña' });
    }

    // Verificar si el nuevo correo ya existe en la base de datos
    const queryVerificar = 'SELECT CORREO FROM Usuarios WHERE CORREO = ? AND CORREO != ?';
    
    db.query(queryVerificar, [correoNuevo, correo], (err, result) => {
        if (err) {
            console.error('Error en la validación del correo:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (result.length > 0) {
            return res.status(400).json({ error: 'El correo ya está en uso' });
        }

        // Si el nuevo correo no está duplicado, proceder con la actualización
        let query, params;
        if (contraseña) {
            query = 'UPDATE Usuarios SET CORREO = ?, CONTRASEÑA = SHA2(?, 256), PERFIL = ?, ESTATUS = ? WHERE CORREO = ?';
            params = [correoNuevo, contraseña, perfil, estatus, correo];
        } else {
            query = 'UPDATE Usuarios SET CORREO = ?, PERFIL = ?, ESTATUS = ? WHERE CORREO = ?';
            params = [correoNuevo, perfil, estatus, correo];
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