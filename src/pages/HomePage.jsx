import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaMapMarkedAlt, 
  FaUserFriends, 
  FaCalendarCheck, 
  FaShieldAlt,
  FaArrowRight
} from 'react-icons/fa';

const HomePage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Bienvenido a <span className="text-yellow-300">Raíces AR</span>
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Tu guía personalizada para integrarte en Argentina. 
            Desde los trámites hasta la comunidad, te acompañamos paso a paso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-flex items-center justify-center gap-2"
            >
              Comenzá ahora <FaArrowRight />
            </Link>
            <Link 
              to="/login" 
              className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          ¿Qué ofrecemos?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <FaMapMarkedAlt className="text-3xl text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Mapa de Servicios</h3>
            <p className="text-gray-600">
              Encontrá oficinas públicas, hospitales, escuelas y ONGs cerca de vos.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <FaCalendarCheck className="text-3xl text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Plan de Arribo</h3>
            <p className="text-gray-600">
              Un calendario personalizado con los pasos que necesitás día a día.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="bg-purple-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <FaUserFriends className="text-3xl text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Red de Padrinos</h3>
            <p className="text-gray-600">
              Conectate con migrantes que ya están establecidos y te pueden guiar.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="bg-orange-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <FaShieldAlt className="text-3xl text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Alertas Inteligentes</h3>
            <p className="text-gray-600">
              Recibí notificaciones sobre cambios en leyes y oportunidades laborales.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-600">500+</div>
            <div className="text-gray-600">Servicios registrados</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600">15+</div>
            <div className="text-gray-600">Ciudades cubiertas</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600">1000+</div>
            <div className="text-gray-600">Migrantes ayudados</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
