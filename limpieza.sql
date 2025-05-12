/*
CREATE TABLE Limpieza (
    ID_LIMPIEZA INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del registro de limpieza',
    NUMERO_HABITACION VARCHAR(10) NOT NULL COMMENT 'Número de la habitación',
    ESTADO ENUM('disponible', 'ocupada', 'limpieza') DEFAULT 'limpieza' COMMENT 'Estado de la habitación después de la limpieza',
    DESCRIPCION TEXT COMMENT 'Descripción del problema encontrado en la habitación',
    FECHA_REGISTRO TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora del registro de limpieza',
    PRIMARY KEY (ID_LIMPIEZA)
);
*/
SELECT * FROM Limpieza;