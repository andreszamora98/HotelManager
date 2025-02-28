import React, { useState, useEffect } from 'react';
import './dashboard.css';
import Sidebar from './sidebar';
import { FaSearch } from "react-icons/fa";
import logo from './logo.png'
import Footer from './footer'
const Dashboard = () => {

  const [selectedOption, setSelectedOption] = useState("inicio");

  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('CORREO'); // Filtro por defecto
  const [busqueda, setBusqueda] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [errors, setErrors] = useState({}); // Estado para los errores

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

  // Esperar más tiempo para que la animación de salida se complete
  setTimeout(() => {
    setModalVisible(false);
  }, 1500); // Ajustado para coincidir con la animación
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
const validateFields = () => {
  const newErrors = {};
  if (!formData.CORREO.trim()) newErrors.CORREO = '*Campo obligatorio*';
  if (!formData.CONTRASEÑA.trim()) newErrors.CONTRASEÑA = '*Campo obligatorio*';
  if (!formData.PERFIL) newErrors.PERFIL = '*Campo obligatorio*';
  if (!formData.ESTATUS) newErrors.ESTATUS = '*Campo obligatorio*';

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0; // Retorna true si no hay errores
};

const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData({ ...formData, [name]: value });

  // Si el usuario empieza a escribir, eliminar el error
  if (value.trim() !== '') {
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  }
};

// Validar si el campo está vacío cuando el usuario sale del input
const handleBlur = (e) => {
  const { name, value } = e.target;
  if (value.trim() === '') {
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '*Campo obligatorio*' }));
  }
};

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
    if (!validateFields()) {
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
        console.log(' Respuesta del servidor:', data);

        if (!response.ok) {
            throw new Error(`Error: ${data.error}`);
        }

        obtenerUsuarios();
        setFormData({ CORREO: '', CONTRASEÑA: '', PERFIL: '', ESTATUS: '', ALTA_REG: '' });
        setErrors({}); // Limpiar errores después del registro exitoso
        mostrarModal('Usuario registrado exitosamente');

    } catch (error) {
        mostrarModal('Error de formato en algún campo');
        console.error(" Error al registrar usuario:", error);
    }
};



const handleActualizar = async () => {
    if (!usuarioSeleccionado) return;

    if (!validateFields()) {
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
        setErrors({}); // Limpiar errores después de la actualización exitosa
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
    <Footer title="GESTOR DE USUARIOS" />
    {/* <img src={logo} alt="Logo del Hotel" className="logo" />*/}
    <div className="dashboard-container">
     <Sidebar />
      <div className="content">
         {/* <h2>Bienvenido al Dashboard</h2> */}
      </div>
    {modalVisible && (
        <div className="modal">
          <p>{modalMensaje}</p>
        </div>
      )}   
      <div className="panel-izquierdo"style={{ flex: 2.5, marginLeft: '-150px' }}>
        <div className="filtros-container">
          <h3>Filtrar Búsqueda</h3>
          <div className="filtros">
            {['CORREO', 'PERFIL', 'ESTATUS', 'ALTA_REG'].map((campo) => (
              <button 
                key={campo} 
                onClick={() => setFiltro(campo)} 
                className={filtro === campo ? 'filtro-activo' : ''}
              >
                {campo === 'ALTA_REG' ? 'FECHA DE REGISTRO' : campo.toUpperCase()}
                {/*{campo.toUpperCase()}*/}
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
        <div className="search-container">
  <FaSearch className="search-icon" />
  <input 
    type="text" 
    placeholder="Buscar..." 
    value={busqueda} 
    onChange={(e) => setBusqueda(e.target.value)}
  />
</div>
        <table>
          <thead>
            <tr> 
              <th>Correo</th>
              <th>Perfil</th>
              <th>Estatus</th>
              <th>Fecha de registro</th>
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
        
        {/* Campo de CORREO */}
  <div className="input-container">
    <input 
      type="text" 
      name="CORREO" 
      value={formData.CORREO} 
      onChange={handleInputChange} 
      onBlur={handleBlur} 
      placeholder="Correo" 
      className={errors.CORREO ? 'error-input' : ''}
    />
    {errors.CORREO && <p className="error-text">{errors.CORREO}</p>}
  </div>

  {/* Campo de CONTRASEÑA */}
  <div className="input-container">
    <input 
      type="password" 
      name="CONTRASEÑA" 
      value={formData.CONTRASEÑA} 
      onChange={handleInputChange} 
      onBlur={handleBlur} 
      placeholder="Contraseña" 
      className={errors.CONTRASEÑA ? 'error-input' : ''}
    />
    {errors.CONTRASEÑA && <p className="error-text">{errors.CONTRASEÑA}</p>}
  </div>

  {/* Campo de PERFIL */}
  <div className="input-container">
    <select 
      name="PERFIL" 
      value={formData.PERFIL} 
      onChange={handleInputChange} 
      onBlur={handleBlur} 
      className={errors.PERFIL ? 'error-input' : ''}
    >
      <option value="">Seleccione un perfil</option>
      <option value="A">A</option>
      <option value="B">B</option>
      <option value="C">C</option>
    </select>
    {errors.PERFIL && <p className="error-text">{errors.PERFIL}</p>}
  </div>

  {/* Campo de ESTATUS */}
  <div className="input-container">
    <select 
      name="ESTATUS" 
      value={formData.ESTATUS} 
      onChange={handleInputChange} 
      onBlur={handleBlur} 
      className={errors.ESTATUS ? 'error-input' : ''}
    >
      <option value="">Seleccione un estatus</option>
      <option value="1">1</option>
      <option value="2">2</option>
    </select>
    {errors.ESTATUS && <p className="error-text">{errors.ESTATUS}</p>}
  </div>

        {/* <input type="text" name="ALTA_REG" value={formData.ALTA_REG} onChange={handleInputChange} placeholder="Alta Registro" disabled /> */}
        <div className="button-group">
  {usuarioSeleccionado ? (
    <>
      <button 
        className="update-button" 
        onClick={() => {
          if (validateFields()) {
            handleActualizar();
          } else {
            mostrarModal('Ningún campo puede estar vacío');
          }
        }}
      >
        Actualizar
      </button>

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
    <button 
      className="register-button" 
      onClick={() => {
        if (validateFields()) {
          handleRegistrar();
        } else {
          mostrarModal('Ningún campo puede estar vacío');
        }
      }}
    >
      Registrar
    </button>
  )}
  <button className="clear-button" onClick={handleLimpiarFormulario}>Limpiar</button>
</div>

      </div>
    </div>
    </div>
  );
};

export default Dashboard;