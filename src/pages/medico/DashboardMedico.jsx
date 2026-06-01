import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardMedico() {
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [medico, setMedico] = useState({ nombre: '...', especialidad: '...' });

  useEffect(() => {
    const datosGuardados = localStorage.getItem('usuarioActual');
    if (!datosGuardados) { navigate('/login'); return; }
    
    const data = JSON.parse(datosGuardados);
    setMedico({ 
        nombre: data.nombre || data.NOMBRE || 'Dr(a).', 
        especialidad: data.especialidad || data.ESPECIALIDAD || 'General' 
    });
    
    const idMedico = data.id_personal_salud || data.ID_PERSONAL_SALUD;
    if (idMedico) cargarCitasMedico(idMedico);
  }, [navigate]);

  const cargarCitasMedico = async (idMedico) => {
    try {
      const response = await fetch(`http://localhost:8080/api/medico/citas/${idMedico}`);
      if (response.ok) {
        const data = await response.json();
        setCitas(data);
      }
    } catch (error) { console.error("Error:", error); }
  };

  return (
    <div className="flex min-h-screen bg-[#f4f7f6]">
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
              {citas.length} Pendientes
            </span>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-gray-100">
                <th className="pb-6">Hora</th>
                <th className="pb-6">Paciente</th>
                <th className="pb-6">Estado</th>
                <th className="pb-6 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {citas.length > 0 ? citas.map((c, i) => (
                <tr key={i} className="group hover:bg-gray-50 transition-colors">
                  <td className="py-6 font-black text-gray-700">{c.HORA || c.hora}</td>
                  <td className="py-6 font-bold text-gray-900">{c.PACIENTE || c.paciente}</td>
                  <td className="py-6">
                    <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase">
                      {c.ESTADO || c.estado}
                    </span>
                  </td>
                  <td className="py-6 text-right">
                    <button className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-800 transition-all shadow-lg shadow-gray-300">
                      Iniciar Atención
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="py-12 text-center text-gray-400 font-bold">No hay citas pendientes por ahora.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}