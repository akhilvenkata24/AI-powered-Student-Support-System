import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import ChatBot from './pages/ChatBot';
import Admissions from './pages/Admissions';
import MentalHealth from './pages/MentalHealth';
import AdminDashboard from './pages/AdminDashboard';
import VirtualCounselor from './pages/VirtualCounselor';
import EntryPortal from './pages/EntryPortal';

import { useEffect } from 'react';

function App() {
  const location = useLocation();
  const showNavbar = location.pathname !== '/';

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <Navbar />}
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<EntryPortal />} />
          <Route path="/home" element={<Dashboard />} />
          <Route path="/chat" element={<ChatBot />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/mental-health" element={<MentalHealth />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/virtual-counselor" element={<VirtualCounselor />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
