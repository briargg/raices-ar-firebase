import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { getUserProfile, updateUserProfile } from '../services/userService';
import { COUNTRIES, CITIES } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    countryOfOrigin: '',
    destinationCity: '',
    phone: '',
    hasJob: false,
    familyMembers: 0,
    monthlyBudget: 0
  });

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchProfile(currentUser.uid);
  }, []);

  const fetchProfile = async (uid) => {
    setLoading(true);
    const result = await getUserProfile(uid);
    if (result.success) {
      const data = result.data;
      setUser(data);
      setFormData({
        fullName: data.fullName || '',
        countryOfOrigin: data.countryOfOrigin || '',
        destinationCity: data.destinationCity || '',
        phone: data.phone || '',
        hasJob: data.hasJob || false,
        familyMembers: data.familyMembers || 0,
        monthlyBudget: data.monthlyBudget || 0
      });
    } else {
      toast.error('Error al cargar perfil');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setSaving(true);
    const result = await updateUserProfile(currentUser.uid, {
      ...formData,
      profileCompleted: true
    });
    
    if (result.success) {
      toast.success('Perfil actualizado exitosamente');
      await fetchProfile(currentUser.uid);
    } else {
      toast.error('Error al actualizar perfil');
    }
    setSaving(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <h1 className="text-3xl font-bold mb-2">Mi Perfil</h1>
        <p className="text-gray-600 mb-6">Completá tus datos para recibir un plan personalizado</p>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p><strong>Email:</strong> {user?.email}</p>
          <p className="mt-1">
            <span className={`inline-block px-3 py-1 rounded-full text-sm ${
              user?.profileCompleted 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {user?.profileCompleted ? '✅ Perfil completo' : '⚠️ Perfil incompleto'}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-medium mb-2">Nombre completo</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">País de origen</label>
            <select
              name="countryOfOrigin"
              value={formData.countryOfOrigin}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccioná tu país</option>
              {COUNTRIES.map(country => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-2">Ciudad de destino</label>
            <select
              name="destinationCity"
              value={formData.destinationCity}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccioná tu ciudad</option>
              {CITIES.map(city => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-2">Teléfono</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="11 1234-5678"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="hasJob"
              checked={formData.hasJob}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <label className="font-medium">Ya tengo trabajo en Argentina</label>
          </div>

          <div>
            <label className="block font-medium mb-2">
              Personas en tu familia que te acompañan
            </label>
            <input
              type="number"
              name="familyMembers"
              value={formData.familyMembers}
              onChange={handleChange}
              min="0"
              max="10"
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">
              Presupuesto mensual estimado (ARS)
            </label>
            <input
              type="number"
              name="monthlyBudget"
              value={formData.monthlyBudget}
              onChange={handleChange}
              min="0"
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: 200000"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
