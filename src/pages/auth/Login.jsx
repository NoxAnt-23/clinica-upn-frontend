import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [isOlvidePassword, setIsOlvidePassword] = useState(false); // 🆕 Estado para alternar a la vista de recuperación
  const navigate = useNavigate();

  // --- ESTADOS PARA MEJORAR LA EXPERIENCIA (UX) ---
  const [isLoading, setIsLoading] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState(''); // 🆕 Estado para mensajes positivos

  // Estado para capturar los datos de inicio de sesión
  const [loginData, setLoginData] = useState({
    identificador: '',
    password: ''
  });

  // Estado para capturar el correo de recuperación
  const [correoRecuperacion, setCorreoRecuperacion] = useState(''); // 🆕

  // Estado unificado (Registro)
  const [formData, setFormData] = useState({
    nombre: '', 
    apellido: '', 
    dni: '', 
    celular: '000000000',      
    direccion: 'No registrado', 
    sexo: 'M',                 
    fechaNacimiento: '', 
    correo: '', 
    password: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMensajeError(''); 

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      if (response.ok) {
        const data = await response.json(); 
        localStorage.setItem('usuarioActual', JSON.stringify(data));
        
        // INTERSECCIÓN DE SEGURIDAD PARA ROLES (Soporta data.role y data.rol por si acaso)
        const rolCrudo = data.role || data.rol || '';
        const rolUsuario = rolCrudo.toString().toLowerCase().trim();
        
        // 🆕 VALIDACIÓN DE PRIMER INGRESO (CONTRASEÑA TEMPORAL)
        if (data.cambioPendiente === 1 || data.cambio_pendiente === 1) {
            navigate('/cambiar-password-obligatorio');
            return; // Cortamos el flujo aquí, no lo dejamos pasar a su dashboard
        }

        // Si no es su primer ingreso, pasa normal a sus vistas
        if (rolUsuario === 'admin') {
            navigate('/admin');
        } else if (rolUsuario === 'medico' || rolUsuario.includes('medico') || rolUsuario.includes('personal')) { 
            navigate('/medico');
        } else {
            navigate('/paciente');
        }
      } else {
        setMensajeError("Credenciales incorrectas. Verifica tu usuario y contraseña.");
      }
    } catch (error) {
      setMensajeError("No se pudo conectar con el servidor. Verifica que Spring Boot esté encendido.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMensajeError('');

    try {
      const response = await fetch('http://localhost:8080/api/pacientes/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert("¡Registro exitoso! Ya puedes iniciar sesión."); 
        setIsLogin(true); 
      } else {
        setMensajeError("Error al registrar. Revisa que el DNI o correo no existan ya.");
      }
    } catch (error) {
      setMensajeError("No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🆕 FUNCIÓN PARA ENVIAR EL CORREO MEDIANTE EL BACKEND
  const handleOlvidePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMensajeError('');
    setMensajeExito('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/olvide-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: correoRecuperacion })
      });

      if (response.ok) {
        setMensajeExito("Si el correo es válido, recibirás un enlace de recuperación en unos instantes.");
        setCorreoRecuperacion('');
      } else {
        setMensajeError("Hubo un problema al procesar la solicitud. Inténtalo de nuevo.");
      }
    } catch (error) {
      setMensajeError("Error de conexión con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#fafafa]">
      
      {/* LADO IZQUIERDO: IMAGEN DE LA CLÍNICA */}
      <div className="hidden md:block w-1/2 relative bg-gray-900 shadow-2xl z-10">
        <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Doctora Clínica UPN" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <div className="absolute bottom-12 left-12 text-white pr-12">
          <h2 className="text-4xl font-bold mb-4 text-yellow-400">Excelencia en Salud</h2>
          <p className="text-gray-200 text-lg">Nuestros especialistas están listos para brindarte la mejor atención.</p>
        </div>
      </div>

      {/* LADO DERECHO: FORMULARIOS */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-32 relative">
        
        {/* Botón de regresar al Home */}
        <div className="absolute top-8 left-8 sm:left-16 lg:left-32">
          <button 
            onClick={() => navigate('/')} 
            className="text-sm font-bold text-gray-400 hover:text-yellow-600 flex items-center transition-colors"
          >
            <span className="mr-2">←</span> Volver al inicio
          </button>
        </div>

        <div className="w-full max-w-sm mx-auto mt-12">
          
          {/* Ocultamos las pestañas si estamos en modo recuperar contraseña */}
          {!isOlvidePassword && (
            <div className="flex border-b border-gray-200 mb-8">
              <button onClick={() => {setIsLogin(true); setMensajeError(''); setMensajeExito('');}} className={`w-1/2 pb-3 text-center text-sm font-bold ${isLogin ? 'text-yellow-600 border-b-2 border-yellow-500' : 'text-gray-400'}`}>Ingresar</button>
              <button onClick={() => {setIsLogin(false); setMensajeError(''); setMensajeExito('');}} className={`w-1/2 pb-3 text-center text-sm font-bold ${!isLogin ? 'text-yellow-600 border-b-2 border-yellow-500' : 'text-gray-400'}`}>Registrarme</button>
            </div>
          )}

          {/* Mensajes de error/éxito visuales */}
          {mensajeError && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium animate-fade-in">
              {mensajeError}
            </div>
          )}
          {mensajeExito && (
            <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm font-medium animate-fade-in">
              {mensajeExito}
            </div>
          )}

          {/* CONTROL DE FLUJO TRIPLE: LOGUEAR, REGISTRAR O RECUPERAR */}
          {isOlvidePassword ? (
            /* 🆕 VISTA DE RECUPERACIÓN DE CONTRASEÑA */
            <form onSubmit={handleOlvidePassword} className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Recuperar Contraseña</h3>
                <p className="text-xs text-gray-500 mb-4">Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un enlace de recuperación seguro por Gmail.</p>
                <label className="block text-xs font-bold text-gray-700 mb-1">Correo Electrónico</label>
                <input 
                    type="email" 
                    placeholder="ejemplo@upn.pe" 
                    value={correoRecuperacion}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all" 
                    onChange={e => setCorreoRecuperacion(e.target.value)}
                    required 
                    disabled={isLoading}
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] flex justify-center items-center ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/30'}`}
              >
                {isLoading ? <span className="animate-pulse">Enviando correo...</span> : "Enviar Enlace"}
              </button>

              <button 
                type="button"
                onClick={() => {setIsOlvidePassword(false); setMensajeError(''); setMensajeExito('');}}
                className="w-full text-center text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors pt-2"
              >
                Volver al inicio de sesión
              </button>
            </form>
          ) : isLogin ? (
            /* FORMULARIO DE LOGIN NORMAL */
            <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Correo o Número de documento</label>
                  <input 
                      type="text" 
                      placeholder="Ingresa tu correo o DNI" 
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all" 
                      onChange={e => setLoginData({...loginData, identificador: e.target.value})}
                      required 
                      disabled={isLoading}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-gray-700">Contraseña</label>
                      {/* 🆕 Evento onClick añadido para activar la recuperación */}
                      <button 
                        type="button" 
                        onClick={() => {setIsOlvidePassword(true); setMensajeError(''); setMensajeExito('');}}
                        className="text-[10px] font-bold text-yellow-600 hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                  </div>
                  <input 
                      type="password" 
                      placeholder="Ingresa tu contraseña" 
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all" 
                      onChange={e => setLoginData({...loginData, password: e.target.value})}
                      required 
                      disabled={isLoading}
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className={`w-full text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] flex justify-center items-center ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/30'}`}
                >
                  {isLoading ? <span className="animate-pulse">Procesando...</span> : "Iniciar sesión"}
                </button>
            </form>
          ) : (
            /* FORMULARIO DE REGISTRO */
            <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Nombre" className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-yellow-500 outline-none" onChange={e => setFormData({...formData, nombre: e.target.value})} required disabled={isLoading} />
                  <input placeholder="Apellido" className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-yellow-500 outline-none" onChange={e => setFormData({...formData, apellido: e.target.value})} required disabled={isLoading}/>
                </div>
                <input placeholder="DNI" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-yellow-500 outline-none" onChange={e => setFormData({...formData, dni: e.target.value})} required disabled={isLoading}/>
                <input type="email" placeholder="Correo" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-yellow-500 outline-none" onChange={e => setFormData({...formData, correo: e.target.value})} required disabled={isLoading}/>
                <input type="password" placeholder="Contraseña" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-yellow-500 outline-none" onChange={e => setFormData({...formData, password: e.target.value})} required disabled={isLoading}/>
                <div className="pt-2">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">FECHA DE NACIMIENTO</label>
                    <input type="date" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-yellow-500 outline-none text-gray-600" onChange={e => setFormData({...formData, fechaNacimiento: e.target.value})} required disabled={isLoading}/>
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className={`w-full mt-2 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] flex justify-center items-center ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/30'}`}
                >
                  {isLoading ? <span className="animate-pulse">Guardando datos...</span> : "Completar Registro"}
                </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}