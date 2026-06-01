import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      
      {/* Navbar Público */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-yellow-500 rounded-bl-xl rounded-tr-xl flex items-center justify-center text-white font-black text-xl shadow-sm">
                C
              </div>
              <div className="text-yellow-600 font-extrabold text-sm leading-tight tracking-tight">
                Clínica<br/>UPN
              </div>
            </div>
            
            {/* Enlaces (Desktop) */}
            <div className="hidden md:flex space-x-8">
              <a href="#servicios" className="text-gray-600 hover:text-yellow-600 font-bold transition-colors">Especialidades</a>
              <a href="#nosotros" className="text-gray-600 hover:text-yellow-600 font-bold transition-colors">Sedes</a>
              <a href="#contacto" className="text-gray-600 hover:text-yellow-600 font-bold transition-colors">Contacto</a>
            </div>

            {/* Botón Acceso */}
            <div>
              <button 
                onClick={() => navigate('/login')}
                className="bg-yellow-500 text-white px-6 py-2.5 rounded-full font-bold hover:bg-yellow-600 transition-colors shadow-md"
              >
                Acceder al Sistema
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section (Sección Principal) */}
      <main className="flex-1 flex flex-col md:flex-row items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 gap-12">
        <div className="md:w-1/2 space-y-6">
          <span className="text-yellow-600 font-bold tracking-wider uppercase text-sm">Salud e Innovación</span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
            Tu bienestar en las mejores manos
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Nuestra clínica universitaria cuenta con tecnología de punta y los mejores especialistas listos para brindarte una atención médica integral, rápida y confiable.
          </p>
          <div className="flex space-x-4 pt-4">
            <button 
              onClick={() => navigate('/login')}
              className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors shadow-lg"
            >
              Reserva tu cita
            </button>
            <button className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-8 py-3 rounded-full font-bold hover:bg-yellow-100 transition-colors">
              Conoce más
            </button>
          </div>
        </div>
        
        <div className="md:w-1/2 w-full">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Hospital Moderno" 
              className="w-full h-[400px] object-cover"
            />
            <div className="absolute inset-0 bg-yellow-500 mix-blend-multiply opacity-20"></div>
          </div>
        </div>
      </main>

      {/* Sección rápida de Servicios */}
      <section id="servicios" className="bg-gray-50 py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:border-yellow-400 transition-colors">
              <div className="text-3xl mb-4">🩺</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Medicina General</h3>
              <p className="text-gray-600">Atención primaria preventiva y diagnóstico para toda la familia.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:border-yellow-400 transition-colors">
              <div className="text-3xl mb-4">🔬</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Laboratorio Clínico</h3>
              <p className="text-gray-600">Exámenes precisos con resultados rápidos y confiables en línea.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:border-yellow-400 transition-colors">
              <div className="text-3xl mb-4">🚑</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Emergencias 24/7</h3>
              <p className="text-gray-600">Atención inmediata para situaciones críticas a cualquier hora.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="text-yellow-500 font-extrabold text-2xl tracking-tight mb-2">Clínica UPN</div>
            <p className="text-gray-400 text-sm">© 2026 Sistema de Gestión Hospitalaria.<br/>Todos los derechos reservados.</p>
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Términos de servicio</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Soporte técnico</a>
          </div>
        </div>
      </footer>

    </div>
  );
}