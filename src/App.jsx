import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing'; // Nuestra nueva portada
import Login from './pages/auth/Login';
import RestablecerPassword from './pages/auth/RestablecerPassword';
import CambiarPasswordObligatorio from './pages/auth/CambiarPasswordObligatorio';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import DashboardMedico from './pages/medico/DashboardMedico';
import MisCitas from './pages/paciente/MisCitas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* La Portada Pública */}
        <Route path="/" element={<Landing />} />
        
        {/* El Login y Recuperación*/}
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-password" element={<RestablecerPassword />} />
        <Route path="/cambiar-password-obligatorio" element={<CambiarPasswordObligatorio />} />
        
        {/* Las vistas de los perfiles */}
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/medico" element={<DashboardMedico />} />
        <Route path="/paciente" element={<MisCitas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;