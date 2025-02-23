import React, { useState, useEffect } from 'react';
import './dashboard.css';
import logo from './logo.png'
const Dashboard = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('CORREO'); // Filtro por defecto
  const [busqueda, setBusqueda] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  const [botonActivo, setBotonActivo] = useState(null); // null, 'inactivos' o 'todos'
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
        setUsuarios(data);
    } catch (error) {
        console.error('Error:', error);
    }
};
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
};


/*
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
*/
const handleEliminar = async (correo) => {
  try {
    const response = await fetch(`http://localhost:3001/users/${correo}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    console.log('Respuesta del servidor:', data);
    if (!response.ok) {
      throw new Error(data.error || 'Error al deshabilitar el usuario');
    }
    mostrarModal('Usuario deshabilitado correctamente');
    obtenerUsuarios();
  } catch (error) {
    console.error('Error al deshabilitar usuario:', error);
    mostrarModal('Error al deshabilitar el usuario');
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

const handleHabilitar = async (correo) => {
  try {
    const response = await fetch(`http://localhost:3001/users/habilitar/${correo}`, {
      method: 'PUT',
    });

    const data = await response.json();
    console.log('Respuesta del servidor:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Error al habilitar el usuario');
    }

    obtenerUsuarios(); // Recargar la lista de usuarios
    mostrarModal('Usuario habilitado exitosamente');
  } catch (error) {
    console.error('Error al habilitar usuario:', error);
    mostrarModal('Error al habilitar el usuario');
  }
};

  

const handleEliminarDesdeFormulario = async () => {
  try {
    if (usuarioSeleccionado) {
      await handleEliminar(usuarioSeleccionado.CORREO); // Llama a handleEliminar
      mostrarModal('Usuario deshabilitado correctamente'); // Muestra el modal
    }
  } catch (error) {
    console.error('Error al deshabilitar usuario:', error);
    mostrarModal('Error al deshabilitar el usuario');
  } finally {
    // Limpiar el formulario y deseleccionar el usuario
    setUsuarioSeleccionado(null);
    setFormData({ CORREO: '', CONTRASEÑA: '', PERFIL: '', ESTATUS: '', ALTA_REG: '' });
  }
};

const handleLimpiarFormulario = () => {
    setFormData({ CORREO: '', CONTRASEÑA: '', PERFIL: '', ESTATUS: '', ALTA_REG: '' });
    setUsuarioSeleccionado(null);
};
  
  const usuariosFiltrados = usuarios
  .filter(user => {
    if (mostrarTodos) {
      return true; // Mostrar todos los usuarios
    } else if (mostrarInactivos) {
      return user.ESTATUS === '2'; // Mostrar solo inactivos
    } else {
      return user.ESTATUS === '1'; // Mostrar solo activos
    }
  })
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
              onClick={() => {
                  setMostrarInactivos(!mostrarInactivos);
                  setBotonActivo(mostrarInactivos ? null : 'inactivos'); // Activa este botón
                  setMostrarTodos(false); // Desactiva el botón de "Mostrar todos"
                  }}
                className={botonActivo === 'inactivos' ? 'filtro-activo' : ''}
              >

              {mostrarInactivos ? 'MOSTRAR ACTIVOS' : 'MOSTRAR INACTIVOS'}
            </button>
            <button 
             onClick={() => {
                setMostrarTodos(!mostrarTodos);
                setBotonActivo(mostrarTodos ? null : 'todos'); // Activa este botón
                setMostrarInactivos(false); // Desactiva el botón de "Mostrar inactivos"
                }}
              className={botonActivo === 'todos' ? 'filtro-activo' : ''}
              >
                MOSTRAR TODOS LOS USUARIOS
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
                    <button
                      className="delete-button"
                      onClick={(e) => {
                      e.stopPropagation();
                      if (user.ESTATUS === '2') {
                        handleHabilitar(user.CORREO); // Función para habilitar usuarios inactivos
                      } else {
                        handleEliminar(user.CORREO); // Función para eliminar usuarios activos
                      }
                    }}
                    >
                      {user.ESTATUS === '2' ? 'Habilitar' : 'Eliminar'}
                    </button>
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
              <button
                className="delete-button"
                onClick={() => {
                  if (usuarioSeleccionado.ESTATUS === '2') {
                    handleHabilitar(usuarioSeleccionado.CORREO); // Función para habilitar usuarios inactivos
                  } else {
                    handleEliminarDesdeFormulario(); // Función para eliminar usuarios activos
                  }
                }}
              >
      {usuarioSeleccionado.ESTATUS === '2' ? 'Habilitar' : 'Eliminar'}
    </button>
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