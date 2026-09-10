import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaUser, 
  FaCalendarCheck, 
  FaMapMarkedAlt, 
  FaSignOutAlt,
  FaUsers,
  FaBell,
  FaBars,
  FaTimes,
  FaUserFriends
} from 'react-icons/fa';
import { auth, onAuthStateChanged } from '../services/firebase';
import { logout } from '../services/authService';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Verificar si es admin (podrías tener un campo en Firestore)
        setIsAdmin(currentUser.email === 'admin@raicesar.com');
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      toast.success('Sesión cerrada');
      navigate('/');
    } else {
      toast.error('Error al cerrar sesión');
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600';
  };

  const NavLinks = () => (
    <>
      <Link to="/" className={`${isActive('/')} transition font-medium`}>
        <FaHome className="inline mr-1" /> Inicio
      </Link>
      {user && (
        <>
          <Link to="/dashboard" className={`${isActive('/dashboard')} transition font-medium`}>
            Dashboard
          </Link>
          <Link to="/plan" className={`${isActive('/plan')} transition font-medium`}>
            <FaCalendarCheck className="inline mr-1" /> Plan
          </Link>
          <Link to="/services" className={`${isActive('/services')} transition font-medium`}>
            <FaMapMarkedAlt className="inline mr-1" /> Servicios
          </Link>
          <Link to="/padrinos" className={`${isActive('/padrinos')} transition font-medium`}>
            <FaUserFriends className="inline mr-1" /> Padrinos
          </Link>
          <Link to="/alerts" className={`${isActive('/alerts')} transition font-medium`}>
            <FaBell className="inline mr-1" /> Alertas
          </Link>
          <Link to="/profile" className={`${isActive('/profile')} transition font-medium`}>
            <FaUser className="inline mr-1" /> Perfil
          </Link>
          {isAdmin && (
            <Link to="/admin" className="text-red-600 hover:text-red-700 transition font-medium">
              Admin
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 transition font-medium flex items-center gap-1"
          >
            <FaSignOutAlt /> Salir
          </button>
        </>
      )}
      {!user && (
        <>
          <Link to="/login" className={`${isActive('/login')} transition font-medium`}>
            Iniciar sesión
          </Link>
          <Link 
            to="/register" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Registrarse
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            <span className="text-blue-600">Raíces</span>
            <span className="text-gray-800">AR</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <NavLinks />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-600 hover:text-gray-800"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pt-4 border-t flex flex-col gap-4">
            <NavLinks />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
