import { 
  db, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  setDoc
} from './firebase';

// Obtener perfil de usuario
export const getUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { success: true, data: { uid, ...userDoc.data() } };
    }
    return { success: false, error: 'Usuario no encontrado' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Actualizar perfil
export const updateUserProfile = async (uid, data) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Obtener todos los usuarios (admin)
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const users = [];
    snapshot.forEach(doc => {
      users.push({ uid: doc.id, ...doc.data() });
    });
    return { success: true, data: users };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Buscar usuarios por ciudad
export const getUsersByCity = async (city) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('destinationCity', '==', city));
    const snapshot = await getDocs(q);
    const users = [];
    snapshot.forEach(doc => {
      users.push({ uid: doc.id, ...doc.data() });
    });
    return { success: true, data: users };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Verificar si el perfil está completo
export const isProfileComplete = async (uid) => {
  try {
    const result = await getUserProfile(uid);
    if (result.success) {
      const { countryOfOrigin, destinationCity, phone, hasJob } = result.data;
      return !!(countryOfOrigin && destinationCity && phone !== undefined && hasJob !== undefined);
    }
    return false;
  } catch (error) {
    return false;
  }
};
