/*
CREATE TABLE Habitaciones (
    ID_HABITACION INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la habitación',
    NUMERO_HABITACION VARCHAR(10) NOT NULL UNIQUE COMMENT 'Número de la habitación (Ej: 101, 202, A01)',
    TIPO ENUM('estandar', 'suite', 'presidencial') NOT NULL COMMENT 'Tipo de habitación',
    CAPACIDAD INT NOT NULL COMMENT 'Cantidad de personas que pueden alojarse',
    PRECIO_POR_NOCHE DECIMAL(10,2) NOT NULL COMMENT 'Costo por noche de la habitación',
    ESTADO ENUM('disponible', 'ocupada', 'mantenimiento') DEFAULT 'disponible' COMMENT 'Estado actual de la habitación',
    DESCRIPCION TEXT COMMENT 'Detalles adicionales sobre la habitación',
    FECHA_REGISTRO TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora en la que se registró la habitación',
    PRIMARY KEY (ID_HABITACION)
);
*/

-- ALTER TABLE Habitaciones DROP COLUMN FECHA_REGISTRO;
-- drop table habitaciones;
-- TRUNCATE TABLE habitaciones;
-- ALTER TABLE Habitaciones MODIFY ESTADO ENUM('disponible', 'ocupada', 'mantenimiento', 'limpieza') DEFAULT 'disponible';
SELECT * FROM habitaciones;