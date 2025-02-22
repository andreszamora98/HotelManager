-- Generado por Oracle SQL Developer Data Modeler 24.3.1.351.0831
--   en:        2025-02-09 14:48:48 CST
--   sitio:      Oracle Database 21c
--   tipo:      Oracle Database 21c



-- predefined type, no DDL - MDSYS.SDO_GEOMETRY

-- predefined type, no DDL - XMLTYPE

CREATE TABLE Usuarios 
    ( 
     ID_USUARIO INTEGER  NOT NULL , 
     CORREO     VARCHAR2 (50)  NOT NULL , 
     CONTRASEÑA VARCHAR2 (64)  NOT NULL , 
     PERFIL     VARCHAR2 (1)  NOT NULL , 
     ESTATUS    VARCHAR2 (1)  NOT NULL , 
     ALTA_REG   TIMESTAMP WITH LOCAL TIME ZONE 
    ) 
;

COMMENT ON COLUMN Usuarios.ID_USUARIO IS 'Identificador único del usuario' 
;

COMMENT ON COLUMN Usuarios.CORREO IS 'Correo personal del usuario' 
;

COMMENT ON COLUMN Usuarios.CONTRASEÑA IS 'Contraseña del usuario' 
;

COMMENT ON COLUMN Usuarios.PERFIL IS 'Rol del usuario en el sistema:
1 -> Admin
2 -> Recepcionista
3 -> Mantenimiento
4 -> Cliente' 
;

COMMENT ON COLUMN Usuarios.ALTA_REG IS 'Día en el que se dio de alta el usuario' 
;

ALTER TABLE Usuarios 
    ADD CONSTRAINT Usuarios_PK PRIMARY KEY ( ID_USUARIO ) ;



-- Informe de Resumen de Oracle SQL Developer Data Modeler: 
-- 
-- CREATE TABLE                             1
-- CREATE INDEX                             0
-- ALTER TABLE                              1
-- CREATE VIEW                              0
-- ALTER VIEW                               0
-- CREATE PACKAGE                           0
-- CREATE PACKAGE BODY                      0
-- CREATE PROCEDURE                         0
-- CREATE FUNCTION                          0
-- CREATE TRIGGER                           0
-- ALTER TRIGGER                            0
-- CREATE COLLECTION TYPE                   0
-- CREATE STRUCTURED TYPE                   0
-- CREATE STRUCTURED TYPE BODY              0
-- CREATE CLUSTER                           0
-- CREATE CONTEXT                           0
-- CREATE DATABASE                          0
-- CREATE DIMENSION                         0
-- CREATE DIRECTORY                         0
-- CREATE DISK GROUP                        0
-- CREATE ROLE                              0
-- CREATE ROLLBACK SEGMENT                  0
-- CREATE SEQUENCE                          0
-- CREATE MATERIALIZED VIEW                 0
-- CREATE MATERIALIZED VIEW LOG             0
-- CREATE SYNONYM                           0
-- CREATE TABLESPACE                        0
-- CREATE USER                              0
-- 
-- DROP TABLESPACE                          0
-- DROP DATABASE                            0
-- 
-- REDACTION POLICY                         0
-- 
-- ORDS DROP SCHEMA                         0
-- ORDS ENABLE SCHEMA                       0
-- ORDS ENABLE OBJECT                       0
-- 
-- ERRORS                                   0
-- WARNINGS                                 0
