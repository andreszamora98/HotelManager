CREATE OR REPLACE TRIGGER before_inserts_usuario
BEFORE INSERT ON usuarios
FOR EACH ROW
BEGIN
    :NEW.contraseña := STANDARD_HASH(:NEW.contraseña, 'SHA256');
END;
/
