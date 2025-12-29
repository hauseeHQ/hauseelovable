import { useState, useEffect } from 'react';
import { Heart, Star, Edit2, ChevronLeft } from 'lucide-react';
import { Home, HomeEvaluation } from '../../types';
import { loadHomes, updateHome, loadEvaluation } from '../../lib/supabaseClient';
import { useToast } from '../ToastContainer';
import LoadingSpinner from '../LoadingSpinner';
import EditHomeModal from '../homedetail/EditHomeModal';
import HomeDetailsSection from '../homedetail/HomeDetailsSection';
import EvaluationDetailsSection from '../homedetail/EvaluationDetailsSection';
import { useAuth } from '../../contexts/AuthContext';

interface HomeDetailViewProps {
  homeId: string;
  onBack: () => void;
  onStartRating: () => void;
}

export default function HomeDetailView({ homeId, onBack, onStartRating }: HomeDetailViewProps) {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [home, setHome] = useState<Home | null>(null);
  const [evaluation, setEvaluation] = useState<HomeEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

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
        onBack();
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

  const handleSaveHomeDetails = async (updates: Partial<Home>) => {
    if (!home) return;

    try {
      await updateHome(home.id, updates);
      setHome({ ...home, ...updates });
      showSuccess('Home details updated successfully');
      await loadHomeData();
    } catch (error) {
      console.error('Error updating home:', error);
      showError('Failed to update home details');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!home) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Browse
        </button>
      </div>

      <div className="relative bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl overflow-hidden mb-4" style={{ height: '280px' }}>
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

      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{home.address}</h1>
        <p className="text-gray-600">{home.neighborhood}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  evaluation && star <= Math.round(evaluation.overallRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          {evaluation && evaluation.overallRating > 0 ? (
            <>
              <span className="text-xl font-bold text-gray-900">
                {evaluation.overallRating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">
                ({evaluation.completionPercentage}% complete)
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-500">Not yet rated</span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3 text-center">
          Would you make an offer on this home?
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => handleOfferIntentChange('yes')}
            className={`flex-1 max-w-[120px] px-6 py-2.5 rounded-lg font-medium transition-all ${
              home.offerIntent === 'yes'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => handleOfferIntentChange('maybe')}
            className={`flex-1 max-w-[120px] px-6 py-2.5 rounded-lg font-medium transition-all ${
              home.offerIntent === 'maybe'
                ? 'bg-yellow-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Maybe
          </button>
          <button
            onClick={() => handleOfferIntentChange('no')}
            className={`flex-1 max-w-[120px] px-6 py-2.5 rounded-lg font-medium transition-all ${
              home.offerIntent === 'no'
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            No
          </button>
        </div>
      </div>

      <div className="text-center mb-6">

        <button
          onClick={onStartRating}
          className="inline-flex items-center gap-2 px-5 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          {evaluation && evaluation.evaluationStatus !== 'not_started' ? 'Edit Rating' : 'Rate this Home'}
        </button>
      </div>

      <div className="space-y-6">
        <HomeDetailsSection home={home} onEdit={() => setShowEditModal(true)} />
        <EvaluationDetailsSection evaluation={evaluation} />
      </div>

      {showEditModal && home && (
        <EditHomeModal
          home={home}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveHomeDetails}
        />
      )}
    </div>
  );
}
