import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 🆕 Necesario para cerrar sesión

const DashboardAsistente = () => {
    const navigate = useNavigate();
    const [citas, setCitas] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [vistaActual, setVistaActual] = useState('recepcion');
    
    // Estado del usuario logueado (para mostrar su nombre en el Header)
    const [usuario, setUsuario] = useState({ nombre: 'Asistente', apellido: '' });

    // Estados para controlar el formulario emergente (Modal)
    const [mostrarModal, setMostrarModal] = useState(false);
    const [nuevaCita, setNuevaCita] = useState({
        idPaciente: '', idPersonal: '', fecha: '', hora: '', 
        especialidad: 'Medicina General', modalidad: 'Presencial', sede: '', consultorio: ''
    });

    useEffect(() => {
        // Cargar datos del usuario desde LocalStorage
        const datosGuardados = localStorage.getItem('usuarioActual');
        if (datosGuardados) {
            const data = JSON.parse(datosGuardados);
            setUsuario({
                nombre: data.nombre || 'Asistente',
                apellido: data.apellido || ''
            });
        }
        cargarCitasGenerales();
    }, []);

    const cargarCitasGenerales = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/citas/asistente/todas');
            const data = await response.json();
            setCitas(data);
        } catch (error) {
            console.error("Error cargando agenda:", error);
        }
    };

    const registrarPagoEnEfectivo = async (idCita) => {
        if (!window.confirm("¿Confirmar recepción de pago en caja?")) return;
        try {
            await fetch(`http://localhost:8080/api/citas/pagar/${idCita}`, { method: 'PUT' });
            cargarCitasGenerales();
        } catch (error) {
            alert("Error al procesar el cobro");
        }
    };

    const cancelarCita = async (idCita) => {
        if (!window.confirm("¿Seguro que deseas cancelar esta cita?")) return;
        try {
            await fetch(`http://localhost:8080/api/citas/cancelar/${idCita}`, { method: 'DELETE' });
            cargarCitasGenerales();
        } catch (error) {
            alert("Error al cancelar la cita");
        }
    };

    const marcarLlegada = async (idCita) => {
        try {
            const response = await fetch(`http://localhost:8080/api/citas/llegada/${idCita}`, { method: 'PUT' });
            if (response.ok) {
                cargarCitasGenerales();
            } else {
                alert("❌ El servidor respondió con error: " + response.status);
            }
        } catch (error) {
            alert("❌ Error de red.");
        }
    };

    const handleAgendarCita = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/citas/reservar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevaCita)
            });

            if (response.ok) {
                alert("✅ Cita presencial agendada con éxito");
                setMostrarModal(false); 
                cargarCitasGenerales(); 
                setNuevaCita({ idPaciente: '', idPersonal: '', fecha: '', hora: '', especialidad: 'Medicina General', modalidad: 'Presencial', sede: '', consultorio: '' });
            } else {
                alert("❌ Error al registrar la cita en la base de datos.");
            }
        } catch (error) {
            alert("Error de conexión con el servidor.");
        }
    };

    const cerrarSesion = () => {
        localStorage.removeItem('usuarioActual');
        navigate('/login');
    };

    const citasFiltradas = citas.filter(cita =>
        cita.paciente?.toLowerCase().includes(busqueda.toLowerCase()) ||
        cita.dni?.includes(busqueda)
    );

    return (
        <div className="flex h-screen bg-gray-50 relative">
            
            {/* --- SIDEBAR LATERAL (Estilo Paciente) --- */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col z-10">
                <div className="h-16 flex items-center px-6 border-b border-gray-200 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-black shadow-sm mr-3">C</div>
                    <span className="text-xl font-extrabold text-gray-800 tracking-tight">Clínica UPN</span>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <button onClick={() => setVistaActual('recepcion')} className={`w-full flex items-center px-4 py-3 rounded-lg font-bold transition-colors ${vistaActual === 'recepcion' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50'}`}>📋 Recepción</button>
                    <button onClick={() => setVistaActual('caja')} className={`w-full flex items-center px-4 py-3 rounded-lg font-bold transition-colors ${vistaActual === 'caja' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50'}`}>💳 Caja (Próximamente)</button>
                </nav>
                <div className="p-4 border-t border-gray-200">
                    <button onClick={cerrarSesion} className="w-full py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Cerrar Sesión</button>
                </div>
            </aside>

            {/* --- ÁREA PRINCIPAL --- */}
            <main className="flex-1 flex flex-col overflow-hidden">
                
                {/* HEADER SUPERIOR */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
                    <h1 className="text-2xl font-bold text-gray-800">Portal de Recepción</h1>
                    <div className="flex items-center space-x-3 text-sm font-medium text-gray-500">
                        <span>{usuario.nombre} {usuario.apellido}</span>
                        <div className="w-10 h-10 bg-blue-100 rounded-full border-2 border-blue-500 flex items-center justify-center font-bold text-blue-700 uppercase">
                            {usuario.nombre.charAt(0)}
                        </div>
                    </div>
                </header>

                {/* CONTENIDO DE LA TABLA */}
                <div className="flex-1 overflow-auto p-8">
                    <div className="animate-fade-in max-w-7xl mx-auto w-full">
                        
                        {/* Cabecera y Buscador */}
                        <div className="flex justify-between items-center mb-8">
                            <div className="relative w-1/3">
                                <input
                                    type="text"
                                    placeholder="Buscar paciente por DNI o Nombre..."
                                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-yellow-500 font-medium text-sm shadow-sm"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => setMostrarModal(true)}
                                className="px-5 py-2.5 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 shadow-md transition-all active:scale-95">
                                + Agendar Cita Presencial
                            </button>
                        </div>

                        {/* Tabla Estilizada */}
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Agenda General del Día</h2>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
                                        <th className="px-6 py-4 font-bold">Hora</th>
                                        <th className="px-6 py-4 font-bold">Paciente</th>
                                        <th className="px-6 py-4 font-bold">Médico</th>
                                        <th className="px-6 py-4 font-bold">Especialidad</th>
                                        <th className="px-6 py-4 font-bold">Ubicación</th>
                                        <th className="px-6 py-4 font-bold text-center">Estado</th>
                                        <th className="px-6 py-4 font-bold text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-700">
                                    {citasFiltradas.length === 0 ? (
                                        <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">No se encontraron citas.</td></tr>
                                    ) : (
                                        citasFiltradas.map(cita => (
                                            <tr key={cita.idCita} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="px-6 py-4 font-bold text-gray-900">{cita.hora?.substring(0, 5)}</td>
                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-gray-800">{cita.paciente}</span><br />
                                                    <span className="text-xs text-gray-500">DNI: {cita.dni}</span>
                                                </td>
                                                <td className="px-6 py-4">{cita.personal}</td>
                                                <td className="px-6 py-4">{cita.especialidad}</td>
                                                <td className="px-6 py-4">
                                                    {cita.sede ? cita.sede : 'Por asignar'}<br />
                                                    <span className="text-xs font-bold text-blue-600">
                                                        {cita.consultorio ? `Cons: ${cita.consultorio}` : ''}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                                                        cita.estado === 'Pendiente de Pago' ? 'bg-orange-100 text-orange-700' :
                                                        cita.estado === 'En Espera' ? 'bg-blue-100 text-blue-700' :
                                                        cita.estado === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {cita.estado}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 flex justify-center gap-2">
                                                    <a
                                                        href={`https://wa.me/51${cita.celular}?text=Hola%20${cita.paciente},%20te%20recordamos%20tu%20cita%20médica%20hoy%20a%20las%20${cita.hora}.%20¡Te%20esperamos!`}
                                                        target="_blank" rel="noopener noreferrer"
                                                        className="bg-gray-800 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-gray-900 transition-colors shadow-sm"
                                                    >
                                                        📱 WP
                                                    </a>
                                                    {cita.estado === 'Pendiente de Pago' && (
                                                        <button onClick={() => registrarPagoEnEfectivo(cita.idCita)} className="bg-green-500 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-green-600 transition-colors shadow-sm">
                                                            Cobrar
                                                        </button>
                                                    )}
                                                    {cita.estado === 'Pagado' && (
                                                        <button onClick={() => marcarLlegada(cita.idCita)} className="bg-blue-500 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-blue-600 transition-colors shadow-sm">
                                                            Llegada
                                                        </button>
                                                    )}
                                                    <button onClick={() => cancelarCita(cita.idCita)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-md text-xs font-bold hover:bg-red-100 transition-colors">
                                                        ✖
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* --- MODAL DE RESERVA ESTILIZADO --- */}
            {mostrarModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up">
                        <div className="bg-yellow-500 p-6 text-white text-center">
                            <h3 className="text-xl font-bold">Registro Presencial</h3>
                            <p className="text-yellow-100 text-sm">Ingresa los datos para asignar un turno al paciente</p>
                        </div>

                        <form onSubmit={handleAgendarCita} className="p-8 space-y-4">
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">ID Paciente</label>
                                    <input type="number" required
                                        className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-yellow-500 font-medium text-sm"
                                        value={nuevaCita.idPaciente} onChange={(e) => setNuevaCita({ ...nuevaCita, idPaciente: e.target.value })}
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">ID Médico</label>
                                    <input type="number" required
                                        className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-yellow-500 font-medium text-sm"
                                        value={nuevaCita.idPersonal} onChange={(e) => setNuevaCita({ ...nuevaCita, idPersonal: e.target.value })}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Especialidad</label>
                                <select required
                                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-yellow-500 font-medium text-sm"
                                    value={nuevaCita.especialidad} onChange={(e) => setNuevaCita({ ...nuevaCita, especialidad: e.target.value })}
                                >
                                    <option value="Medicina General">Medicina General</option>
                                    <option value="Nutricion">Nutrición</option>
                                    <option value="Psicologia">Psicología</option>
                                </select>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Pabellón / Sede</label>
                                    <input type="text" required placeholder="Ej. Pabellón A"
                                        className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-yellow-500 font-medium text-sm"
                                        value={nuevaCita.sede} onChange={(e) => setNuevaCita({ ...nuevaCita, sede: e.target.value })}
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Consultorio</label>
                                    <input type="text" required placeholder="Ej. 101"
                                        className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-yellow-500 font-medium text-sm"
                                        value={nuevaCita.consultorio} onChange={(e) => setNuevaCita({ ...nuevaCita, consultorio: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Fecha</label>
                                    <input type="date" required min={new Date().toISOString().split('T')[0]}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-yellow-500 font-medium text-sm"
                                        value={nuevaCita.fecha} onChange={(e) => setNuevaCita({ ...nuevaCita, fecha: e.target.value })}
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Hora</label>
                                    <input type="time" required
                                        className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-yellow-500 font-medium text-sm"
                                        value={nuevaCita.hora} onChange={(e) => setNuevaCita({ ...nuevaCita, hora: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setMostrarModal(false)}
                                    className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit"
                                    className="flex-1 py-3 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 shadow-md transition-colors">
                                    Confirmar Turno
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardAsistente;