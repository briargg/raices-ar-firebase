import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaMapMarkerAlt } from 'react-icons/fa';
import { getAllServices, getServicesByCategory, getServicesByCity, searchServices } from '../services/serviceService';
import { getCategories } from '../services/serviceService';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { SERVICE_CATEGORIES } from '../utils/constants';
import toast from 'react-hot-toast';

const ServicesPage = () => {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const result = await getAllServices();
    if (result.success) {
      setServices(result.data);
      setFilteredServices(result.data);
    } else {
      toast.error('Error al cargar servicios');
    }
    setLoading(false);
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      filterServices(selectedCategory, '');
      return;
    }
    
    const result = await searchServices(term);
    if (result.success) {
      setFilteredServices(result.data);
    }
  };

  const filterServices = (category, search = searchTerm) => {
    let filtered = services;
    
    if (category !== 'all') {
      filtered = filtered.filter(s => s.category === category);
    }
    
    if (search.trim()) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase()) ||
        s.address?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    setFilteredServices(filtered);
    setSelectedCategory(category);
  };

  const handleCategoryChange = (category) => {
    filterServices(category, searchTerm);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Servicios para Migrantes</h1>
      <p className="text-gray-600 mb-8">
        Encontrá oficinas públicas, hospitales, ONGs y más en tu ciudad
      </p>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden bg-gray-100 px-4 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition"
          >
            <FaFilter /> Filtros
          </button>
        </div>

        {/* Categories */}
        <div className={`mt-4 flex flex-wrap gap-2 ${showFilters ? 'flex' : 'hidden md:flex'}`}>
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          {SERVICE_CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedCategory === cat.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredServices.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <p className="text-lg text-gray-600 mb-2">No se encontraron servicios</p>
          <p className="text-gray-500">Probá con otros filtros o buscá en otra ciudad</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}

      {/* Results count */}
      {!loading && filteredServices.length > 0 && (
        <p className="text-sm text-gray-500 mt-6 text-center">
          Mostrando {filteredServices.length} servicios
        </p>
      )}
    </div>
  );
};

export default ServicesPage;
