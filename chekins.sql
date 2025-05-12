SELECT * from checkin;
/*
CREATE TABLE CheckIn (
    ID_CHECKIN INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del check-in',
    NOMBRE_CLIENTE VARCHAR(100) NOT NULL COMMENT 'Nombre del cliente registrado en el check-in',
    RFC VARCHAR(13) NOT NULL COMMENT 'RFC del cliente',
    DIRECCION VARCHAR(255) NOT NULL COMMENT 'Dirección del cliente',
    FECHA_ENTRADA DATE NOT NULL COMMENT 'Fecha de entrada del huésped',
    FECHA_SALIDA DATE NOT NULL COMMENT 'Fecha de salida del huésped',
    TIPO_HABITACION ENUM('estandar', 'suite', 'presidencial') NOT NULL COMMENT 'Tipo de habitación seleccionada',
    COSTO_POR_NOCHE DECIMAL(10,2) NOT NULL COMMENT 'Costo por noche de la habitación',
    NOCHES INT NOT NULL COMMENT 'Cantidad de noches de estadía',
    SUBTOTAL DECIMAL(10,2) NOT NULL COMMENT 'Subtotal antes de impuestos',
    IVA DECIMAL(10,2) NOT NULL COMMENT 'Impuesto aplicado al subtotal',
    TOTAL DECIMAL(10,2) NOT NULL COMMENT 'Total a pagar',
    FECHA_REGISTRO TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora en la que se realizó el check-in',
    PRIMARY KEY (ID_CHECKIN)
);
*/
