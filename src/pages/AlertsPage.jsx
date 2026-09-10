import React, { useState, useEffect } from 'react';
import { FaBell, FaPlus, FaTrash, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa';
import { auth } from '../services/firebase';
import { getUserProfile } from '../services/userService';
import {
  getAlertsForUser,
  getAllAlerts,
  createAlert,
  deactivateAlert,
  deleteAlert
} from '../services/alertService';
import { ALERT_CATEGORIES, COUNTRIES, CITIES } from '../utils/constants';
import { formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const emptyForm = {
  title: '',
  description: '',
  category: 'general',
  targetCountries: ['todos'],
  targetCities: ['todos']
};

const AlertsPage = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setLoading(true);
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const admin = currentUser.email === 'admin@raicesar.com';
    setIsAdmin(admin);

    const userResult = await getUserProfile(currentUser.uid);
    if (userResult.success) {
      setUserData(userResult.data);
    }

    await fetchAlerts(admin, userResult.success ? userResult.data : null);
    setLoading(false);
  };

  const fetchAlerts = async (admin, profile) => {
    const result = admin ? await getAllAlerts() : await getAlertsForUser(profile || {});
    if (result.success) {
      setAlerts(result.data);
    } else {
      toast.error('Error al cargar alertas');
    }
  };

  const filteredAlerts = selectedCategory === 'all'
    ? alerts
    : alerts.filter(a => a.category === selectedCategory);

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Completá título y descripción');
      return;
    }

    setCreating(true);
    const result = await createAlert(formData);
    if (result.success) {
      toast.success('Alerta creada');
      setFormData(emptyForm);
      setShowForm(false);
      await fetchAlerts(isAdmin, userData);
    } else {
      toast.error(result.error || 'Error al crear la alerta');
    }
    setCreating(false);
  };

  const handleDeactivate = async (alertId) => {
    const result = await deactivateAlert(alertId);
    if (result.success) {
      toast.success('Alerta desactivada');
      await fetchAlerts(isAdmin, userData);
    } else {
      toast.error(result.error || 'Error al desactivar la alerta');
    }
  };

  const handleDelete = async (alertId) => {
    if (!window.confirm('¿Eliminar esta alerta definitivamente?')) return;
    const result = await deleteAlert(alertId);
    if (result.success) {
      toast.success('Alerta eliminada');
      await fetchAlerts(isAdmin, userData);
    } else {
      toast.error(result.error || 'Error al eliminar la alerta');
    }
  };

  const toggleTarget = (field, value) => {
    setFormData(prev => {
      const current = prev[field];
      if (value === 'todos') {
        return { ...prev, [field]: ['todos'] };
      }
      const withoutTodos = current.filter(v => v !== 'todos');
      const updated = withoutTodos.includes(value)
        ? withoutTodos.filter(v => v !== value)
        : [...withoutTodos, value];
      return { ...prev, [field]: updated.length ? updated : ['todos'] };
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!userData && !isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">No estás autenticado</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FaBell className="text-orange-600" /> Alertas
          </h1>
          <p className="text-gray-600">
            {isAdmin
              ? 'Gestioná las alertas visibles para la comunidad'
              : 'Cambios en leyes, empleo y novedades relevantes para vos'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition flex items-center gap-2"
          >
            <FaPlus /> Nueva alerta
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <form
          onSubmit={handleCreateAlert}
          className="bg-white rounded-xl shadow-md p-6 mb-8 space-y-5"
        >
          <h2 className="text-xl font-semibold">Crear nueva alerta</h2>

          <div>
            <label className="block font-medium mb-2">Título</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Ej: Nuevo requisito para el DNI de extranjeros"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Detalle de la novedad"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Categoría</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {ALERT_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-2">Países destinatarios</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => toggleTarget('targetCountries', 'todos')}
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  formData.targetCountries.includes('todos')
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              {COUNTRIES.map(c => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => toggleTarget('targetCountries', c.value)}
                  className={`px-3 py-1.5 rounded-full text-sm transition ${
                    formData.targetCountries.includes(c.value)
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium mb-2">Ciudades destinatarias</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => toggleTarget('targetCities', 'todos')}
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  formData.targetCities.includes('todos')
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              {CITIES.map(c => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => toggleTarget('targetCities', c.value)}
                  className={`px-3 py-1.5 rounded-full text-sm transition ${
                    formData.targetCities.includes(c.value)
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={creating}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50"
            >
              {creating ? 'Creando...' : 'Publicar alerta'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setFormData(emptyForm); }}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Filtro por categoría */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            selectedCategory === 'all'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
        {ALERT_CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedCategory === cat.value
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Listado de alertas */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <FaExclamationCircle className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-lg text-gray-600">No hay alertas para mostrar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map(alert => {
            const catInfo = ALERT_CATEGORIES.find(c => c.value === alert.category);
            return (
              <div
                key={alert.id}
                className={`bg-white rounded-xl shadow-md p-6 ${!alert.isActive ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{alert.title}</h3>
                  <span className="text-xs bg-orange-50 text-orange-700 px-3 py-1 rounded-full border border-orange-200 whitespace-nowrap">
                    {catInfo?.label || alert.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{alert.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{formatDate(alert.createdAt)}</span>
                  {isAdmin && (
                    <div className="flex gap-3">
                      {alert.isActive && (
                        <button
                          onClick={() => handleDeactivate(alert.id)}
                          className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                        >
                          <FaEyeSlash /> Desactivar
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="text-red-500 hover:text-red-700 flex items-center gap-1"
                      >
                        <FaTrash /> Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
