import { 
  db, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from './firebase';
import { generatePlanSteps } from '../utils/helpers';

// Generar plan
export const generatePlan = async (uid, userData) => {
  try {
    const steps = generatePlanSteps(userData);
    
    await setDoc(doc(db, 'plans', uid), {
      steps: steps,
      totalSteps: steps.length,
      completedSteps: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { success: true, data: steps };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Obtener plan
export const getPlan = async (uid) => {
  try {
    const planDoc = await getDoc(doc(db, 'plans', uid));
    if (planDoc.exists()) {
      return { success: true, data: planDoc.data() };
    }
    return { success: false, error: 'Plan no encontrado' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Completar paso
export const completePlanStep = async (uid, stepId) => {
  try {
    const planRef = doc(db, 'plans', uid);
    const planDoc = await getDoc(planRef);
    
    if (!planDoc.exists()) {
      return { success: false, error: 'Plan no encontrado' };
    }

    const planData = planDoc.data();
    const updatedSteps = planData.steps.map(step => 
      step.id === stepId ? { ...step, isCompleted: true } : step
    );

    const completedCount = updatedSteps.filter(step => step.isCompleted).length;

    await updateDoc(planRef, {
      steps: updatedSteps,
      completedSteps: completedCount,
      updatedAt: serverTimestamp()
    });

    return { success: true, data: { steps: updatedSteps, completedSteps: completedCount } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Resetear plan
export const resetPlan = async (uid) => {
  try {
    await setDoc(doc(db, 'plans', uid), {
      steps: [],
      totalSteps: 0,
      completedSteps: 0,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Obtener progreso del plan
export const getPlanProgress = async (uid) => {
  try {
    const result = await getPlan(uid);
    if (result.success) {
      const { steps, totalSteps, completedSteps } = result.data;
      const percentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
      return {
        success: true,
        data: {
          total: totalSteps,
          completed: completedSteps,
          percentage: Math.round(percentage),
          steps: steps || []
        }
      };
    }
    return { success: false, error: 'Plan no encontrado' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
