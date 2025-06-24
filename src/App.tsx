import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import Navbar from './components/Navbar';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Footer from './components/Footer'; // Importar Footer
import { AuthProvider } from './context/AuthContext';
import './App.css';
import './index.css';
import FavoritesPage from './pages/FavoritesPage'; // Asegúrate de que la ruta de importación sea correcta

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#7f9edd] App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: '#3B82F6',
                color: '#fff',
                padding: '1rem',
                borderRadius: '0.5rem',
              },
            }}
            containerStyle={{
              top: '5rem',
            }}
          />
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/favorites" element={<FavoritesPage />} />
            </Routes>
          </main>
          <Footer /> {/* Agregar Footer aquí */}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
