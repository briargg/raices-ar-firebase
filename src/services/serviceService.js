import { 
  db, 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc,
  addDoc,
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit
} from './firebase';

// Obtener todos los servicios
export const getAllServices = async () => {
  try {
    const servicesRef = collection(db, 'services');
    const snapshot = await getDocs(servicesRef);
    const services = [];
    snapshot.forEach(doc => {
      services.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: services };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Obtener servicio por ID
export const getServiceById = async (serviceId) => {
  try {
    const serviceDoc = await getDoc(doc(db, 'services', serviceId));
    if (serviceDoc.exists()) {
      return { success: true, data: { id: serviceDoc.id, ...serviceDoc.data() } };
    }
    return { success: false, error: 'Servicio no encontrado' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Obtener servicios por categoría
export const getServicesByCategory = async (category) => {
  try {
    const servicesRef = collection(db, 'services');
    const q = query(servicesRef, where('category', '==', category));
    const snapshot = await getDocs(q);
    const services = [];
    snapshot.forEach(doc => {
      services.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: services };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Obtener servicios por ciudad
export const getServicesByCity = async (city) => {
  try {
    const servicesRef = collection(db, 'services');
    const q = query(servicesRef, where('city', '==', city));
    const snapshot = await getDocs(q);
    const services = [];
    snapshot.forEach(doc => {
      services.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: services };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Obtener servicios cercanos (simplificado)
export const getNearbyServices = async (lat, lng, radius = 10) => {
  try {
    const servicesRef = collection(db, 'services');
    const snapshot = await getDocs(servicesRef);
    const services = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.latitude && data.longitude) {
        const distance = calculateDistance(lat, lng, data.latitude, data.longitude);
        if (distance <= radius) {
          services.push({ id: doc.id, ...data, distance: Math.round(distance * 10) / 10 });
        }
      }
    });
    
    services.sort((a, b) => a.distance - b.distance);
    return { success: true, data: services };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Calcular distancia entre dos puntos (Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Crear servicio (admin)
export const createService = async (serviceData) => {
  try {
    const servicesRef = collection(db, 'services');
    const docRef = await addDoc(servicesRef, {
      ...serviceData,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Actualizar servicio
export const updateService = async (serviceId, data) => {
  try {
    await updateDoc(doc(db, 'services', serviceId), {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Eliminar servicio (soft delete)
export const deleteService = async (serviceId) => {
  try {
    await updateDoc(doc(db, 'services', serviceId), {
      isActive: false,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Obtener categorías únicas
export const getCategories = async () => {
  try {
    const result = await getAllServices();
    if (result.success) {
      const categories = [...new Set(result.data.map(s => s.category))];
      return { success: true, data: categories };
    }
    return { success: false, error: result.error };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Buscar servicios por texto
export const searchServices = async (searchTerm) => {
  try {
    const result = await getAllServices();
    if (result.success) {
      const filtered = result.data.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return { success: true, data: filtered };
    }
    return { success: false, error: result.error };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
