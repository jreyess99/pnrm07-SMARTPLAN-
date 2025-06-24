import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <nav className="bg-indigo-900 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center">
           <img src={logo} alt="Panorama Logo" className="h-20 w-auto" /> 
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-white hover:text-accent font-semibold transition-colors">Inicio</Link>
            <Link to="/favorites" className="text-white hover:text-accent font-semibold transition-colors">Favoritos</Link>
            <Link to="/profile" className="text-white hover:text-accent font-semibold transition-colors">Perfil</Link>
            {user ? (
              <>
                <span className="text-white font-semibold">{user.email}</span>
                <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">Cerrar sesión</button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-700 transition-colors">Login</Link>
                <Link to="/register" className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-700 transition-colors">Registrarse</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;