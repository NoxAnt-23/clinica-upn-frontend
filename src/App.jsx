import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing'; // Nuestra nueva portada
import Login from './pages/auth/Login';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import DashboardMedico from './pages/medico/DashboardMedico';
import MisCitas from './pages/paciente/MisCitas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* La Portada Pública */}
        <Route path="/" element={<Landing />} />
        
        {/* El Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Las vistas de los perfiles */}
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/medico" element={<DashboardMedico />} />
        <Route path="/paciente" element={<MisCitas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;