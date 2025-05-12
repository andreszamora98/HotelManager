
-- ALTER TABLE usuarios 
-- MODIFY ALTA_REG TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
-- DESC Usuarios;
-- usuariosusuarios INSERT INTO Usuarios (CORREO, CONTRASEÑA, PERFIL, ESTATUS, ALTA_REG) 
-- VALUES ('test@ejemplo.com', SHA2('password123', 256), 'A', '2', NOW());
-- ALTER TABLE Usuarios MODIFY COLUMN ID_USUARIO INT AUTO_INCREMENT PRIMARY KEY;

-- ALTER TABLE Usuarios MODIFY COLUMN ID_USUARIO INT NOT NULL AUTO_INCREMENT PRIMARY KEY;
-- DELETE FROM usuarios;
-- ALTER TABLE Usuarios DROP PRIMARY KEY;
-- ALTER TABLE Usuarios MODIFY COLUMN ID_USUARIO INT NOT NULL AUTO_INCREMENT PRIMARY KEY;
-- ALTER TABLE Usuarios AUTO_INCREMENT = 1;

/*
INSERT INTO usuarios (`CORREO`,`CONTRASEÑA`,`PERFIL`,`ESTATUS`,`ALTA_REG`) VALUES ('uno@ejemplo.com','1','A','1', NOW());
INSERT INTO usuarios (`CORREO`,`CONTRASEÑA`,`PERFIL`,`ESTATUS`,`ALTA_REG`) VALUES ('dos@ejemplo.com','2','A','1',NOW());
INSERT INTO usuarios (`CORREO`,`CONTRASEÑA`,`PERFIL`,`ESTATUS`,`ALTA_REG`) VALUES ('tres@ejemplo.com','3','A','2',NOW());
INSERT INTO usuarios (`CORREO`,`CONTRASEÑA`,`PERFIL`,`ESTATUS`,`ALTA_REG`) VALUES ('cuatro@ejemplo.com','4','B','1',NOW());
INSERT INTO usuarios (`CORREO`,`CONTRASEÑA`,`PERFIL`,`ESTATUS`,`ALTA_REG`) VALUES ('cinco@ejemplo.com','5','B','1',NOW());
*/


-- SHOW CREATE TABLE usuarios;
-- ALTER TABLE usuarios MODIFY ID_USUARIO INT NOT NULL;
-- INSERT INTO usuarios (`ID_USUARIO`, `CORREO`,`CONTRASEÑA`,`PERFIL`,`ESTATUS`,`ALTA_REG`) VALUES (1, 'uno@ejemplo.com','1','A','1', NOW());
-- ALTER TABLE Usuarios MODIFY COLUMN ESTATUS CHAR(1) NOT NULL DEFAULT '1';

-- Agregar nuevas columnas para facturación
/*
ALTER TABLE Usuarios 
ADD COLUMN NOMBRE_CLIENTE VARCHAR(100) NOT NULL COMMENT 'Nombre completo del cliente',
ADD COLUMN RFC VARCHAR(13) NOT NULL COMMENT 'Registro Federal de Contribuyentes del cliente',
ADD COLUMN DIRECCION VARCHAR(255) NOT NULL COMMENT 'Dirección del cliente';
*/

