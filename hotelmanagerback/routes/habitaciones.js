const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

//Configuración de almacenamiento para archivos CSV
const upload = multer({ dest: "uploads/" });

router.post("/carga-masiva", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No se envió ningún archivo." });
    }

    const filePath = req.file.path;
    const habitaciones = [];
    let isFirstRow = true;

    fs.createReadStream(filePath)
        .pipe(csv({ headers: false }))
        .on("data", (row) => {
            if (isFirstRow) {
                isFirstRow = false;
                return; // Omitir encabezados
            }

            habitaciones.push({
                numero_habitacion: row[0]?.trim() || null,
                tipo: row[1]?.trim().toLowerCase() || null,
                capacidad: row[2] ? parseInt(row[2], 10) : null,
                precio_por_noche: row[3] ? parseFloat(row[3]) : null,
                estado: row[4]?.trim().toLowerCase() || "disponible",
                descripcion: row[5]?.trim() || null,
            });
        })
        .on("end", () => {
            if (habitaciones.length === 0) {
                fs.unlink(filePath, () => {});
                return res.status(400).json({ error: "El archivo CSV no contiene datos válidos." });
            }

            const numerosHabitaciones = habitaciones.map(h => h.numero_habitacion);
            const checkQuery = `SELECT NUMERO_HABITACION FROM Habitaciones WHERE NUMERO_HABITACION IN (?);`;

            db.query(checkQuery, [numerosHabitaciones], (err, results) => {
                if (err) {
                    console.error("Error al verificar habitaciones:", err);
                    return res.status(500).json({ error: "Error al verificar habitaciones", details: err });
                }

                // 📌 Filtrar habitaciones nuevas
                const habitacionesExistentes = results.map(r => r.NUMERO_HABITACION);
                const habitacionesNuevas = habitaciones.filter(h => !habitacionesExistentes.includes(h.numero_habitacion));

                if (habitacionesNuevas.length === 0) {
                    fs.unlink(filePath, () => {});
                    return res.status(200).json({ insertados: 0, omitidos: habitaciones.length });
                }

                const values = habitacionesNuevas.map(h => [
                    h.numero_habitacion,
                    h.tipo,
                    h.capacidad,
                    h.precio_por_noche,
                    h.estado,
                    h.descripcion,
                ]);

                const insertQuery = `
                    INSERT INTO Habitaciones (NUMERO_HABITACION, TIPO, CAPACIDAD, PRECIO_POR_NOCHE, ESTADO, DESCRIPCION)
                    VALUES ?
                `;

                db.query(insertQuery, [values], (err, result) => {
                    if (err) {
                        console.error("Error al insertar habitaciones:", err);
                        return res.status(500).json({ error: "Error al registrar las habitaciones", details: err });
                    }

                    res.status(201).json({
                        insertados: result.affectedRows,
                        omitidos: habitaciones.length - result.affectedRows
                    });

                    fs.unlink(filePath, () => {});
                });
            });
        })
        .on("error", (err) => {
            console.error("Error al leer el CSV:", err);
            res.status(500).json({ error: "Error al procesar el archivo CSV", details: err });
        });
});





router.post("/", (req, res) => {
    console.log("📥 Datos recibidos en POST /habitaciones:", req.body);

    const { numero_habitacion, tipo, capacidad, precio_por_noche, estado, descripcion } = req.body;

    if (!numero_habitacion || !tipo || !capacidad || !precio_por_noche) {
        return res.status(400).json({ error: "Faltan campos obligatorios." });
    }

    const query = `
        INSERT INTO Habitaciones (NUMERO_HABITACION, TIPO, CAPACIDAD, PRECIO_POR_NOCHE, ESTADO, DESCRIPCION)
        VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(
        query,
        [numero_habitacion, tipo.toLowerCase(), capacidad, precio_por_noche, estado?.toLowerCase() || "disponible", descripcion || null],
        (err, result) => {
            if (err) {
                console.error("Error al insertar habitación:", err);
                return res.status(500).json({
                    error: "Error al registrar la habitación en la base de datos",
                    details: err,
                });
            }
            console.log("Habitación registrada con ID:", result.insertId);
            res.status(201).json({
                message: "Habitación registrada correctamente",
                id: result.insertId,
            });
        }
    );
});
router.get("/", (req, res) => {
    const query = "SELECT * FROM Habitaciones";

    db.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener habitaciones:", err);
            return res.status(500).json({ error: "Error al obtener las habitaciones", details: err });
        }
        res.json(results);
    });
});

router.delete("/:id", (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM Habitaciones WHERE ID_HABITACION = ?";
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("Error al eliminar habitación:", err);
            return res.status(500).json({ error: "Error al eliminar la habitación", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "La habitación no existe." });
        }
        res.json({ message: "Habitación eliminada correctamente." });
    });
});

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


module.exports = router;

