-- Script DDL adaptado para MySQL Workbench 8.0

CREATE TABLE Usuarios (
    ID_USUARIO INT NOT NULL AUTO_INCREMENT,
    CORREO VARCHAR(50) NOT NULL,
    CONTRASEÑA VARCHAR(64) NOT NULL,
    PERFIL CHAR(1) NOT NULL,
    ESTATUS CHAR(1) NOT NULL,
    ALTA_REG TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ID_USUARIO)
);

-- Comentarios sobre las columnas
ALTER TABLE Usuarios 
    MODIFY COLUMN ID_USUARIO INT NOT NULL COMMENT 'Identificador único del usuario';

ALTER TABLE Usuarios 
    MODIFY COLUMN CORREO VARCHAR(50) NOT NULL COMMENT 'Correo personal del usuario';

ALTER TABLE Usuarios 
    MODIFY COLUMN CONTRASEÑA VARCHAR(64) NOT NULL COMMENT 'Contraseña del usuario';

ALTER TABLE Usuarios 
    MODIFY COLUMN PERFIL CHAR(1) NOT NULL COMMENT 'Rol del usuario en el sistema:\n1 -> Admin\n2 -> Recepcionista\n3 -> Mantenimiento\n4 -> Cliente';

ALTER TABLE Usuarios 
    MODIFY COLUMN ALTA_REG TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Día en el que se dio de alta el usuario';
