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
  query, 
  where,
  serverTimestamp,
  orderBy,
  limit
} from './firebase';

// Obtener alertas activas para un usuario
export const getAlertsForUser = async (userData) => {
  try {
    const { countryOfOrigin, destinationCity } = userData;
    const alertsRef = collection(db, 'alerts');
    const snapshot = await getDocs(alertsRef);
    const alerts = [];
    
    snapshot.forEach(docSnapshot => {
      const data = docSnapshot.data();
      
      // Verificar si la alerta es relevante
      const isTargetCountry = data.targetCountries?.includes('todos') || 
                             data.targetCountries?.includes(countryOfOrigin);
      const isTargetCity = data.targetCities?.includes('todos') || 
                          data.targetCities?.includes(destinationCity);
      
      // Verificar si no expiró
      const isExpired = data.expiresAt && data.expiresAt.toDate() < new Date();
      
      if (data.isActive && isTargetCountry && isTargetCity && !isExpired) {
        alerts.push({ id: docSnapshot.id, ...data });
      }
    });
    
    // Ordenar por fecha de creación (más recientes primero)
    alerts.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
    
    return { success: true, data: alerts };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Obtener todas las alertas (admin)
export const getAllAlerts = async () => {
  try {
    const alertsRef = collection(db, 'alerts');
    const q = query(alertsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const alerts = [];
    snapshot.forEach(doc => {
      alerts.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: alerts };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Crear alerta (admin)
export const createAlert = async (alertData) => {
  try {
    const alertsRef = collection(db, 'alerts');
    const docRef = await addDoc(alertsRef, {
      ...alertData,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Actualizar alerta
export const updateAlert = async (alertId, data) => {
  try {
    await updateDoc(doc(db, 'alerts', alertId), {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Desactivar alerta
export const deactivateAlert = async (alertId) => {
  try {
    await updateDoc(doc(db, 'alerts', alertId), {
      isActive: false,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Eliminar alerta
export const deleteAlert = async (alertId) => {
  try {
    await deleteDoc(doc(db, 'alerts', alertId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Obtener alertas por categoría
export const getAlertsByCategory = async (category) => {
  try {
    const alertsRef = collection(db, 'alerts');
    const q = query(alertsRef, where('category', '==', category), where('isActive', '==', true));
    const snapshot = await getDocs(q);
    const alerts = [];
    snapshot.forEach(doc => {
      alerts.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: alerts };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