-- Primeros 5 inserts
/*
INSERT INTO Usuarios (`CORREO`, `CONTRASEÑA`, `PERFIL`, `ESTATUS`, `ALTA_REG`, `NOMBRE_CLIENTE`, `RFC`, `DIRECCION`) 
VALUES 
('uno@ejemplo.com', '1', 'A', '1', NOW(), 'Andrés Zamora Nieves', 'JUPE850101ABC', 'Paseos de San Miguel, Querétaro');

INSERT INTO Usuarios (`CORREO`, `CONTRASEÑA`, `PERFIL`, `ESTATUS`, `ALTA_REG`, `NOMBRE_CLIENTE`, `RFC`, `DIRECCION`) 
VALUES 
('dos@ejemplo.com', '2', 'A', '1', NOW(), 'Jacinto Eliceo', 'MALO920202XYZ', 'Juriquilla 742, Querétaro');

INSERT INTO Usuarios (`CORREO`, `CONTRASEÑA`, `PERFIL`, `ESTATUS`, `ALTA_REG`, `NOMBRE_CLIENTE`, `RFC`, `DIRECCION`) 
VALUES 
('tres@ejemplo.com', '3', 'A', '2', NOW(), 'Daimery Quintero', 'CARA931010DEF', 'Blvd. Reforma 456, Querétaro');

INSERT INTO Usuarios (`CORREO`, `CONTRASEÑA`, `PERFIL`, `ESTATUS`, `ALTA_REG`, `NOMBRE_CLIENTE`, `RFC`, `DIRECCION`) 
VALUES 	
('cuatro@ejemplo.com', '4', 'B', '1', NOW(), 'Fernanda Torres', 'FETO990505GHI', 'Av. Revolución 321, Puebla');

INSERT INTO Usuarios (`CORREO`, `CONTRASEÑA`, `PERFIL`, `ESTATUS`, `ALTA_REG`, `NOMBRE_CLIENTE`, `RFC`, `DIRECCION`) 
VALUES 
('cinco@ejemplo.com', '5', 'B', '1', NOW(), 'Ricardo Sánchez', 'RISA880808JKL', 'Calle Central 789, Querétaro');
*/

-- Segundos 5 inserts
/*
INSERT INTO Usuarios (`CORREO`, `CONTRASEÑA`, `PERFIL`, `ESTATUS`, `ALTA_REG`, `NOMBRE_CLIENTE`, `RFC`, `DIRECCION`) 
VALUES 
('seis@ejemplo.com', '6', 'B', '1', NOW(), 'Gabriela Montiel', 'GAMO940707MNO', 'Av. Universidad 120, Querétaro');

INSERT INTO Usuarios (`CORREO`, `CONTRASEÑA`, `PERFIL`, `ESTATUS`, `ALTA_REG`, `NOMBRE_CLIENTE`, `RFC`, `DIRECCION`) 
VALUES 
('siete@ejemplo.com', '7', 'C', '2', NOW(), 'Ernesto Ramírez', 'ERRA850315PQR', 'Calle 16 de Septiembre 301, Monterrey');

INSERT INTO Usuarios (`CORREO`, `CONTRASEÑA`, `PERFIL`, `ESTATUS`, `ALTA_REG`, `NOMBRE_CLIENTE`, `RFC`, `DIRECCION`) 
VALUES 
('ocho@ejemplo.com', '8', 'C', '1', NOW(), 'Paola García', 'PAGA920820STU', 'Zona Centro 505, CDMX');

INSERT INTO Usuarios (`CORREO`, `CONTRASEÑA`, `PERFIL`, `ESTATUS`, `ALTA_REG`, `NOMBRE_CLIENTE`, `RFC`, `DIRECCION`) 
VALUES 
('nueve@ejemplo.com', '9', 'A', '2', NOW(), 'Luis Fernando Robles', 'LURO990101VWX', 'Col. Los Pinos 145, Guadalajara');

INSERT INTO Usuarios (`CORREO`, `CONTRASEÑA`, `PERFIL`, `ESTATUS`, `ALTA_REG`, `NOMBRE_CLIENTE`, `RFC`, `DIRECCION`) 
VALUES 
('diez@ejemplo.com', '10', 'B', '1', NOW(), 'Verónica Salgado', 'VESA860512YZA', 'Paseo de la Reforma 980, CDMX');
*/
/*
INSERT INTO Usuarios (`CORREO`, `CONTRASEÑA`, `PERFIL`, `ESTATUS`, `ALTA_REG`, `NOMBRE_CLIENTE`, `RFC`, `DIRECCION`) 
VALUES 
('once@ejemplo.com', '11', 'D', '1', NOW(), 'María de la Luz Herrera', 'MALH750303JKL', 'Av. Universidad 230, Monterrey');

INSERT INTO Usuarios (`CORREO`, `CONTRASEÑA`, `PERFIL`, `ESTATUS`, `ALTA_REG`, `NOMBRE_CLIENTE`, `RFC`, `DIRECCION`) 
VALUES 
('doce@ejemplo.com', '12', 'D', '1', NOW(), 'Jorge Ramírez Olvera', 'JORA890715XYZ', 'Calle Independencia 789, Puebla');
*/

 SELECT * from usuarios


