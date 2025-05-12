const express = require('express');
const cors = require('cors');
const db = require('./db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const checkinRoutes = require("./routes/checkin"); // Importar rutas de Check-in
const habitacionesRoutes = require("./routes/habitaciones");
const mantenimientoRoutes = require("./routes/mantenimiento");
const limpiezaRoutes = require("./routes/limpieza");
const reportesRoutes = require("./routes/reportes");
const evaluacionesRoutes = require("./routes/evaluaciones");
require('dotenv').config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use("/checkin", checkinRoutes); // Usar rutas de Check-in
app.use('/habitaciones', habitacionesRoutes);
app.use('/mantenimiento', mantenimientoRoutes);
app.use('/limpieza', limpiezaRoutes);
app.use("/reportes", reportesRoutes);
app.use('/evaluaciones', evaluacionesRoutes); 
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});