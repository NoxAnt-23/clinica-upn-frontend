import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [vistaActual, setVistaActual] = useState('panel');

  // --- ESTADOS PARA MODALES Y DATOS DINÁMICOS ---
  const [isModalPacienteOpen, setIsModalPacienteOpen] = useState(false);
  const [isModalPersonalOpen, setIsModalPersonalOpen] = useState(false);

  // Estados para saber si estamos editando
  const [isEditandoMedico, setIsEditandoMedico] = useState(false);
  const [idMedicoEditar, setIdMedicoEditar] = useState(null);
  const [isEditandoPaciente, setIsEditandoPaciente] = useState(false);
  const [idPacienteEditar, setIdPacienteEditar] = useState(null);

  // Estados vacíos que se llenarán con la base de datos
  const [pacientes, setPacientes] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [citasTotales, setCitasTotales] = useState([]);

  const [nuevoPaciente, setNuevoPaciente] = useState({ dni: '', nombres: '', apellidos: '', telefono: '', correo: '' });

  const [nuevoMedico, setNuevoMedico] = useState({
    nombre: '',
    apellido: '',
    especialidad: 'Medicina General',
    consultorio: '',
    correo: '',
    password: ''
  });

  // --- FUNCIONES PARA TRAER DATOS DEL BACKEND ---
  const cargarPacientes = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/admin/pacientes');
      if (res.ok) setPacientes(await res.json());
    } catch (error) { console.error("Error al cargar pacientes", error); }
  };

  const cargarPersonal = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/admin/personal');
      if (res.ok) setPersonal(await res.json());
    } catch (error) { console.error("Error al cargar personal", error); }
  };

  const cargarCitas = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/admin/citas');
      if (res.ok) setCitasTotales(await res.json());
    } catch (error) { console.error("Error al cargar citas", error); }
  };

  useEffect(() => {
    cargarPacientes();
    cargarPersonal();
    cargarCitas();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('usuarioActual');
    navigate('/');
  };

  // --- HANDLERS PARA GUARDAR DATOS ---
  const handleGuardarPaciente = async (e) => {
    e.preventDefault();
    const url = isEditandoPaciente
      ? `http://localhost:8080/api/admin/pacientes/${idPacienteEditar}`
      : 'http://localhost:8080/api/admin/pacientes';
    const method = isEditandoPaciente ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoPaciente)
      });

      if (res.ok) {
        alert(`¡Paciente ${isEditandoPaciente ? 'actualizado' : 'registrado'} exitosamente!`);
        setIsModalPacienteOpen(false);
        setIsEditandoPaciente(false);
        setIdPacienteEditar(null);
        setNuevoPaciente({ dni: '', nombres: '', apellidos: '', telefono: '', correo: '' });
        cargarPacientes();
      } else {
        alert(`Error al ${isEditandoPaciente ? 'actualizar' : 'registrar'} paciente.`);
      }
    } catch (error) { alert("Error de conexión"); }
  };

  // Función inteligente: Usa la nueva ruta para el registro y la anterior para editar
  const handleGuardarPersonal = async (e) => {
    e.preventDefault();
    const url = isEditandoMedico
      ? `http://localhost:8080/api/admin/personal/${idMedicoEditar}`
      : 'http://localhost:8080/api/admin/personal'; // Ruta corregida hacia tu MedicoController
    const method = isEditandoMedico ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoMedico)
      });

      if (res.ok) {
        alert(`¡Personal médico ${isEditandoMedico ? 'actualizado' : 'registrado'} exitosamente!`);
        cerrarModalPersonal();
        cargarPersonal();
      } else {
        alert(`Error al ${isEditandoMedico ? 'actualizar' : 'registrar'} personal.`);
      }
    } catch (error) { alert("Error de conexión con el backend"); }
  };

  // --- HANDLERS DE EDICIÓN Y ELIMINACIÓN ---
  const handleEliminarPersonal = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar a este médico? Esta acción no se puede deshacer.")) return;

    try {
      const res = await fetch(`http://localhost:8080/api/admin/personal/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert("Personal eliminado correctamente");
        cargarPersonal();
      } else {
        alert("Error al eliminar el registro.");
      }
    } catch (error) { console.error("Error:", error); }
  };

  const handleEditarPersonal = (medico) => {
    setIsEditandoMedico(true);
    setIdMedicoEditar(medico.id_personal_salud || medico.ID_PERSONAL_SALUD);

    setNuevoMedico({
      medico: medico.nombre || medico.NOMBRE || '',
      especialidad: medico.especialidad || medico.ESPECIALIDAD || 'Medicina General',
      consultorio: '',
      correo: medico.correo || '',
      password: '' 
    });

    setIsModalPersonalOpen(true);
  };

  const handleEliminarPaciente = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar a este paciente? Se borrarán también sus citas asociadas.")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/admin/pacientes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert("Paciente eliminado correctamente");
        cargarPacientes();
      } else {
        alert("Error al eliminar el paciente.");
      }
    } catch (error) { console.error("Error:", error); }
  };

  const handleEditarPaciente = (paciente) => {
    setIsEditandoPaciente(true);
    setIdPacienteEditar(paciente.id_paciente || paciente.ID_PACIENTE);

    setNuevoPaciente({
      dni: paciente.dni || paciente.DNI || '',
      nombres: paciente.nombre || paciente.NOMBRE || '',
      apellidos: paciente.apellido || paciente.APELLIDO || '',
      telefono: paciente.celular || paciente.CELULAR || '',
      correo: paciente.correo || paciente.CORREO || ''
    });

    setIsModalPacienteOpen(true);
  };

  const cerrarModalPersonal = () => {
    setIsModalPersonalOpen(false);
    setIsEditandoMedico(false);
    setIdMedicoEditar(null);
    setNuevoMedico({ medico: '', especialidad: 'Medicina General', consultorio: '', correo: '', password: '' });
  };

  // --- COMPONENTES INTERNOS ---

  const VistaPanel = () => (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-t-4 border-t-yellow-400">
          <h3 className="text-gray-500 text-sm font-bold mb-1">Pacientes Registrados</h3>
          <p className="text-3xl font-black text-gray-800">{pacientes.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-t-4 border-t-blue-400">
          <h3 className="text-gray-500 text-sm font-bold mb-1">Citas Programadas</h3>
          <p className="text-3xl font-black text-gray-800">{citasTotales.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-t-4 border-t-green-400">
          <h3 className="text-gray-500 text-sm font-bold mb-1">Personal Médico</h3>
          <p className="text-3xl font-black text-gray-800">{personal.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Panel Activo</h2>
        </div>
        <div className="p-8 text-center text-gray-500">
          <p>Selecciona una opción del menú lateral para gestionar los registros de la clínica.</p>
        </div>
      </div>
    </div>
  );

  const VistaPacientes = () => (
    <div className="animate-fade-in bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800">Gestión de Pacientes</h2>
        <button
          onClick={() => setIsModalPacienteOpen(true)}
          className="px-4 py-2 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 text-sm transition-all active:scale-95"
        >
          + Nuevo Paciente
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
              <th className="px-6 py-4 font-bold">DNI</th>
              <th className="px-6 py-4 font-bold">Nombres</th>
              <th className="px-6 py-4 font-bold">Apellidos</th>
              <th className="px-6 py-4 font-bold">Teléfono</th>
              <th className="px-6 py-4 font-bold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {pacientes.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No hay pacientes registrados.</td></tr>
            ) : (
              pacientes.map((paciente, idx) => (
                <tr key={paciente.id_paciente || idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{paciente.dni || paciente.DNI}</td>
                  <td className="px-6 py-4">{paciente.nombre || paciente.NOMBRE}</td>
                  <td className="px-6 py-4">{paciente.apellido || paciente.APELLIDO}</td>
                  <td className="px-6 py-4">{paciente.celular || paciente.CELULAR}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEditarPaciente(paciente)}
                      className="text-blue-600 hover:underline font-bold text-xs mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminarPaciente(paciente.id_paciente || paciente.ID_PACIENTE)}
                      className="text-red-600 hover:underline font-bold text-xs"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const VistaPersonal = () => (
    <div className="animate-fade-in bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800">Personal Médico</h2>
        <button
          onClick={() => {
            setIsEditandoMedico(false);
            setNuevoMedico({ medico: '', especialidad: 'Medicina General', consultorio: '', correo: '', password: '' });
            setIsModalPersonalOpen(true);
          }}
          className="px-4 py-2 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 text-sm transition-all active:scale-95"
        >
          + Agregar Personal
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
              <th className="px-6 py-4 font-bold">ID</th>
              <th className="px-6 py-4 font-bold">Médico</th>
              <th className="px-6 py-4 font-bold">Especialidad</th>
              <th className="px-6 py-4 font-bold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {personal.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No hay personal registrado.</td></tr>
            ) : (
              personal.map((medico, idx) => (
                <tr key={medico.id_personal_salud || idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{medico.id_personal_salud || medico.ID_PERSONAL_SALUD}</td>
                  <td className="px-6 py-4">{medico.nombre || medico.NOMBRE} {medico.apellido || medico.APELLIDO}</td>
                  <td className="px-6 py-4">{medico.especialidad || medico.ESPECIALIDAD}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEditarPersonal(medico)}
                      className="text-blue-600 hover:underline font-bold text-xs mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminarPersonal(medico.id_personal_salud || medico.ID_PERSONAL_SALUD)}
                      className="text-red-600 hover:underline font-bold text-xs"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const VistaCitas = () => (
    <div className="animate-fade-in bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800">Todas las Citas Programadas</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
              <th className="px-6 py-4 font-bold">ID Cita</th>
              <th className="px-6 py-4 font-bold">Fecha / Hora</th>
              <th className="px-6 py-4 font-bold">Modalidad</th>
              <th className="px-6 py-4 font-bold">Especialidad</th>
              <th className="px-6 py-4 font-bold">Estado</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {citasTotales.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No hay citas registradas.</td></tr>
            ) : (
              citasTotales.map((cita, idx) => (
                <tr key={cita.id_cita || idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">#{cita.id_cita || cita.ID_CITA}</td>
                  <td className="px-6 py-4">{cita.fecha || cita.FECHA} - {cita.hora || cita.HORA}</td>
                  <td className="px-6 py-4">{cita.modalidad || cita.MODALIDAD}</td>
                  <td className="px-6 py-4">{cita.especialidad || cita.ESPECIALIDAD}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${(cita.estado || cita.ESTADO) === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                      {cita.estado || cita.ESTADO || 'Pendiente'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContenido = () => {
    switch (vistaActual) {
      case 'panel': return <VistaPanel />;
      case 'pacientes': return <VistaPacientes />;
      case 'personal': return <VistaPersonal />;
      case 'citas': return <VistaCitas />;
      default: return <VistaPanel />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 relative">

      {/* --- MODAL: NUEVO PACIENTE --- */}
      {isModalPacienteOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-yellow-500 p-6 text-white text-center">
              <h3 className="text-xl font-bold">Registrar Nuevo Paciente</h3>
            </div>
            <form onSubmit={handleGuardarPaciente} className="p-8 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">DNI</label>
                <input
                  type="text" required maxLength="8"
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-yellow-500"
                  value={nuevoPaciente.dni}
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, dni: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombres</label>
                <input
                  type="text" required
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-yellow-500"
                  value={nuevoPaciente.nombres}
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, nombres: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Apellidos</label>
                <input
                  type="text" required
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-yellow-500"
                  value={nuevoPaciente.apellidos}
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, apellidos: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono / Celular</label>
                <input
                  type="text" required maxLength="9"
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-yellow-500"
                  value={nuevoPaciente.telefono}
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, telefono: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Correo</label>
                <input
                  type="email" required
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-yellow-500"
                  value={nuevoPaciente.correo}
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, correo: e.target.value })}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button" onClick={() => setIsModalPacienteOpen(false)}
                  className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 shadow-md transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: AGREGAR / EDITAR PERSONAL MÉDICO --- */}
      {isModalPersonalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-yellow-500 p-6 text-white text-center">
              <h3 className="text-xl font-bold">
                {isEditandoMedico ? 'Editar Personal Médico' : 'Agregar Personal Médico'}
              </h3>
            </div>
            <form onSubmit={handleGuardarPersonal} className="p-8 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre</label>
                <input
                  type="text" required
                  placeholder="Ej. Karen"
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-yellow-500"
                  value={nuevoMedico.nombre}
                  onChange={(e) => setNuevoMedico({ ...nuevoMedico, nombre: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Apellido</label>
                <input
                  type="text" required
                  placeholder="Ej. Torres"
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-yellow-500"
                  value={nuevoMedico.apellido}
                  onChange={(e) => setNuevoMedico({ ...nuevoMedico, apellido: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Especialidad</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-yellow-500"
                  value={nuevoMedico.especialidad}
                  onChange={(e) => setNuevoMedico({ ...nuevoMedico, especialidad: e.target.value })}
                >
                  <option>Fisioterapia</option>
                  <option>Medicina General</option>
                  <option>Nutrición</option>
                  <option>Obstetricia</option>
                  <option>Psicología</option>
                  <option>Rehabilitación</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-2">
                <p className="text-[10px] font-black text-gray-400 mb-3 tracking-wider uppercase">Credenciales de Acceso</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Correo Electrónico</label>
                    <input
                      type="email" required placeholder="doctor@clinica.com"
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-yellow-500 bg-yellow-50"
                      value={nuevoMedico.correo}
                      onChange={(e) => setNuevoMedico({ ...nuevoMedico, correo: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isEditandoMedico ? 'Nueva Contraseña' : 'Contraseña'}
                    </label>
                    <input
                      type="text"
                      required={!isEditandoMedico}
                      placeholder={isEditandoMedico ? 'Dejar en blanco para no cambiar' : 'Asigna una clave'}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-yellow-500 bg-yellow-50 text-xs"
                      value={nuevoMedico.password}
                      onChange={(e) => setNuevoMedico({ ...nuevoMedico, password: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button" onClick={cerrarModalPersonal}
                  className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 shadow-md transition-colors"
                >
                  {isEditandoMedico ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 cursor-pointer" onClick={() => setVistaActual('panel')}>
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-black shadow-sm mr-3">
            C
          </div>
          <span className="text-xl font-extrabold text-gray-800 tracking-tight">Clínica UPN</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <button
            onClick={() => setVistaActual('panel')}
            className={`w-full flex items-center px-4 py-3 rounded-lg font-bold transition-colors ${vistaActual === 'panel' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            📊 Panel Principal
          </button>

          <button
            onClick={() => setVistaActual('pacientes')}
            className={`w-full flex items-center px-4 py-3 rounded-lg font-bold transition-colors ${vistaActual === 'pacientes' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            👥 Pacientes
          </button>

          <button
            onClick={() => setVistaActual('personal')}
            className={`w-full flex items-center px-4 py-3 rounded-lg font-bold transition-colors ${vistaActual === 'personal' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            👨‍⚕️ Personal Médico
          </button>

          <button
            onClick={() => setVistaActual('citas')}
            className={`w-full flex items-center px-4 py-3 rounded-lg font-bold transition-colors ${vistaActual === 'citas' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            📅 Citas Programadas
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-500">Administrador</span>
            <div className="w-10 h-10 bg-yellow-100 rounded-full border-2 border-yellow-500 flex items-center justify-center font-bold text-yellow-700">
              A
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {renderContenido()}
        </div>
      </main>
    </div>
  );
}