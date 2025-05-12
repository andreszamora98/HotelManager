const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * GET /reportes/estadisticas-generales
 * Devuelve un objeto con estadísticas globales de:
 * - Usuarios (total, activos, inactivos)
 * - Habitaciones (total, disponibles, ocupadas, mantenimiento, limpieza)
 * - CheckIn (totalEstancias, totalFacturado, etc.)
 * - Mantenimiento (reportes en 'Habitaciones' con estado 'mantenimiento')
 * - Limpieza (totalIncidencias en la tabla Limpieza)
 */
router.get("/estadisticas-generales", async (req, res) => {
  try {
    // 1. Consultas a la BD para cada bloque de estadísticas
    //    Puedes usar Promise.all() o varias queries secuenciales.

    // A) Usuarios
    const queryUsuarios = `
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN ESTATUS = '1' THEN 1 ELSE 0 END) AS activos,
        SUM(CASE WHEN ESTATUS = '2' THEN 1 ELSE 0 END) AS inactivos
      FROM Usuarios
    `;
    const [usuariosResult] = await executeQuery(queryUsuarios);

    const queryUsuariosPerfiles = `
        SELECT
            SUM(CASE WHEN PERFIL = 'A' THEN 1 ELSE 0 END) AS perfilA,
            SUM(CASE WHEN PERFIL = 'B' THEN 1 ELSE 0 END) AS perfilB,
            SUM(CASE WHEN PERFIL = 'C' THEN 1 ELSE 0 END) AS perfilC,
            SUM(CASE WHEN PERFIL = 'D' THEN 1 ELSE 0 END) AS perfilD
        FROM Usuarios
    `;
    const [usuariosPerfilesResult] = await executeQuery(queryUsuariosPerfiles);

    // B) Habitaciones
    const queryHabitaciones = `
  SELECT 
    COUNT(*) AS total,
    SUM(CASE WHEN ESTADO = 'disponible' THEN 1 ELSE 0 END) AS disponibles,
    SUM(CASE WHEN ESTADO = 'ocupada' THEN 1 ELSE 0 END) AS ocupadas,
    SUM(CASE WHEN ESTADO = 'mantenimiento' THEN 1 ELSE 0 END) AS mantenimiento,
    SUM(CASE WHEN ESTADO = 'limpieza' THEN 1 ELSE 0 END) AS limpieza,
    SUM(CASE WHEN TIPO = 'presidencial' THEN 1 ELSE 0 END) AS presidencial,
    SUM(CASE WHEN TIPO = 'suite' THEN 1 ELSE 0 END) AS suite,
    SUM(CASE WHEN TIPO = 'estandar' THEN 1 ELSE 0 END) AS estandar
  FROM Habitaciones
`;

    const [habitacionesResult] = await executeQuery(queryHabitaciones);

    // C) CheckIn
    //   - totalEstancias = número de registros
    //   - totalFacturado = suma de la columna "TOTAL"
    const queryCheckIn = `
      SELECT 
        COUNT(*) AS totalEstancias,
        IFNULL(SUM(TOTAL), 0) AS totalFacturado
      FROM CheckIn
    `;
    const [checkInResult] = await executeQuery(queryCheckIn);

    // D) Mantenimiento
    //   - Podemos contar cuántas habitaciones están en estado 'mantenimiento'
    const queryMantenimiento = `
      SELECT COUNT(*) AS totalReportes
      FROM Habitaciones
      WHERE ESTADO = 'mantenimiento'
    `;
    const [mantenimientoResult] = await executeQuery(queryMantenimiento);

    // E) Limpieza
    //   - Contar registros en la tabla Limpieza
    const queryLimpieza = `
      SELECT COUNT(*) AS totalIncidencias
      FROM Limpieza
    `;
    const [limpiezaResult] = await executeQuery(queryLimpieza);

    // 2. Formar el objeto final
    const estadisticas = {
      usuarios: {
        total: usuariosResult.total || 0,
        activos: usuariosResult.activos || 0,
        inactivos: usuariosResult.inactivos || 0,
        // Por si quieres más desglose por perfil, harías otra query o sub-consultas

        perfilA: usuariosPerfilesResult.perfilA || 0,
        perfilB: usuariosPerfilesResult.perfilB || 0,
        perfilC: usuariosPerfilesResult.perfilC || 0,
        perfilD: usuariosPerfilesResult.perfilD || 0,
      },
      habitaciones: {
      total: habitacionesResult.total || 0,
      disponibles: habitacionesResult.disponibles || 0,
      ocupadas: habitacionesResult.ocupadas || 0,
      mantenimiento: habitacionesResult.mantenimiento || 0,
      limpieza: habitacionesResult.limpieza || 0,
      presidencial: habitacionesResult.presidencial || 0,
      suite: habitacionesResult.suite || 0,
      estandar: habitacionesResult.estandar || 0,
},

      checkins: {
        totalEstancias: checkInResult.totalEstancias || 0,
        totalFacturado: checkInResult.totalFacturado || 0,
        // Podrías añadir "ultimoMes" o algo similar con otra consulta
      },
      mantenimiento: {
        totalReportes: mantenimientoResult.totalReportes || 0,
      },
      limpieza: {
        totalIncidencias: limpiezaResult.totalIncidencias || 0,
      },
    };

    // 3. Responder con el JSON final
    res.json(estadisticas);

  } catch (error) {
    console.error("Error al obtener estadísticas generales:", error);
    return res.status(500).json({ error: "Error en la base de datos" });
  }
});

/**
 * Pequeño helper para usar async/await con db.query
 * - Puedes usarlo o reemplazarlo por tu propia lógica
 */
function executeQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

module.exports = router;
