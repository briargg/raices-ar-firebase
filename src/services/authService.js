import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  googleProvider,
  signInWithPopup,
  db,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from './firebase';

// Login con email y password
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Registro con email y password
export const registerWithEmail = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Actualizar perfil en Firebase Auth
    await updateProfile(user, {
      displayName: userData.fullName
    });

    // Guardar en Firestore
    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      email: email,
      uid: user.uid,
      role: 'user',
      isActive: true,
      profileCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Login con Google
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Verificar si el usuario existe en Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      // Crear usuario nuevo
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        fullName: user.displayName || 'Usuario',
        countryOfOrigin: '',
        destinationCity: '',
        phone: '',
        hasJob: false,
        familyMembers: 0,
        monthlyBudget: 0,
        profileCompleted: false,
        role: 'user',
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Logout
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Recuperar contraseña
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Obtener usuario actual
export const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Escuchar cambios en autenticación
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
