// Generar pasos del plan
export const generatePlanSteps = (userData) => {
  const { countryOfOrigin, destinationCity, hasJob, familyMembers } = userData;
  const steps = [];
  
  // Día 1
  steps.push({
    id: `step-${Date.now()}-1`,
    day: 1,
    title: 'Activá tu línea telefónica',
    description: 'Comprá un chip y activá un plan de datos. Buscá un local de Personal, Claro o Movistar.',
    category: 'comunicacion',
    isCompleted: false
  });
  
  steps.push({
    id: `step-${Date.now()}-2`,
    day: 1,
    title: 'Conseguí la tarjeta SUBE',
    description: 'La SUBE es necesaria para el transporte público. Podés conseguirla en kioscos o estaciones.',
    category: 'transporte',
    isCompleted: false
  });
  
  // Día 2
  steps.push({
    id: `step-${Date.now()}-3`,
    day: 2,
    title: 'Iniciá el trámite para el DNI',
    description: 'Sacá turno en RENAPER para el DNI para extranjeros. Necesitás pasaporte y certificado de domicilio.',
    category: 'documentacion',
    isCompleted: false
  });
  
  steps.push({
    id: `step-${Date.now()}-4`,
    day: 2,
    title: 'Generá tu CUIL',
    description: 'Con el DNI en trámite, generá tu CUIL en ANSES. Es necesario para trabajar formalmente.',
    category: 'documentacion',
    isCompleted: false
  });
  
  // Día 3
  steps.push({
    id: `step-${Date.now()}-5`,
    day: 3,
    title: 'Certificado médico para residencia',
    description: 'Necesitás un certificado médico. Buscá un hospital público cercano.',
    category: 'salud',
    isCompleted: false
  });
  
  if (familyMembers > 0) {
    steps.push({
      id: `step-${Date.now()}-6`,
      day: 3,
      title: 'Certificados médicos para tu familia',
      description: `Tu familia (${familyMembers} personas) también necesita certificados médicos.`,
      category: 'salud',
      isCompleted: false
    });
  }
  
  // Día 5
  steps.push({
    id: `step-${Date.now()}-7`,
    day: 5,
    title: 'Presentá la carpeta en Migraciones',
    description: 'Con todos los documentos listos, andá a la oficina de Migraciones más cercana.',
    category: 'migraciones',
    isCompleted: false
  });
  
  // Día 7
  steps.push({
    id: `step-${Date.now()}-8`,
    day: 7,
    title: 'Abrí una cuenta bancaria',
    description: 'Buscá un banco que ofrezca cuentas gratuitas para extranjeros.',
    category: 'finanzas',
    isCompleted: false
  });
  
  if (hasJob) {
    steps.push({
      id: `step-${Date.now()}-9`,
      day: 7,
      title: 'Validá tu título universitario',
      description: 'Si trabajás en una profesión regulada, validá tu título en el Ministerio de Educación.',
      category: 'empleo',
      isCompleted: false
    });
  } else {
    steps.push({
      id: `step-${Date.now()}-10`,
      day: 7,
      title: 'Inscribite en programas de empleo',
      description: 'Registrate en plataformas de empleo y programas de inserción laboral.',
      category: 'empleo',
      isCompleted: false
    });
  }
  
  if (familyMembers > 0) {
    steps.push({
      id: `step-${Date.now()}-11`,
      day: 10,
      title: 'Buscá escuela para tus hijos',
      description: 'Los niños tienen derecho a educación pública. Buscá escuelas cercanas.',
      category: 'educacion',
      isCompleted: false
    });
  }
  
  // Día 15
  steps.push({
    id: `step-${Date.now()}-12`,
    day: 15,
    title: `Buscá alquiler definitivo en ${destinationCity}`,
    description: `Con el DNI podés firmar contratos. Investigá zonas y precios en ${destinationCity}.`,
    category: 'vivienda',
    isCompleted: false
  });
  
  // Día 30
  steps.push({
    id: `step-${Date.now()}-13`,
    day: 30,
    title: `Contactá a la comunidad de ${countryOfOrigin}`,
    description: `Conectá con otros migrantes de ${countryOfOrigin}. Buscá grupos en redes sociales.`,
    category: 'comunidad',
    isCompleted: false
  });
  
  return steps;
};

// Formatear fecha
export const formatDate = (timestamp) => {
  if (!timestamp) return 'Fecha no disponible';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Obtener categoría en español
export const getCategoryLabel = (category) => {
  const labels = {
    documentacion: '📄 Documentación',
    salud: '🏥 Salud',
    migraciones: '🛂 Migraciones',
    finanzas: '💰 Finanzas',
    empleo: '💼 Empleo',
    educacion: '📚 Educación',
    vivienda: '🏠 Vivienda',
    comunidad: '🤝 Comunidad',
    comunicacion: '📱 Comunicación',
    transporte: '🚌 Transporte',
    oficina_publica: '🏛️ Oficina Pública',
    ong: '❤️ ONG',
    financiero: '🏦 Financiero'
  };
  return labels[category] || category;
};

// Obtener color de categoría
export const getCategoryColor = (category) => {
  const colors = {
    documentacion: 'bg-blue-100 text-blue-700 border-blue-200',
    salud: 'bg-green-100 text-green-700 border-green-200',
    migraciones: 'bg-purple-100 text-purple-700 border-purple-200',
    finanzas: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    empleo: 'bg-orange-100 text-orange-700 border-orange-200',
    educacion: 'bg-pink-100 text-pink-700 border-pink-200',
    vivienda: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    comunidad: 'bg-red-100 text-red-700 border-red-200',
    comunicacion: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    transporte: 'bg-teal-100 text-teal-700 border-teal-200',
    oficina_publica: 'bg-gray-100 text-gray-700 border-gray-200',
    ong: 'bg-rose-100 text-rose-700 border-rose-200',
    financiero: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  };
  return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// Validar email
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validar teléfono argentino
export const isValidPhone = (phone) => {
  const regex = /^[0-9]{10,15}$/;
  return regex.test(phone.replace(/\s/g, ''));
};

// Truncar texto
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Obtener iniciales
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};
