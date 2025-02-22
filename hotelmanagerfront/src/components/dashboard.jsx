import React, { useState, useEffect } from 'react';
import './dashboard.css';
import logo from './logo.png'
const Dashboard = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('CORREO'); // Filtro por defecto
  const [busqueda, setBusqueda] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [formData, setFormData] = useState({
    
    CORREO: '',
    CONTRASEÑA: '',
    PERFIL: '',
    ESTATUS: '',
    ALTA_REG: ''
  });
    const [modalMensaje, setModalMensaje] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const mostrarModal = (mensaje) => {
    setModalMensaje(mensaje);
    setModalVisible(true);
    setTimeout(() => {
      setModalVisible(false);
    }, 1500);
  };

  const obtenerUsuarios = async () => {
    try {
        const response = await fetch('http://localhost:3001/users/');
        if (!response.ok) {
            throw new Error('Error obteniendo usuarios');
        }
        let data = await response.json();

        // Filtrar solo usuarios con ESTATUS = 1
        //data = data.filter(user => user.ESTATUS === '1');

        //console.log('Usuarios activos:', data);
        setUsuarios(data);
    } catch (error) {
        console.error('Error:', error);
    }
};
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
};


  const handleEliminar = async (correo) => {
    try {
        const response = await fetch(`http://localhost:3001/users/${correo}`, { method: 'DELETE' });

        const data = await response.json();
        console.log('Respuesta del servidor:', data);

        obtenerUsuarios(); // Recargar la lista para reflejar cambios
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
    }
};



  const handleSeleccionarUsuario = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setFormData({
        CORREO: usuario?.CORREO || '',
        CONTRASEÑA: '',
        PERFIL: usuario?.PERFIL || '',
        ESTATUS: usuario?.ESTATUS || '',
        ALTA_REG: usuario?.ALTA_REG || ''
    });
};

const validarCorreo = async () => {
    try {
        const response = await fetch(`http://localhost:3001/users/validar/${encodeURIComponent(formData.CORREO)}`);

        if (!response.ok) {
            throw new Error(`Error en validación: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("🔎 Respuesta de validación:", data);
        return data.correoExiste;
    } catch (error) {
        console.error("❌ Error al validar correo:", error);
        return false;
    }
};

const handleRegistrar = async () => {
    if (!formData.CORREO || !formData.PERFIL || !formData.ESTATUS) {
        mostrarModal('Ningún campo puede estar vacío');
        return;
    }

    const correoRepetido = await validarCorreo();
    if (correoRepetido) {
        mostrarModal('Correo repetido');
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/users/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                correo: formData.CORREO,
                contraseña: formData.CONTRASEÑA,
                perfil: formData.PERFIL,
                estatus: formData.ESTATUS
            }),
        });

        const data = await response.json();
        console.log('📩 Respuesta del servidor:', data);

        if (!response.ok) {
            throw new Error(`Error: ${data.error}`);
        }

        obtenerUsuarios();
        setFormData({ CORREO: '', CONTRASEÑA: '', PERFIL: '', ESTATUS: '', ALTA_REG: '' });

    } catch (error) {
        mostrarModal('Error de formato en algún campo');
        console.error("❌ Error al registrar usuario:", error);
    }
};
  const handleActualizar = async () => {
    if (!usuarioSeleccionado) return;
    if (!formData.CORREO || !formData.PERFIL || !formData.ESTATUS) {
        mostrarModal('Ningún campo puede estar vacío');
        return;
    }

    console.log('Datos enviados para actualización:', formData);

    try {
        const response = await fetch(`http://localhost:3001/users/${usuarioSeleccionado.CORREO}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                correoNuevo: formData.CORREO,  // Nuevo campo
                contraseña: formData.CONTRASEÑA, 
                perfil: formData.PERFIL,
                estatus: formData.ESTATUS
            }),
        });

        const data = await response.json();
        console.log('Respuesta del servidor:', data);

        if (!response.ok) {
            throw new Error(data.error || 'Error en la actualización');
        }

        obtenerUsuarios();  // Recargar la lista de usuarios actualizada
        setUsuarioSeleccionado(null);
        setFormData({ CORREO: '', CONTRASEÑA: '', PERFIL: '', ESTATUS: '', ALTA_REG: '' });
        mostrarModal('Usuario actualizado exitosamente');

    } catch (error) {
        if (error.message.includes('correo')) {
            mostrarModal('El correo ya está en uso');
        } else {
            mostrarModal('Error de formato en algún campo');
        }
        console.error('Error al actualizar usuario:', error);
    }
};


