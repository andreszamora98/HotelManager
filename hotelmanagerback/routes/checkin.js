const express = require("express");
const router = express.Router();
const db = require("../db");

// 📌 Obtener todos los clientes (Nombre, RFC y Dirección)
router.get("/clientes", (req, res) => {
  const query = "SELECT NOMBRE_CLIENTE, RFC, DIRECCION FROM Usuarios";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error en la consulta:", err);
      return res.status(500).json({ error: "Error en la base de datos" });
    }
    res.json(results);
  });
});

// 📌 Insertar un nuevo check-in en la base de datos
router.post("/checkin", (req, res) => {
  const {
    nombre,
    rfc,
    direccion,
    fechaEntrada,
    fechaSalida,
    tipoHabitacion,
    costoPorNoche,
    noches,
    subtotal,
    iva,
    total,
  } = req.body;

  console.log("Datos recibidos en la API:", req.body); 

  const query = `
    INSERT INTO CheckIn 
    (NOMBRE_CLIENTE, RFC, DIRECCION, FECHA_ENTRADA, FECHA_SALIDA, TIPO_HABITACION, COSTO_POR_NOCHE, NOCHES, SUBTOTAL, IVA, TOTAL, FECHA_REGISTRO)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

  db.query(
    query,
    [nombre, rfc, direccion, fechaEntrada, fechaSalida, tipoHabitacion, costoPorNoche, noches, subtotal, iva, total],
    (err, result) => {
      if (err) {
        console.error("Error al insertar check-in:", err);
        return res.status(500).json({ error: "Error al registrar el check-in en la base de datos", details: err });
      }
      console.log("Check-in registrado con ID:", result.insertId);
      res.status(201).json({ message: "Check-in registrado correctamente", id: result.insertId });
    }
  );
});

router.get("/reporte", (req, res) => {
  const query = `
    SELECT 
      NOMBRE_CLIENTE AS nombre, 
      RFC AS rfc, 
      DIRECCION AS direccion, 
      DATE_FORMAT(FECHA_ENTRADA, '%Y-%m-%d') AS fechaEntrada,
      DATE_FORMAT(FECHA_SALIDA, '%Y-%m-%d') AS fechaSalida,
      TIPO_HABITACION AS tipoHabitacion,
      TOTAL AS total
    FROM CheckIn 
    ORDER BY FECHA_REGISTRO DESC`; // Obtiene el último check-in registrado

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener el reporte de check-in:", err);
      return res.status(500).json({ error: "Error en la base de datos" });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "No hay check-ins registrados." });
    }

    res.json(results);
  });
});

module.exports = router;


