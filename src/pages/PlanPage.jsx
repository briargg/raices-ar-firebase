import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaCircle, FaSpinner, FaSync } from 'react-icons/fa';
import { auth } from '../services/firebase';
import { getPlan, generatePlan, completePlanStep, resetPlan } from '../services/planService';
import { getUserProfile } from '../services/userService';
import { getCategoryLabel, getCategoryColor } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const PlanPage = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [steps, setSteps] = useState([]);
  const [progress, setProgress] = useState({ total: 0, completed: 0 });
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    setLoading(true);
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      // Obtener datos del usuario
      const userResult = await getUserProfile(currentUser.uid);
      if (userResult.success) {
        setUserData(userResult.data);
      }

      // Obtener plan
      const planResult = await getPlan(currentUser.uid);
      if (planResult.success) {
        const planData = planResult.data;
        setSteps(planData.steps || []);
        setProgress({
          total: planData.totalSteps || 0,
          completed: planData.completedSteps || 0
        });
      } else {
        setSteps([]);
        setProgress({ total: 0, completed: 0 });
      }
    } catch (error) {
      toast.error('Error al cargar el plan');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    if (!userData || !userData.profileCompleted) {
      toast.error('Completá tu perfil primero');
      return;
    }

    setGenerating(true);
    try {
      const result = await generatePlan(currentUser.uid, userData);
      if (result.success) {
        toast.success('Plan generado exitosamente');
        await fetchPlan();
      } else {
        toast.error(result.error || 'Error al generar el plan');
      }
    } catch (error) {
      toast.error('Error al generar el plan');
    } finally {
      setGenerating(false);
    }
  };

  const handleCompleteStep = async (stepId) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const result = await completePlanStep(currentUser.uid, stepId);
      if (result.success) {
        toast.success('¡Paso completado!');
        await fetchPlan();
      } else {
        toast.error(result.error || 'Error al completar el paso');
      }
    } catch (error) {
      toast.error('Error al completar el paso');
    }
  };

  const handleResetPlan = async () => {
    if (!window.confirm('¿Estás seguro de que querés resetear tu plan?')) return;

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const result = await resetPlan(currentUser.uid);
      if (result.success) {
        toast.success('Plan reseteado');
        await fetchPlan();
      } else {
        toast.error(result.error || 'Error al resetear el plan');
      }
    } catch (error) {
      toast.error('Error al resetear el plan');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const progressPercentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tu Plan de Arribo</h1>
          <p className="text-gray-600">Seguí estos pasos para una integración exitosa</p>
        </div>
        <div className="flex gap-3">
          {steps.length > 0 && (
            <button
              onClick={handleResetPlan}
              className="text-red-600 hover:text-red-700 px-4 py-2 rounded-lg border border-red-300 hover:border-red-400 transition flex items-center gap-2"
            >
              <FaSync /> Resetear
            </button>
          )}
          <button
            onClick={handleGeneratePlan}
            disabled={generating || !userData?.profileCompleted}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {generating ? (
              <>
                <FaSpinner className="animate-spin" /> Generando...
              </>
            ) : (
              'Generar Plan'
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {steps.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progreso: {progress.completed}/{progress.total} pasos
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Steps */}
      {steps.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <p className="text-lg font-semibold text-yellow-800 mb-2">
            No tenés un plan generado aún
          </p>
          <p className="text-gray-600 mb-6">
            Completá tu perfil y generá un plan personalizado con los pasos que necesitás
          </p>
          {!userData?.profileCompleted && (
            <p className="text-sm text-yellow-600 mb-4">
              ⚠️ Primero completá tu perfil en la sección "Mi Perfil"
            </p>
          )}
          <button
            onClick={handleGeneratePlan}
            disabled={generating || !userData?.profileCompleted}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {generating ? 'Generando...' : 'Generar Plan Ahora'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`bg-white rounded-xl shadow-md p-6 transition ${
                step.isCompleted ? 'opacity-75' : 'hover:shadow-lg'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => !step.isCompleted && handleCompleteStep(step.id)}
                  className={`mt-1 flex-shrink-0 ${
                    step.isCompleted
                      ? 'text-green-500 cursor-default'
                      : 'text-gray-300 hover:text-blue-500 cursor-pointer'
                  }`}
                  disabled={step.isCompleted}
                >
                  {step.isCompleted ? (
                    <FaCheckCircle className="text-2xl" />
                  ) : (
                    <FaCircle className="text-2xl" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className={`text-lg font-semibold ${step.isCompleted ? 'line-through text-gray-500' : ''}`}>
                      Día {step.day}: {step.title}
                    </h3>
                    <span className={`text-xs px-3 py-1 rounded-full ${getCategoryColor(step.category)}`}>
                      {getCategoryLabel(step.category)}
                    </span>
                  </div>
                  <p className={`mt-2 ${step.isCompleted ? 'text-gray-500' : 'text-gray-700'}`}>
                    {step.description}
                  </p>
                  {step.isCompleted && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      ✅ Completado
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanPage;
