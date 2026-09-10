import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaClock } from 'react-icons/fa';
import { getCategoryLabel, getCategoryColor } from '../utils/helpers';

const ServiceCard = ({ service }) => {
  return (
    <Link 
      to={`/services/${service.id}`}
      className="block bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800 flex-1">
            {service.name}
          </h3>
          <span className={`text-xs px-3 py-1 rounded-full ${getCategoryColor(service.category)}`}>
            {getCategoryLabel(service.category)}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {service.description || 'Sin descripción disponible'}
        </p>
        
        <div className="space-y-2 text-sm text-gray-500">
          {service.address && (
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-500 flex-shrink-0" />
              <span>{service.address}</span>
            </div>
          )}
          {service.phone && (
            <div className="flex items-center gap-2">
              <FaPhone className="text-green-500 flex-shrink-0" />
              <span>{service.phone}</span>
            </div>
          )}
          {service.schedule && (
            <div className="flex items-center gap-2">
              <FaClock className="text-orange-500 flex-shrink-0" />
              <span>{service.schedule}</span>
            </div>
          )}
        </div>

        {service.averageWaitTime > 0 && (
          <div className="mt-4 pt-4 border-t">
            <span className="text-sm text-gray-500">
              ⏱️ Tiempo de espera promedio: {service.averageWaitTime} min
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ServiceCard;
