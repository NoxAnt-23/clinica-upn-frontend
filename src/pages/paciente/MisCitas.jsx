import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MisCitas() {
  const navigate = useNavigate();
  const [vistaActual, setVistaActual] = useState('citas');
  
  // ESTADO DEL USUARIO CONFORME A TU LOCALSTORAGE
  const [usuario, setUsuario] = useState({
    idPaciente: null,
    nombre: '',
    apellido: '',
    dni: '',
    correo: '',
    celular: ''
  });

  // ESTADO DE CITAS
  const [citas, setCitas] = useState([]);

  // ESTADOS NUEVOS PARA CARGAR MÉDICOS DINÁMICAMENTE
  const [medicosFiltrados, setMedicosFiltrados] = useState([]);

  // Opciones de horas exactas para la agenda
  const opcionesHoras = [
    "08:00:00", "08:30:00", "09:00:00", "09:30:00", "10:00:00", "10:30:00",
    "11:00:00", "11:30:00", "14:00:00", "14:30:00", "15:00:00", "15:30:00"
  ];

  // FUNCIÓN PARA TRAER CITAS DE LA BD
  const cargarHistorialCitas = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/citas/paciente/${id}`);
      if (response.ok) {
        const datosBD = await response.json();
        setCitas(datosBD);
      }
    } catch (error) {
      console.error("Error al cargar historial:", error);
    }
  };

  // FUNCIÓN PARA CANCELAR CITA
  const handleCancelar = async (idCita) => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta cita?")) return;
    try {
      const response = await fetch(`http://localhost:8080/api/citas/cancelar/${idCita}`, { method: 'DELETE' });
      if (response.ok) {
        alert("Cita cancelada con éxito.");
        cargarHistorialCitas(usuario.idPaciente);
      } else { alert("Error al cancelar la cita."); }
    } catch (error) { alert("Error de conexión."); }
  };

  // EFECTO: Se ejecuta al cargar la página (Sincronizado con tu LocalStorage real)
  useEffect(() => {
    const datosGuardados = localStorage.getItem('usuarioActual');
    if (datosGuardados) {
      const data = JSON.parse(datosGuardados);
      
      // ✅ CORREGIDO: Extraemos 'idPaciente' que es el ID real de la tabla paciente devuelto por el LEFT JOIN
      const idPac = data.idPaciente;

      setUsuario({
        idPaciente: idPac,
        nombre: data.nombre || 'Paciente',
        apellido: data.apellido || '',
        dni: data.dni || 'No registrado',
        correo: data.correo || 'No registrado',
        celular: data.celular || 'No registrado'
      });
      
      if (idPac) {
        cargarHistorialCitas(idPac);
      }
      
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // ESTADOS DEL MODAL DE RESERVA ACTUALIZADOS
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nuevaCita, setNuevaCita] = useState({ 
    especialidad: 'Medicina General', 
    idPersonal: '', 
    fecha: '', 
    hora: '', 
    modalidad: 'Presencial',
    sede: 'Sede SJL'
  });

  // EFECTO: Carga y filtra los médicos basándose en la columna 'especialidad' devuelta por el SP
  useEffect(() => {
    if (!isModalOpen) return;

    const cargarMedicosPorEspecialidad = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/medico/listar');
        if (response.ok) {
          const medicos = await response.json();
          
          const filtrados = medicos.filter(m => {
            const espBD = (m.especialidad || m.ESPECIALIDAD || m.tipo_personal || m.TIPO_PERSONAL || '').toLowerCase();
            const { especialidad: espForm } = nuevaCita;
            
            const limpiarTildes = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            
            return limpiarTildes(espBD).includes(limpiarTildes(espForm.toLowerCase()));
          });
          
          setMedicosFiltrados(filtrados);
          
          if (filtrados.length > 0) {
            setNuevaCita(prev => ({ ...prev, idPersonal: filtrados[0].id_personal_salud || filtrados[0].ID_PERSONAL_SALUD }));
          } else {
            setNuevaCita(prev => ({ ...prev, idPersonal: '' }));
          }
        }
      } catch (error) {
        console.error("Error al traer médicos:", error);
      }
    };

    cargarMedicosPorEspecialidad();
  }, [nuevaCita.especialidad, isModalOpen]);

  // ESTADOS DEL MODAL DE YAPE
  const [isYapeModalOpen, setIsYapeModalOpen] = useState(false);
  const [citaAPagar, setCitaAPagar] = useState(null);

  // FUNCIÓN PARA RESERVAR CORREGIDA Y ALINEADA CON CAMELCASE DE SPRING BOOT
  const handleReservar = async (e) => {
    e.preventDefault();
    
    if (!nuevaCita.idPersonal) {
      alert("Por favor, selecciona un médico disponible.");
      return;
    }
    if (!nuevaCita.hora) {
      alert("Por favor, selecciona una hora para tu atención.");
      return;
    }

    // ✅ CORREGIDO: Nombres de atributos en camelCase para emparejarse con Cita.java/Jackson DTO
    const citaParaBD = {
      idPaciente: usuario.idPaciente, 
      idPersonalSalud: parseInt(nuevaCita.idPersonal), 
      fecha: nuevaCita.fecha,
      hora: nuevaCita.hora, 
      modalidad: nuevaCita.modalidad, 
      especialidad: nuevaCita.especialidad,
      estado: 'Pendiente de Pago', 
      sede: nuevaCita.sede
    };

    try {
      const response = await fetch('http://localhost:8080/api/citas/reservar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(citaParaBD)
      });

      if (response.ok) {
        alert("¡Cita reservada con éxito en la base de datos!");
        setIsModalOpen(false);
        setNuevaCita({ especialidad: 'Medicina General', idPersonal: '', fecha: '', hora: '', modalidad: 'Presencial', sede: 'Sede SJL' });
        cargarHistorialCitas(usuario.idPaciente); 
      } else {
        const errorMsg = await response.text();
        alert("Error al guardar en base de datos:\n" + errorMsg);
      }
    } catch (error) {
      alert("No se pudo conectar con el servidor.");
    }
  };

  // FUNCIÓN PARA PAGAR CON YAPE
  const handlePagoYape = async () => {
    if (!citaAPagar) return;
    
    try {
      const id = citaAPagar.id_cita || citaAPagar.ID_CITA; 
      
      const response = await fetch(`http://localhost:8080/api/citas/pagar/${id}`, {
        method: 'PUT'
      });

      if (response.ok) {
        alert("¡Yapeo confirmado! Tu cita ha sido pagada.");
        setIsYapeModalOpen(false);
        cargarHistorialCitas(usuario.idPaciente); 
      } else {
        alert("Hubo un problema al procesar el pago.");
      }
    } catch (error) {
      alert("Error de conexión con el servidor.");
    }
  };

  // --- COMPONENTES INTERNOS ---

  const VistaCitas = () => (
    <div className="animate-fade-in max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-gray-800">Tus citas médicas</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 shadow-md transition-all active:scale-95"
        >
          + Reservar Nueva Cita
        </button>
      </div>

      {citas.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8 border-l-4 border-l-yellow-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-yellow-600 mb-1">CITA MÁS PRÓXIMA</p>
              <h3 className="text-2xl font-black text-gray-800">{citas[0].fecha || citas[0].FECHA}</h3>
              <p className="text-gray-500 mt-2 font-medium">
                {citas[0].especialidad || citas[0].ESPECIALIDAD} - {citas[0].medico || citas[0].MEDICO || 'Por asignar'}
              </p>
            </div>
            <button 
              onClick={() => handleCancelar(citas[0].id_cita || citas[0].ID_CITA)}
              className="text-xs font-bold text-red-500 hover:text-red-700 underline underline-offset-2"
            >
              Cancelar cita
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-8 mb-8 text-center">
          <p className="text-gray-500 font-bold">No tienes ninguna cita programada próximamente.</p>
          <p className="text-gray-400 text-sm mt-1">Haz clic en "Reservar Nueva Cita" para empezar.</p>
        </div>
      )}

      <h2 className="text-lg font-bold text-gray-800 mb-4">Historial y Reservas</h2>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
              <th className="px-6 py-4 font-bold">Fecha</th>
              <th className="px-6 py-4 font-bold">Hora</th>
              <th className="px-6 py-4 font-bold">Especialidad</th>
              <th className="px-6 py-4 font-bold">Médico</th>
              <th className="px-6 py-4 font-bold">Modalidad</th>
              <th className="px-6 py-4 font-bold">Estado</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {citas.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500 font-medium">
                  Aún no tienes citas registradas.
                </td>
              </tr>
            ) : (
              citas.map((cita, index) => {
                const esVirtual = (cita.modalidad || cita.MODALIDAD) === 'Virtual';
                const linkSala = cita.enlace || cita.ENLACE || cita.enlace_sesion || cita.ENLACE_SESION;

                return (
                  <tr key={cita.id_cita || cita.ID_CITA || index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{cita.fecha || cita.FECHA}</td>
                    <td className="px-6 py-4 font-medium">{(cita.hora || cita.HORA)?.substring(0, 5)}</td>
                    <td className="px-6 py-4">{cita.especialidad || cita.ESPECIALIDAD}</td>
                    <td className="px-6 py-4 text-gray-500">{cita.medico || cita.MEDICO || 'Por asignar'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span>{cita.modalidad || cita.MODALIDAD}</span>
                        {esVirtual && linkSala ? (
                          <a 
                            href={linkSala} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-2 py-0.5 bg-green-600 text-white text-[10px] font-black rounded hover:bg-green-700 shadow-sm animate-pulse"
                          >
                            🎥 Entrar a Sala
                          </a>
                        ) : esVirtual ? (
                          <span className="text-[10px] text-gray-400 italic font-medium">Enlace pendiente</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        (cita.estado || cita.ESTADO) === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {cita.estado || cita.ESTADO || 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const VistaResultados = () => (
    <div className="animate-fade-in max-w-4xl mx-auto w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Resultados Médicos</h2>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
              <th className="px-6 py-4 font-bold">Fecha</th>
              <th className="px-6 py-4 font-bold">Tipo de Examen</th>
              <th className="px-6 py-4 font-bold">Laboratorio</th>
              <th className="px-6 py-4 font-bold text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-6 py-4">20 May 2026</td>
              <td className="px-6 py-4 font-medium">Hemograma Completo</td>
              <td className="px-6 py-4 text-gray-500">Sede Principal</td>
              <td className="px-6 py-4 text-right">
                <button className="text-blue-600 hover:underline font-bold text-xs">📄 Descargar PDF</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const VistaPagos = () => {
    const citasPendientes = citas.filter(c => (c.estado || c.ESTADO) === 'Pendiente de Pago');
    const citasPagadas = citas.filter(c => (c.estado || c.ESTADO) === 'Pagado');

    return (
      <div className="animate-fade-in max-w-4xl mx-auto w-full">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Pagos y Facturación</h2>
        
        {citasPendientes.length === 0 ? (
          <div className="bg-green-50 text-green-700 p-6 rounded-xl border border-green-200 mb-8 font-bold text-center">
            ¡Estás al día! No tienes pagos pendientes.
          </div>
        ) : (
          citasPendientes.map((cita, index) => (
            <div key={index} className="bg-red-50 border border-red-200 rounded-xl p-6 mb-4 flex flex-col md:flex-row justify-between items-center shadow-sm">
              <div className="mb-4 md:mb-0">
                <h3 className="text-red-800 font-bold text-lg">Pago Pendiente</h3>
                <p className="text-red-600 text-sm mt-1">
                  Reserva: {cita.especialidad || cita.ESPECIALIDAD} ({cita.fecha || cita.FECHA})
                </p>
                <p className="text-2xl font-black text-red-700 mt-2">S/ 50.00</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setCitaAPagar(cita);
                    setIsYapeModalOpen(true);
                  }}
                  className="px-5 py-2.5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 shadow-md transition-colors flex items-center"
                >
                  📱 Pagar con Yape
                </button>
                <button className="px-5 py-2.5 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 shadow-md transition-colors flex items-center">
                  💳 Pagar con Tarjeta
                </button>
              </div>
            </div>
          ))
        )}

        <h2 className="text-lg font-bold text-gray-800 mb-4">Historial de Pagos</h2>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <th className="px-6 py-4 font-bold">Fecha Cita</th>
                <th className="px-6 py-4 font-bold">Concepto</th>
                <th className="px-6 py-4 font-bold">Monto</th>
                <th className="px-6 py-4 font-bold">Estado</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {citasPagadas.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No hay historial de pagos.</td></tr>
              ) : (
                citasPagadas.map((cita, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">{cita.fecha || cita.FECHA}</td>
                    <td className="px-6 py-4 font-medium">Consulta {cita.especialidad || cita.ESPECIALIDAD}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">S/ 50.00</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Pagado</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const VistaPerfil = () => (
    <div className="animate-fade-in max-w-4xl mx-auto w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Mi Perfil</h2>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Nombres Completos</label>
            <p className="text-gray-800 font-medium border-b border-gray-100 pb-2">
              {usuario?.nombre || ''} {usuario?.apellido || ''}
            </p>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Documento de Identidad (DNI/DNIe)</label>
            <p className="text-gray-800 font-medium border-b border-gray-100 pb-2">
              {usuario?.dni || 'No registrado'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Correo Electrónico</label>
            <p className="text-gray-800 font-medium border-b border-gray-100 pb-2">
              {usuario?.correo || 'No registrado'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Celular</label>
            <p className="text-gray-800 font-medium border-b border-gray-100 pb-2">
              {usuario?.celular || 'No registrado'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContenido = () => {
    switch (vistaActual) {
      case 'citas': return <VistaCitas />;
      case 'resultados': return <VistaResultados />;
      case 'pagos': return <VistaPagos />;
      case 'perfil': return <VistaPerfil />;
      default: return <VistaCitas />;
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('usuarioActual'); 
    navigate('/login'); 
  };

  return (
    <div className="flex h-screen bg-gray-50 relative">
      
      {/* --- MODAL DE RESERVA --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
            <div className="bg-yellow-500 p-6 text-white text-center">
              <h3 className="text-xl font-bold">Nueva Cita Médica</h3>
              <p className="text-yellow-100 text-sm">Completa los datos para tu reserva</p>
            </div>
            
            <form onSubmit={handleReservar} className="p-8 space-y-4">
              {/* 1. Selección de Especialidad */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Especialidad</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-yellow-500 font-medium text-sm"
                  value={nuevaCita.especialidad}
                  onChange={(e) => setNuevaCita({...nuevaCita, especialidad: e.target.value})}
                >
                  <option value="Medicina General">Medicina General</option>
                  <option value="Cardiología">Cardiología</option>
                  <option value="Odontología">Odontología</option>
                  <option value="Pediatría">Pediatría</option>
                  <option value="Ginecología">Ginecología</option>
                </select>
              </div>

              {/* 2. Selección de Médico Dinámico */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Selecciona tu Médico</label>
                <select 
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-yellow-500 font-medium text-sm"
                  value={nuevaCita.idPersonal}
                  onChange={(e) => setNuevaCita({...nuevaCita, idPersonal: e.target.value})}
                >
                  {medicosFiltrados.length > 0 ? (
                    medicosFiltrados.map((m) => {
                      const nom = m.nombre || m.NOMBRE || '';
                      const ape = m.apellido || m.APELLIDO || '';
                      return (
                        <option key={m.id_personal_salud || m.ID_PERSONAL_SALUD} value={m.id_personal_salud || m.ID_PERSONAL_SALUD}>
                          {`Dr(a). ${nom} ${ape}`.trim()}
                        </option>
                      );
                    })
                  ) : (
                    <option value="">⚠️ No hay médicos disponibles</option>
                  )}
                </select>
              </div>
              
              {/* 3. Selección de Fecha */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Fecha</label>
                <input 
                  type="date" 
                  required 
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-yellow-500 font-medium text-sm"
                  value={nuevaCita.fecha}
                  onChange={(e) => setNuevaCita({...nuevaCita, fecha: e.target.value})}
                />
              </div>

              {/* 4. Selector de Horas Exactas */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Hora de la Consulta</label>
                <select 
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-yellow-500 font-medium text-sm"
                  value={nuevaCita.hora}
                  onChange={(e) => setNuevaCita({...nuevaCita, hora: e.target.value})}
                >
                  <option value="">-- Selecciona una hora --</option>
                  {opcionesHoras.map((h) => (
                    <option key={h} value={h}>
                      {h.substring(0, 5)} {parseInt(h.substring(0,2)) < 12 ? 'AM' : 'PM'}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Selección de Modalidad */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Modalidad</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-yellow-500 font-medium text-sm"
                  value={nuevaCita.modalidad}
                  onChange={(e) => setNuevaCita({...nuevaCita, modalidad: e.target.value})}
                >
                  <option value="Presencial">Presencial (En Clínica)</option>
                  <option value="Virtual">Virtual (Teleconsulta)</option>
                </select>
              </div>

              {/* Botones de Control del Formulario */}
              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={!nuevaCita.idPersonal || !nuevaCita.hora}
                  className="flex-1 py-3 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 shadow-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Confirmar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE YAPE */}
      {isYapeModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up text-center">
            <div className="bg-purple-700 p-4 text-white">
              <h3 className="text-xl font-bold">Pago con Yape</h3>
            </div>
            
            <div className="p-8">
              <p className="text-gray-600 font-medium mb-4">Escanea el código QR para pagar tu consulta de <strong>S/ 50.00</strong></p>
              
              <div className="bg-white p-2 border-4 border-[#7408B6] rounded-xl inline-block mb-6 shadow-lg">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PagoClinicaUPN" alt="QR Yape" className="w-32 h-32" />
              </div>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handlePagoYape}
                  className="w-full py-3 bg-[#7408B6] text-white font-bold rounded-xl hover:bg-[#5a068f] shadow-md transition-colors"
                >
                  ¡Ya Yapeé! (Simular Pago)
                </button>
                <button 
                  onClick={() => setIsYapeModalOpen(false)}
                  className="w-full py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-black shadow-sm mr-3">C</div>
          <span className="text-xl font-extrabold text-gray-800 tracking-tight">Clínica UPN</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button onClick={() => setVistaActual('citas')} className={`w-full flex items-center px-4 py-3 rounded-lg font-bold transition-colors ${vistaActual === 'citas' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50'}`}>📅 Mis Citas</button>
          <button onClick={() => setVistaActual('resultados')} className={`w-full flex items-center px-4 py-3 rounded-lg font-bold transition-colors ${vistaActual === 'resultados' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50'}`}>📝 Resultados</button>
          <button onClick={() => setVistaActual('pagos')} className={`w-full flex items-center px-4 py-3 rounded-lg font-bold transition-colors ${vistaActual === 'pagos' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50'}`}>💳 Pagos</button>
          <button onClick={() => setVistaActual('perfil')} className={`w-full flex items-center px-4 py-3 rounded-lg font-bold transition-colors ${vistaActual === 'perfil' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50'}`}>👤 Perfil</button>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button onClick={cerrarSesion} className="w-full py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Cerrar Sesión</button>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-2xl font-bold text-gray-800">Portal del Paciente</h1>
          <div className="flex items-center space-x-3 text-sm font-medium text-gray-500">
            <span>{usuario?.nombre || 'Usuario'} {usuario?.apellido || ''}</span>
            <div className="w-10 h-10 bg-yellow-100 rounded-full border-2 border-yellow-500 flex items-center justify-center font-bold text-yellow-700 uppercase">
              {usuario?.nombre ? usuario.nombre.charAt(0) : 'U'}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">{renderContenido()}</div>
      </main>
    </div>
  );
}