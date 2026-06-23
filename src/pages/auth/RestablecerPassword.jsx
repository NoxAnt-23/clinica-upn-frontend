import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function RestablecerPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Capturamos el token directamente desde la URL (?token=xyz)
  const token = searchParams.get('token');

  // --- ESTADOS ---
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeError('');
    setMensajeExito('');

    // Validación básica en el cliente
    if (password !== confirmPassword) {
      setMensajeError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setMensajeError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/restablecer-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      if (response.ok) {
        setMensajeExito("¡Contraseña restablecida con éxito! Redirigiéndote al login...");
        setTimeout(() => {
          navigate('/login'); // Ajusta la ruta si tu login está en '/' o '/login'
        }, 3000);
      } else {
        const errorData = await response.json();
        setMensajeError(errorData.error || "El enlace es inválido o ya ha expirado.");
      }
    } catch (error) {
      setMensajeError("No se pudo conectar con el servidor. Inténtalo más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#fafafa] items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Crea tu nueva contraseña</h2>
          <p className="text-xs text-gray-500 mt-1">Ingresa tu nueva clave de acceso para el portal médico.</p>
        </div>

        {/* Alertas de Error / Éxito */}
        {mensajeError && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium">
            {mensajeError}
          </div>
        )}
        {mensajeExito && (
          <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm font-medium">
            {mensajeExito}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nueva Contraseña</label>
            <input 
              type="password" 
              placeholder="Mínimo 6 caracteres"
              value={password}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
              onChange={e => setPassword(e.target.value)}
              required
              disabled={isLoading || mensajeExito}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
            <input 
              type="password" 
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
              onChange={e => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading || mensajeExito}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading || mensajeExito}
            className={`w-full text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] flex justify-center items-center ${isLoading || mensajeExito ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/30'}`}
          >
            {isLoading ? <span className="animate-pulse">Actualizando...</span> : "Restablecer Contraseña"}
          </button>
        </form>

      </div>
    </div>
  );
}