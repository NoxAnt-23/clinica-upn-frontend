import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardMedico() {
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [medico, setMedico] = useState({ idPersonal: null, nombre: '...', especialidad: '...' });

  // --- ESTADOS PARA EL MODAL DE TELECONSULTA ---
  const [isModalEnlaceOpen, setIsModalEnlaceOpen] = useState(false);
  const [idCitaSeleccionada, setIdCitaSeleccionada] = useState(null);
  const [enlaceInput, setEnlaceInput] = useState('');

  useEffect(() => {
    const datosGuardados = localStorage.getItem('usuarioActual');
    if (!datosGuardados) { navigate('/login'); return; }
    
    const data = JSON.parse(datosGuardados);
    const idMed = data.id_personal_salud || data.ID_PERSONAL_SALUD;

    setMedico({ 
        idPersonal: idMed,
        nombre: data.nombre || data.NOMBRE || 'Dr(a).', 
        especialidad: data.especialidad || data.ESPECIALIDAD || 'General' 
    });
    
    if (idMed) cargarCitasMedico(idMed);
  }, [navigate]);

  const cargarCitasMedico = async (idMedico) => {
    try {
      const response = await fetch(`http://localhost:8080/api/medico/citas/${idMedico}`);
      if (response.ok) {
        const data = await response.json();
        setCitas(data);
      }
    } catch (error) { console.error("Error al cargar citas del médico:", error); }
  };

  // --- FUNCIÓN PARA ENVIAR EL ENLACE AL BACKEND ---
  const handleGuardarEnlace = async (e) => {
    e.preventDefault();
    try {
      // Apunta directamente al endpoint PUT configurado en tu CitaController
      const response = await fetch(`http://localhost:8080/api/citas/enlace/${idCitaSeleccionada}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enlace: enlaceInput })
      });

      if (response.ok) {
        alert("¡Enlace de teleconsulta guardado exitosamente!");
        setIsModalEnlaceOpen(false);
        setEnlaceInput('');
        if (medico.idPersonal) cargarCitasMedico(medico.idPersonal); // Refresca la lista en tiempo real
      } else {
        alert("Error al guardar el enlace en el servidor.");
      }
    } catch (error) {
      alert("Error de conexión al guardar la teleconsulta.");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f4f7f6] relative">
      
      {/* --- MODAL: ASIGNAR ENLACE DE TELECONSULTA --- */}
      {isModalEnlaceOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
            <div className="bg-purple-700 p-6 text-white text-center">
              <h3 className="text-xl font-bold">Generar Teleconsulta</h3>
              <p className="text-purple-200 text-xs mt-1">Cita Médica Nro #{idCitaSeleccionada}</p>
            </div>
            <form onSubmit={handleGuardarEnlace} className="p-8 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Enlace de Videollamada (Jitsi/Zoom/Teams)</label>
                <input 
                  type="url" 
                  required
                  placeholder="https://meet.jit.si/..."
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-purple-600 bg-gray-50 text-sm"
                  value={enlaceInput}
                  onChange={(e) => setEnlaceInput(e.target.value)}
                />
                <p className="text-[10px] text-gray-400 mt-2">
                  💡 Se autogeneró una sala privada y gratuita en Jitsi Meet para esta cita. Puedes modificarla si prefieres usar otra plataforma.
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalEnlaceOpen(false)}
                  className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-md transition-colors"
                >
                  Guardar Enlace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-800 mb-10 flex items-center">
            <span className="w-8 h-8 bg-yellow-500 rounded-lg mr-3 flex items-center justify-center text-white text-sm">C</span>
            Clínica UPN
          </h1>
          <nav className="space-y-2">
            <button className="w-full flex items-center bg-yellow-50 text-yellow-700 font-bold p-3 rounded-xl border border-yellow-100">
              <span className="mr-3">📋</span> Mi Agenda
            </button>
            <button className="w-full flex items-center text-gray-400 font-bold p-3 hover:bg-gray-50 rounded-xl transition-all">
              <span className="mr-3">🏥</span> Historial Clínico
            </button>
          </nav>
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} 
                className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold text-sm hover:bg-red-100 transition-all">
          Cerrar Sesión
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-black text-gray-800">Portal del Médico</h2>
            <p className="text-gray-500 font-medium">Bienvenido, <span className="text-gray-900">{medico.nombre}</span></p>
          </div>
          <div className="bg-white border border-gray-200 px-6 py-3 rounded-2xl flex items-center shadow-sm">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
            <span className="font-bold text-sm text-gray-700">Sistema Conectado</span>
          </div>
        </header>

        {/* CONTENEDOR DE AGENDA CON COLORES */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg shadow-gray-100 p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-gray-800">Citas para hoy ({new Date().toLocaleDateString()})</h3>
            <span className="bg-yellow-500 text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-md shadow-yellow-500/20">
              {citas.length} Registradas
            </span>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-gray-100">
                <th className="pb-6">Hora</th>
                <th className="pb-6">Paciente</th>
                <th className="pb-6">Modalidad / Estado</th>
                <th className="pb-6 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {citas.length > 0 ? citas.map((c, i) => {
                const idCita = c.id_cita || c.ID_CITA || i;
                const mod = c.modalidad || c.MODALIDAD || 'Presencial';
                const est = c.estado || c.ESTADO || 'Pendiente';
                
                // Mapeo flexible blindado ante alias devueltos en mayúsculas por JDBC
                const tieneEnlace = c.enlace || c.ENLACE || c.enlace_sesion || c.ENLACE_SESION;

                return (
                  <tr key={idCita} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-6 font-black text-gray-700">{c.HORA || c.hora}</td>
                    <td className="py-6 font-bold text-gray-900">{c.PACIENTE || c.paciente}</td>
                    <td className="py-6">
                      <div className="flex flex-col gap-1">
                        <span className={`w-max px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          mod === 'Virtual' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {mod}
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium px-1">
                          Estado: {est}
                        </span>
                      </div>
                    </td>
                    <td className="py-6 text-right">
                      <div className="flex justify-end gap-2">
                        {/* BOTÓN INTELIGENTE DE TELECONSULTA */}
                        {mod === 'Virtual' && (
                          <button 
                            onClick={() => {
                              setIdCitaSeleccionada(idCita);
                              // Setea el link existente si lo encuentra, sino usa la plantilla de Jitsi
                              setEnlaceInput(tieneEnlace || `https://meet.jit.si/ClinicaUPN-Teleconsulta-Cita-${idCita}`);
                              setIsModalEnlaceOpen(true);
                            }}
                            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md ${
                              tieneEnlace 
                                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200' 
                                : 'bg-white border-2 border-purple-600 text-purple-700 hover:bg-purple-50'
                            }`}
                          >
                            {tieneEnlace ? '✅ Enlace Listo' : '🔗 Enlace Virtual'}
                          </button>
                        )}

                        <button className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-800 transition-all shadow-lg shadow-gray-300">
                          Iniciar Atención
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="4" className="py-12 text-center text-gray-400 font-bold">No hay citas pendientes por ahora.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}