/*
  const handleActualizar = async () => {
    if (!usuarioSeleccionado) return;
    if (!formData.CORREO || !formData.PERFIL || !formData.ESTATUS) {
        mostrarModal('Ningún campo puede estar vacío');
        return;
    }

    const response = await fetch(`http://localhost:3001/users/validar/${formData.CORREO}`);
    const data = await response.json();

    if (data.correoExiste && usuarioSeleccionado.CORREO !== formData.CORREO) {
        mostrarModal('Correo repetido');
        return;
    }

    console.log('Datos enviados para actualización:', formData);

    try {
        const response = await fetch(`http://localhost:3001/users/${usuarioSeleccionado?.CORREO}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                correo: formData.CORREO,
                contraseña: formData.CONTRASEÑA, // Se envía solo si se quiere actualizar
                perfil: formData.PERFIL,
                estatus: formData.ESTATUS
            }),
        });

        const data = await response.json();
        console.log('Respuesta del servidor:', data);

        if (!response.ok) {
            throw new Error(`Error: ${data.error}`);
        }

        obtenerUsuarios();
        setUsuarioSeleccionado(null);
        setFormData({ CORREO: '', CONTRASEÑA: '', PERFIL: '', ESTATUS: '', ALTA_REG: '' });
        mostrarModal('Usuario actualizado exitosamente');

    } catch (error) {
        mostrarModal('Error de formato en algún campo');
        console.error('Error al actualizar usuario:', error);
    }
};
*/

  const handleEliminarDesdeFormulario = async () => {
    await handleEliminar(usuarioSeleccionado?.CORREO);
    setUsuarioSeleccionado(null);
    setFormData({ CORREO: '', CONTRASEÑA: '', PERFIL: '', ESTATUS: '', ALTA_REG: '' });
};


  const handleLimpiarFormulario = () => {
    setFormData({ CORREO: '', CONTRASEÑA: '', PERFIL: '', ESTATUS: '', ALTA_REG: '' });
    setUsuarioSeleccionado(null);
};

  /*
  const usuariosFiltrados = usuarios.filter((user) =>
    user?.[filtro]?.toString().toLowerCase().includes(busqueda.toLowerCase())
  );
  */
  const usuariosFiltrados = usuarios
  .filter(user => mostrarInactivos ? user.ESTATUS === '2' : user.ESTATUS === '1')
  .filter(user => user?.[filtro]?.toString().toLowerCase().includes(busqueda.toLowerCase()));


  return (
    <div>
    <h1 className="titulo-dashboard"> GESTOR DE USUARIOS </h1>
    {/* <img src={logo} alt="Logo del Hotel" className="logo" />*/}
    <div className="dashboard-container">
    {modalVisible && (
        <div className="modal">
          <p>{modalMensaje}</p>
        </div>
      )}   
      <div className="panel-izquierdo"style={{ flex: 2.5, marginLeft: '-200px' }}>
        <div className="filtros-container">
          <h3>Filtrar Búsqueda</h3>
          <div className="filtros">
            {['CORREO', 'PERFIL', 'ESTATUS', 'ALTA_REG'].map((campo) => (
              <button 
                key={campo} 
                onClick={() => setFiltro(campo)} 
                className={filtro === campo ? 'filtro-activo' : ''}
              >
                {campo.toUpperCase()}
              </button>
            ))}
            <button 
              onClick={() => setMostrarInactivos(!mostrarInactivos)} 
              className={mostrarInactivos ? 'filtro-activo' : ''}
            >
    {mostrarInactivos ? 'MOSTRAR ACTIVOS' : 'MOSTRAR INACTIVOS'}
  </button>
          </div>
        </div>
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <table>
          <thead>
            <tr> 
              <th>Correo</th>
              <th>Perfil</th>
              <th>Estatus</th>
              <th>Alta Reg</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length > 0 ? (
              usuariosFiltrados.map((user) => (
                <tr key={user.CORREO} onClick={() => handleSeleccionarUsuario(user)}>
                 
                  <td>{user.CORREO}</td>
                  <td>{user.PERFIL}</td>
                  <td>{user.ESTATUS}</td>
                  <td>{user.ALTA_REG}</td>
                  <td>
                    <button className="delete-button" onClick={(e) => { e.stopPropagation(); handleEliminar(user.CORREO); }}>Eliminar</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>No hay usuarios disponibles</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="panel-derecho" style={{ flex: 1, marginRight: '280px' }}>
        <h2>{usuarioSeleccionado ? 'Editar Usuario' : 'Registrar Usuario'}</h2>
        
        <input type="text" name="CORREO" value={formData.CORREO} onChange={handleInputChange} placeholder="Correo" />
        <input type="password" name="CONTRASEÑA" value={formData.CONTRASEÑA} onChange={handleInputChange} placeholder="Contraseña" />
        {/* <input type="text" name="PERFIL" value={formData.PERFIL} onChange={handleInputChange} placeholder="Perfil" /> */}
        <select name="PERFIL" value={formData.PERFIL} onChange={handleInputChange}>
            <option value="">Seleccione un perfil</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
        </select>
        {/* <input type="text" name="ESTATUS" value={formData.ESTATUS} onChange={handleInputChange} placeholder="Estatus" /> */}
        <select name="ESTATUS" value={formData.ESTATUS} onChange={handleInputChange}>
            <option value="">Seleccione un estatus</option>
            <option value="1">1</option>
            <option value="2">2</option>
        </select>

        {/* <input type="text" name="ALTA_REG" value={formData.ALTA_REG} onChange={handleInputChange} placeholder="Alta Registro" disabled /> */}
        <div className="button-group">
          {usuarioSeleccionado ? (
            <>
              <button className="update-button" onClick={handleActualizar}>Actualizar</button>
              <button className="delete-button" onClick={handleEliminarDesdeFormulario}>Eliminar</button>
            </>
          ) : (
            <button className="register-button" onClick={handleRegistrar}>Registrar</button>
          )}
          <button className="clear-button" onClick={handleLimpiarFormulario}>Limpiar</button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Dashboard;