import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AgendaMedico() {
  const navigate = useNavigate();
  // Estado para controlar qué pantalla ve el médico
  const [vistaActual, setVistaActual] = useState('agenda');

  // --- COMPONENTES INTERNOS PARA CADA VISTA ---

  const VistaAgenda = () => (
    <div className="animate-fade-in">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden border-t-4 border-t-yellow-400">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Pacientes de Hoy (27 de Mayo)</h2>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">2 Pendientes</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <th className="px-6 py-4 font-bold">Hora</th>
                <th className="px-6 py-4 font-bold">Paciente</th>
                <th className="px-6 py-4 font-bold">Motivo</th>
                <th className="px-6 py-4 font-bold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 font-black text-yellow-600">08:00 AM</td>
                <td className="px-6 py-4 font-medium">Marco Antonio Quispe</td>
                <td className="px-6 py-4 text-gray-500">Consulta General</td>
                <td className="px-6 py-4 text-right">
                  <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-xs font-bold hover:bg-yellow-600 shadow-sm">Iniciar Atención</button>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 font-black text-yellow-600">09:30 AM</td>
                <td className="px-6 py-4 font-medium">Paola Ayala</td>
                <td className="px-6 py-4 text-gray-500">Revisión de Exámenes</td>
                <td className="px-6 py-4 text-right">
                  <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-xs font-bold hover:bg-yellow-600 shadow-sm">Iniciar Atención</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const VistaHistorial = () => (
    <div className="animate-fade-in">
      <div className="mb-6 flex gap-4">
        <input 
          type="text" 
          placeholder="Buscar paciente por DNI o Apellidos..." 
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 outline-none"
        />
        <button className="px-6 py-2.5 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition-colors">
          Buscar
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Resultados de Búsqueda</h2>
        </div>
        <div className="p-8 text-center text-gray-500">
          <p>Ingresa el número de documento del paciente para cargar su historial clínico completo.</p>
        </div>
      </div>
    </div>
  );

  // Renderizador condicional
  const renderContenido = () => {
    switch (vistaActual) {
      case 'agenda': return <VistaAgenda />;
      case 'historial': return <VistaHistorial />;
      default: return <VistaAgenda />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* Sidebar Médico */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-black shadow-sm mr-3">
            C
          </div>
          <span className="text-xl font-extrabold text-gray-800 tracking-tight">Clínica UPN</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button 
            onClick={() => setVistaActual('agenda')}
            className={`w-full flex items-center px-4 py-3 rounded-lg font-bold transition-colors ${vistaActual === 'agenda' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            📋 Mi Agenda Hoy
          </button>
          
          <button 
            onClick={() => setVistaActual('historial')}
            className={`w-full flex items-center px-4 py-3 rounded-lg font-bold transition-colors ${vistaActual === 'historial' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            🏥 Historial Clínico
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={() => navigate('/')}
            className="w-full py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-2xl font-bold text-gray-800">Panel Médico</h1>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-500">Dr. Mendoza</span>
            <div className="w-10 h-10 bg-yellow-100 rounded-full border-2 border-yellow-500 flex items-center justify-center font-bold text-yellow-700">
              M
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