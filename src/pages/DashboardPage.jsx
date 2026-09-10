import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUser, 
  FaCalendarCheck, 
  FaMapMarkedAlt, 
  FaUsers,
  FaBell,
  FaArrowRight
} from 'react-icons/fa';
import { auth } from '../services/firebase';
import { getUserProfile } from '../services/userService';
import { getPlanProgress } from '../services/planService';
import { getAlertsForUser } from '../services/alertService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [planProgress, setPlanProgress] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      // Obtener perfil
      const userResult = await getUserProfile(currentUser.uid);
      if (userResult.success) {
        setUser(userResult.data);
      }

      // Obtener progreso del plan
      const planResult = await getPlanProgress(currentUser.uid);
      if (planResult.success) {
        setPlanProgress(planResult.data);
      }

      // Obtener alertas
      if (userResult.success) {
        const alertsResult = await getAlertsForUser(userResult.data);
        if (alertsResult.success) {
          setAlerts(alertsResult.data);
          setUnreadAlerts(alertsResult.data.length);
        }
      }
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">No estás autenticado</h2>
        <Link to="/login" className="text-blue-600 hover:underline">
          Iniciá sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          ¡Bienvenido, {user.fullName}!
        </h1>
        <p className="text-gray-600">
          Estás en {user.destinationCity || 'tu ciudad'}, Argentina.
          {user.profileCompleted ? ' ✅ Perfil completo' : ' ⚠️ Completá tu perfil'}
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Plan Card */}
        <Link 
          to="/plan" 
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <FaCalendarCheck className="text-3xl text-blue-600" />
            <FaArrowRight className="text-blue-600 opacity-0 group-hover:opacity-100 transition" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Tu Plan de Arribo</h3>
          {planProgress && planProgress.total > 0 ? (
            <>
              <p className="text-sm text-gray-600">
                {planProgress.completed}/{planProgress.total} completados
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${planProgress.percentage}%` }}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-600">Generá tu plan personalizado</p>
          )}
        </Link>

        {/* Services Card */}
        <Link 
          to="/services" 
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <FaMapMarkedAlt className="text-3xl text-green-600" />
            <FaArrowRight className="text-green-600 opacity-0 group-hover:opacity-100 transition" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Servicios Cercanos</h3>
          <p className="text-sm text-gray-600">Encontrá ayuda en tu ciudad</p>
        </Link>

        {/* Padrinos Card */}
        <Link 
          to="/padrinos" 
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <FaUsers className="text-3xl text-purple-600" />
            <FaArrowRight className="text-purple-600 opacity-0 group-hover:opacity-100 transition" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Red de Padrinos</h3>
          <p className="text-sm text-gray-600">Conectate con la comunidad</p>
        </Link>

        {/* Alerts Card */}
        <Link 
          to="/alerts" 
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition group relative"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="relative">
              <FaBell className="text-3xl text-orange-600" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadAlerts}
                </span>
              )}
            </div>
            <FaArrowRight className="text-orange-600 opacity-0 group-hover:opacity-100 transition" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Alertas</h3>
          <p className="text-sm text-gray-600">
            {unreadAlerts > 0 
              ? `${unreadAlerts} alertas nuevas` 
              : 'No hay alertas nuevas'}
          </p>
        </Link>
      </div>

      {/* Próximos pasos recomendados */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">📋 Próximos pasos recomendados</h2>
        <div className="space-y-3">
          {!user.profileCompleted && (
            <div className="border-l-4 border-yellow-500 pl-4 py-2 bg-yellow-50 rounded-r-lg">
              <p className="font-medium text-yellow-800">Completá tu perfil</p>
              <p className="text-sm text-gray-600">
                Contanos más sobre vos para un plan personalizado
              </p>
              <Link to="/profile" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
                Ir a perfil →
              </Link>
            </div>
          )}
          {user.profileCompleted && (!planProgress || planProgress.total === 0) && (
            <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r-lg">
              <p className="font-medium text-blue-800">Generá tu plan de arribo</p>
              <p className="text-sm text-gray-600">
                Obtené una guía paso a paso para tu integración
              </p>
              <Link to="/plan" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
                Generar plan →
              </Link>
            </div>
          )}
          {user.profileCompleted && planProgress && planProgress.total > 0 && planProgress.completed < planProgress.total && (
            <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded-r-lg">
              <p className="font-medium text-green-800">¡Seguí completando tu plan!</p>
              <p className="text-sm text-gray-600">
                Ya avanzaste {planProgress.completed} de {planProgress.total} pasos
              </p>
              <Link to="/plan" className="text-sm text-green-600 hover:underline mt-1 inline-block">
                Ver plan →
              </Link>
            </div>
          )}
          {user.profileCompleted && planProgress && planProgress.total > 0 && planProgress.completed === planProgress.total && (
            <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50 rounded-r-lg">
              <p className="font-medium text-purple-800">🎉 ¡Completaste tu plan de arribo!</p>
              <p className="text-sm text-gray-600">
                Ahora podés explorar servicios y conectar con la comunidad
              </p>
              <Link to="/services" className="text-sm text-purple-600 hover:underline mt-1 inline-block">
                Explorar servicios →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
