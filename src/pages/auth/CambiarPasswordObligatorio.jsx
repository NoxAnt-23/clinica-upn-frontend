import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CambiarPasswordObligatorio() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuarioActual'));

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      // Reutilizamos el endpoint que ya creamos para actualizar contraseñas
      const response = await fetch('http://localhost:8080/api/auth/actualizar-primer-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUsuario: usuario.idUsuario, password })
      });

      if (response.ok) {
        // Limpiamos sesión por seguridad para que ingrese con su nueva clave
        localStorage.removeItem('usuarioActual');
        alert("¡Contraseña actualizada con éxito! Por seguridad, inicia sesión nuevamente.");
        navigate('/login');
      } else {
        setError("No se pudo actualizar la contraseña. Inténtalo de nuevo.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100 animate-fade-in">
        
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-yellow-50 rounded-full text-yellow-600 mb-3">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Actualización Obligatoria</h2>
          <p className="text-xs text-gray-500 mt-1">Como medida de seguridad para tu primer ingreso al portal médico, debes cambiar la contraseña temporal asignada por el administrador.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium">
            {error}
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
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
            <input 
              type="password" 
              placeholder="Repite tu nueva contraseña"
              value={confirmPassword}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
              onChange={e => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] flex justify-center items-center ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/30'}`}
          >
            {isLoading ? <span className="animate-pulse">Guardando cambios...</span> : "Confirmar y Activar Cuenta"}
          </button>
        </form>

      </div>
    </div>
  );
}