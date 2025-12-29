import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ChevronLeft } from 'lucide-react';
import { Home, HomeEvaluation } from '../types';
import { loadHomes, updateHome, loadEvaluation } from '../lib/supabaseClient';
import { useToast } from '../components/ToastContainer';
import LoadingSpinner from '../components/LoadingSpinner';
import EvaluationModal from '../components/evaluation/EvaluationModal';
import HomeDetailsSection from '../components/homedetail/HomeDetailsSection';
import EvaluationDetailsSection from '../components/homedetail/EvaluationDetailsSection';
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
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <button
            onClick={() => navigate('/evaluate')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Evaluate</span>
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="relative bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl overflow-hidden mb-6" style={{ height: '280px' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 bg-gray-400/30 rounded-full flex items-center justify-center">
                <div className="w-20 h-20 bg-gray-400/40 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="w-48 h-16 mx-auto bg-gray-400/30 rounded-lg" />
                <div className="w-64 h-12 mx-auto bg-gray-400/30 rounded-lg" />
              </div>
            </div>
          </div>

          <button
            onClick={handleToggleFavorite}
            className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${home.favorite ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`}
            />
          </button>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{home.address}</h1>
          <p className="text-gray-600 mb-4">{home.neighborhood}</p>
          <button
            onClick={() => setShowEvaluationModal(true)}
            className="px-8 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium shadow-sm"
          >
            Rate this Home
          </button>
        </div>

        <div className="space-y-6">
          <HomeDetailsSection home={home} />
          <EvaluationDetailsSection evaluation={evaluation} />
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
