import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Heart, Star, ChevronLeft } from 'lucide-react';
import { Home, HomeEvaluation } from '../types';
import { loadHomes, updateHome, loadEvaluation } from '../lib/supabaseClient';
import { useToast } from '../components/ToastContainer';
import LoadingSpinner from '../components/LoadingSpinner';
import EvaluationModal from '../components/evaluation/EvaluationModal';
import { useAuth } from '../contexts/AuthContext';

export default function HomeDetailPage() {
  const { homeId } = useParams<{ homeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [home, setHome] = useState<Home | null>(null);
  const [evaluation, setEvaluation] = useState<HomeEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);

  useEffect(() => {
    if (homeId && user?.id) {
      loadHomeData();
    } else if (homeId && !user) {
      setIsLoading(false);
    }
  }, [homeId, user?.id]);

  const loadHomeData = async () => {
    if (!homeId || !user?.id) return;

    setIsLoading(true);
    try {
      const { data: homes } = await loadHomes(user.id);
      const foundHome = homes?.find((h) => h.id === homeId);

      if (foundHome) {
        setHome(foundHome);

        const { data: evalData } = await loadEvaluation(homeId, user.id);
        if (evalData) {
          setEvaluation(evalData);
        }
      } else {
        showError('Home not found');
        navigate('/evaluate');
      }
    } catch (err) {
      console.error('Error loading home:', err);
      showError('Failed to load home details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!home) return;

    const newFavoriteState = !home.favorite;
    setHome({ ...home, favorite: newFavoriteState });
    await updateHome(home.id, { favorite: newFavoriteState });
  };

  const handleOfferIntentChange = async (intent: 'yes' | 'maybe' | 'no') => {
    if (!home) return;

    setHome({ ...home, offerIntent: intent });
    await updateHome(home.id, { offerIntent: intent });
    showSuccess('Offer intent updated');
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleEvaluationUpdate = async () => {
    if (homeId && user?.id) {
      const { data: evalData } = await loadEvaluation(homeId, user.id);
      if (evalData) {
        setEvaluation(evalData);
      }

      const { data: homes } = await loadHomes(user.id);
      const updatedHome = homes?.find((h) => h.id === homeId);
      if (updatedHome) {
        setHome(updatedHome);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!home) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-sm">
            <button
              onClick={() => navigate('/evaluate')}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Browse
            </button>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate max-w-[200px] md:max-w-none">
              {home.address}
            </span>
          </nav>
        </div>
      </header>

      <section className="relative h-64 md:h-96 bg-gray-300">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

        <button
          onClick={handleToggleFavorite}
          className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors"
        >
          <Heart
            className={`w-6 h-6 ${home.favorite ? 'fill-primary-400 text-primary-400' : 'text-gray-600'}`}
          />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{home.address}</h1>
          <p className="text-lg mb-4">{home.neighborhood}</p>
          <div className="flex items-center gap-6 text-sm">
            <span>{home.bedrooms} bed</span>
            <span>{home.bathrooms} bath</span>
            {home.squareFootage && <span>{home.squareFootage.toLocaleString()} sq ft</span>}
          </div>
        </div>
      </section>

      <div className="bg-white border-y border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-sm font-medium text-gray-700">
              Would you make an offer on this home?
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleOfferIntentChange('yes')}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  home.offerIntent === 'yes'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => handleOfferIntentChange('maybe')}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  home.offerIntent === 'maybe'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Maybe
              </button>
              <button
                onClick={() => handleOfferIntentChange('no')}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  home.offerIntent === 'no'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                No
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Overall Rating</h3>
                <p className="text-sm text-gray-600">Your comprehensive score</p>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">
                {evaluation ? evaluation.overallRating.toFixed(1) : '0.0'}
              </span>
              <span className="text-gray-500">/ 5.0</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Listing Price</h3>
            <p className="text-3xl font-bold text-primary-400">{formatCurrency(home.price)}</p>
            {home.propertyTaxes && (
              <p className="text-sm text-gray-600 mt-2">
                Property taxes: {formatCurrency(home.propertyTaxes)}/year
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Evaluation Progress</h3>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-gray-900">
                {evaluation ? evaluation.completionPercentage : 0}%
              </span>
              <span className="text-gray-500">complete</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-400 transition-all duration-300"
                style={{ width: `${evaluation ? evaluation.completionPercentage : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {evaluation && evaluation.evaluationStatus !== 'not_started'
              ? 'Continue Your Evaluation'
              : 'Start Comprehensive Evaluation'}
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Rate this home across 9 categories with 100+ data points to make an informed decision.
            Your progress is automatically saved.
          </p>
          <button
            onClick={() => setShowEvaluationModal(true)}
            className="px-8 py-4 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors font-medium text-lg shadow-md hover:shadow-lg"
          >
            {evaluation && evaluation.evaluationStatus !== 'not_started'
              ? 'Continue Evaluation'
              : 'Start Evaluation'}
          </button>
        </div>
      </div>

      {showEvaluationModal && home && (
        <EvaluationModal
          home={home}
          evaluation={evaluation}
          onClose={() => setShowEvaluationModal(false)}
          onUpdate={handleEvaluationUpdate}
        />
      )}
    </div>
  );
}
