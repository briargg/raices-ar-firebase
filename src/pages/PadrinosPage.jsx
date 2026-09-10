import React, { useState, useEffect } from 'react';
import { FaUserFriends, FaStar, FaMapMarkerAlt, FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import { auth } from '../services/firebase';
import { getUserProfile } from '../services/userService';
import {
  getPadrinosByCity,
  getPadrinosByTopic,
  registerPadrino,
  unregisterPadrino,
  ratePadrino,
  getPadrinoById
} from '../services/padrinoService';
import { PADRINO_TOPICS } from '../utils/constants';
import { getInitials } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const PadrinosPage = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isPadrino, setIsPadrino] = useState(false);
  const [padrinos, setPadrinos] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [ratingFor, setRatingFor] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [formTopics, setFormTopics] = useState([]);
  const [formBio, setFormBio] = useState('');

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setLoading(true);
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const userResult = await getUserProfile(currentUser.uid);
    if (userResult.success) {
      setUserData(userResult.data);

      const padrinoResult = await getPadrinoById(currentUser.uid);
      setIsPadrino(padrinoResult.success);

      if (userResult.data.destinationCity) {
        await fetchPadrinos(userResult.data.destinationCity, 'all');
      }
    }
    setLoading(false);
  };

  const fetchPadrinos = async (city, topic) => {
    const result = topic === 'all'
      ? await getPadrinosByCity(city)
      : await getPadrinosByTopic(topic);

    if (result.success) {
      // Si filtramos por tema, restringimos también a la ciudad del usuario cuando corresponda
      const data = topic === 'all'
        ? result.data
        : result.data.filter(p => p.city === city);
      setPadrinos(data);
    } else {
      toast.error('Error al cargar padrinos');
    }
  };

  const handleTopicChange = async (topic) => {
    setSelectedTopic(topic);
    if (userData?.destinationCity) {
      await fetchPadrinos(userData.destinationCity, topic);
    }
  };

  const handleToggleTopic = (topicValue) => {
    setFormTopics(prev =>
      prev.includes(topicValue)
        ? prev.filter(t => t !== topicValue)
        : [...prev, topicValue]
    );
  };

  const handleRegisterAsPadrino = async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser || !userData) return;

    if (formTopics.length === 0) {
      toast.error('Elegí al menos un tema en el que puedas ayudar');
      return;
    }

    setRegistering(true);
    const result = await registerPadrino(currentUser.uid, {
      city: userData.destinationCity,
      countryOfOrigin: userData.countryOfOrigin,
      topics: formTopics,
      bio: formBio
    });

    if (result.success) {
      toast.success('¡Ahora sos padrino! Gracias por ayudar a la comunidad');
      setIsPadrino(true);
      setShowRegisterForm(false);
      await fetchPadrinos(userData.destinationCity, selectedTopic);
    } else {
      toast.error(result.error || 'Error al registrarte como padrino');
    }
    setRegistering(false);
  };

  const handleUnregister = async () => {
    if (!window.confirm('¿Seguro que querés dejar de ser padrino?')) return;
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const result = await unregisterPadrino(currentUser.uid);
    if (result.success) {
      toast.success('Ya no figurás como padrino');
      setIsPadrino(false);
      await fetchPadrinos(userData.destinationCity, selectedTopic);
    } else {
      toast.error(result.error || 'Error al procesar la solicitud');
    }
  };

  const handleSubmitRating = async (padrinoId) => {
    const result = await ratePadrino(padrinoId, ratingValue, ratingComment);
    if (result.success) {
      toast.success('¡Gracias por tu calificación!');
      setRatingFor(null);
      setRatingComment('');
      setRatingValue(5);
      await fetchPadrinos(userData.destinationCity, selectedTopic);
    } else {
      toast.error(result.error || 'Error al enviar la calificación');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!userData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">No estás autenticado</h2>
      </div>
    );
  }

  if (!userData.destinationCity) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-lg text-gray-600">
          Completá tu perfil con tu ciudad de destino para ver padrinos cerca tuyo.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FaUserFriends className="text-purple-600" /> Red de Padrinos
          </h1>
          <p className="text-gray-600">
            Migrantes ya establecidos en {userData.destinationCity} que pueden guiarte
          </p>
        </div>

        {isPadrino ? (
          <button
            onClick={handleUnregister}
            className="text-red-600 hover:text-red-700 px-4 py-2 rounded-lg border border-red-300 hover:border-red-400 transition"
          >
            Dejar de ser padrino
          </button>
        ) : (
          <button
            onClick={() => setShowRegisterForm(!showRegisterForm)}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Quiero ser padrino
          </button>
        )}
      </div>

      {isPadrino && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-8 flex items-center gap-2 text-purple-800">
          <FaCheckCircle /> Ya formás parte de la red de padrinos. ¡Gracias por ayudar!
        </div>
      )}

      {showRegisterForm && !isPadrino && (
        <form
          onSubmit={handleRegisterAsPadrino}
          className="bg-white rounded-xl shadow-md p-6 mb-8 space-y-5"
        >
          <h2 className="text-xl font-semibold">Registrarme como padrino</h2>

          <div>
            <label className="block font-medium mb-2">¿En qué temas podés ayudar?</label>
            <div className="flex flex-wrap gap-2">
              {PADRINO_TOPICS.map(topic => (
                <button
                  type="button"
                  key={topic.value}
                  onClick={() => handleToggleTopic(topic.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    formTopics.includes(topic.value)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium mb-2">Contanos un poco sobre vos</label>
            <textarea
              value={formBio}
              onChange={(e) => setFormBio(e.target.value)}
              rows={4}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ej: Llegué hace 2 años desde Venezuela, trabajo en gastronomía y puedo ayudarte con trámites y búsqueda de empleo."
            />
          </div>

          <button
            type="submit"
            disabled={registering}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
          >
            {registering ? 'Registrando...' : 'Confirmar registro'}
          </button>
        </form>
      )}

      {/* Filtro por tema */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => handleTopicChange('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            selectedTopic === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        {PADRINO_TOPICS.map(topic => (
          <button
            key={topic.value}
            onClick={() => handleTopicChange(topic.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedTopic === topic.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {topic.label}
          </button>
        ))}
      </div>

      {/* Listado de padrinos */}
      {padrinos.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <p className="text-lg text-gray-600 mb-2">
            Todavía no hay padrinos disponibles en {userData.destinationCity}
          </p>
          <p className="text-gray-500">Probá con otro tema, o sé el primero en sumarte</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {padrinos.map(padrino => (
            <div key={padrino.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0">
                  {getInitials(padrino.user?.fullName)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{padrino.user?.fullName}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <FaMapMarkerAlt className="text-purple-400" /> {padrino.city}
                  </p>
                </div>
              </div>

              {padrino.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{padrino.bio}</p>
              )}

              <div className="flex flex-wrap gap-1 mb-4">
                {padrino.topics?.map(t => {
                  const topicInfo = PADRINO_TOPICS.find(pt => pt.value === t);
                  return (
                    <span
                      key={t}
                      className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full border border-purple-200"
                    >
                      {topicInfo?.label || t}
                    </span>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <FaStar className="text-yellow-400" />
                  {padrino.rating ? padrino.rating.toFixed(1) : 'Sin calificar'}
                  {padrino.totalRatings > 0 && ` (${padrino.totalRatings})`}
                </span>
                {padrino.user?.email && (
                  <a
                    href={`mailto:${padrino.user.email}`}
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <FaEnvelope /> Contactar
                  </a>
                )}
              </div>

              {ratingFor === padrino.id ? (
                <div className="border-t pt-4 space-y-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setRatingValue(star)}
                        type="button"
                      >
                        <FaStar
                          className={star <= ratingValue ? 'text-yellow-400' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    rows={2}
                    placeholder="Comentario (opcional)"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSubmitRating(padrino.id)}
                      className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition"
                    >
                      Enviar
                    </button>
                    <button
                      onClick={() => setRatingFor(null)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setRatingFor(padrino.id)}
                  className="w-full border border-purple-300 text-purple-600 py-2 rounded-lg text-sm font-medium hover:bg-purple-50 transition"
                >
                  Calificar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PadrinosPage;
