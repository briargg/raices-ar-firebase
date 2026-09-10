import { 
  db, 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where,
  serverTimestamp,
  addDoc
} from './firebase';

// Registrar padrino
export const registerPadrino = async (uid, padrinoData) => {
  try {
    await setDoc(doc(db, 'padrinos', uid), {
      userId: uid,
      ...padrinoData,
      isAvailable: true,
      rating: 0,
      totalRatings: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Actualizar rol del usuario
    await updateDoc(doc(db, 'users', uid), {
      role: 'padrino'
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Obtener padrino por ID
export const getPadrinoById = async (uid) => {
  try {
    const padrinoDoc = await getDoc(doc(db, 'padrinos', uid));
    if (padrinoDoc.exists()) {
      return { success: true, data: { uid, ...padrinoDoc.data() } };
    }
    return { success: false, error: 'Padrino no encontrado' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Obtener padrinos por ciudad
export const getPadrinosByCity = async (city) => {
  try {
    const padrinosRef = collection(db, 'padrinos');
    const q = query(padrinosRef, where('city', '==', city), where('isAvailable', '==', true));
    const snapshot = await getDocs(q);
    const padrinos = [];
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      // Obtener información del usuario
      const userResult = await getDoc(doc(db, 'users', data.userId));
      if (userResult.exists()) {
        const userData = userResult.data();
        padrinos.push({ 
          id: docSnapshot.id, 
          ...data, 
          user: { 
            uid: data.userId, 
            fullName: userData.fullName,
            email: userData.email,
            countryOfOrigin: userData.countryOfOrigin
          } 
        });
      }
    }
    
    return { success: true, data: padrinos };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Obtener padrinos por tema
export const getPadrinosByTopic = async (topic) => {
  try {
    const padrinosRef = collection(db, 'padrinos');
    const snapshot = await getDocs(padrinosRef);
    const padrinos = [];
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      if (data.topics && data.topics.includes(topic) && data.isAvailable) {
        // Obtener información del usuario
        const userResult = await getDoc(doc(db, 'users', data.userId));
        if (userResult.exists()) {
          const userData = userResult.data();
          padrinos.push({ 
            id: docSnapshot.id, 
            ...data, 
            user: { 
              uid: data.userId, 
              fullName: userData.fullName,
              email: userData.email,
              countryOfOrigin: userData.countryOfOrigin
            } 
          });
        }
      }
    }
    
    return { success: true, data: padrinos };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Calificar padrino
export const ratePadrino = async (padrinoId, rating, comment = '') => {
  try {
    const padrinoRef = doc(db, 'padrinos', padrinoId);
    const padrinoDoc = await getDoc(padrinoRef);
    
    if (!padrinoDoc.exists()) {
      return { success: false, error: 'Padrino no encontrado' };
    }

    const data = padrinoDoc.data();
    const newTotal = data.totalRatings + 1;
    const newRating = ((data.rating * data.totalRatings) + rating) / newTotal;

    await updateDoc(padrinoRef, {
      rating: newRating,
      totalRatings: newTotal,
      updatedAt: serverTimestamp()
    });

    // Guardar reseña
    await addDoc(collection(db, 'ratings'), {
      padrinoId,
      rating,
      comment,
      createdAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Actualizar disponibilidad del padrino
export const updatePadrinoAvailability = async (uid, isAvailable) => {
  try {
    await updateDoc(doc(db, 'padrinos', uid), {
      isAvailable,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Desregistrar padrino
export const unregisterPadrino = async (uid) => {
  try {
    await deleteDoc(doc(db, 'padrinos', uid));
    
    // Actualizar rol del usuario
    await updateDoc(doc(db, 'users', uid), {
      role: 'user'
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
