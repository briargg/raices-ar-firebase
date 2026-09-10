import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const LoadingSpinner = ({ size = 'large' }) => {
  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-6xl'
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <FaSpinner className={`${sizeClasses[size]} text-blue-600 animate-spin`} />
      <p className="mt-4 text-gray-600 text-lg">Cargando...</p>
    </div>
  );
};

export default LoadingSpinner;
