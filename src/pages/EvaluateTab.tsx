import { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EvaluateTabType, EvaluateViewMode, Home, HomeEvaluation } from '../types';
import { useHomes } from '../hooks/useHomes';
import EvaluateBrowse from '../components/evaluate/EvaluateBrowse';
import { EvaluateCompare } from '../components/evaluate/EvaluateCompare';
import InspectionView from '../components/inspection/InspectionView';
import HomeDetailView from '../components/evaluate/HomeDetailView';
import RatingView from '../components/evaluation/RatingView';
import { useToast } from '../components/ToastContainer';
import { loadEvaluation } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface EvaluateTabProps {
  initialHomeId?: string;
}

export default function EvaluateTab({ initialHomeId }: EvaluateTabProps) {
  const [activeTab, setActiveTab] = useState<EvaluateTabType>('browse');
  const [viewMode, setViewMode] = useState<EvaluateViewMode>('tab');
  const [selectedHomeId, setSelectedHomeId] = useState<string | null>(initialHomeId || null);
  const [selectedHome, setSelectedHome] = useState<Home | null>(null);
  const [evaluation, setEvaluation] = useState<HomeEvaluation | null>(null);
  const [fadeTransition, setFadeTransition] = useState(false);
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const {
    homes,
    isLoading,
    addHome,
    toggleFavorite,
    toggleCompare,
    compareCount,
    comparableHomes,
  } = useHomes();

  useEffect(() => {
    if (initialHomeId && homes.length > 0) {
      const home = homes.find((h) => h.id === initialHomeId);
      if (home) {
        setSelectedHomeId(initialHomeId);
        setSelectedHome(home);
        setViewMode('detail');
        loadHomeEvaluation(initialHomeId);
      }
    }
  }, [initialHomeId, homes]);

  const loadHomeEvaluation = async (homeId: string) => {
    if (!user?.id) return;
    const { data } = await loadEvaluation(homeId, user.id);
    if (data) {
      setEvaluation(data);
    }
  };

  const handleHomeClick = (homeId: string) => {
    const home = homes.find((h) => h.id === homeId);
    if (home) {
      setSelectedHomeId(homeId);
      setSelectedHome(home);
      setViewMode('detail');
      loadHomeEvaluation(homeId);
      navigate(`/evaluate/${homeId}`, { replace: false });
    }
  };

  const handleBackToBrowse = () => {
    setViewMode('tab');
    setSelectedHomeId(null);
    setSelectedHome(null);
    setEvaluation(null);
    setActiveTab('browse');
    navigate('/evaluate', { replace: false });
  };

  const handleStartRating = async () => {
    if (selectedHomeId && user?.id) {
      await loadHomeEvaluation(selectedHomeId);
    }
    setViewMode('rating');
  };

  const handleBackToDetail = () => {
    setViewMode('detail');
    if (selectedHomeId) {
      loadHomeEvaluation(selectedHomeId);
    }
  };

  const handleGoToInspection = () => {
    setViewMode('tab');
    setActiveTab('inspection');
    navigate('/evaluate', { replace: false });
  };

  const handleEvaluationUpdate = async () => {
    if (selectedHomeId && user?.id) {
      const { data } = await loadEvaluation(selectedHomeId, user.id);
      if (data) {
        setEvaluation(data);
      }
    }
  };

  const handleTabChange = (newTab: EvaluateTabType) => {
    if (viewMode !== 'tab') {
      setViewMode('tab');
      setSelectedHomeId(null);
      setSelectedHome(null);
      setEvaluation(null);
      navigate('/evaluate', { replace: false });
    }

    setFadeTransition(true);
    setTimeout(() => {
      setActiveTab(newTab);
      setFadeTransition(false);
    }, 150);
  };

  const handlePreviousTab = () => {
    const tabs: EvaluateTabType[] = ['browse', 'compare', 'inspection'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      handleTabChange(tabs[currentIndex - 1]);
    }
  };

  const handleNextTab = () => {
    const tabs: EvaluateTabType[] = ['browse', 'compare', 'inspection'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      handleTabChange(tabs[currentIndex + 1]);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNextTab(),
    onSwipedRight: () => handlePreviousTab(),
    trackMouse: false,
    trackTouch: true,
    delta: 50,
  });

  const handleAddHome = async (formData: any) => {
    const result = await addHome(formData);
    if (result.success) {
      showSuccess('Home added successfully!');
      return { success: true };
    } else {
      showError(result.error || 'Failed to add home. Please try again.');
      return { success: false, error: result.error };
    }
  };

  const handleToggleCompare = async (homeId: string) => {
    const result = await toggleCompare(homeId);
    return result;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Evaluation</h1>

        <div className="relative">
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePreviousTab}
                className="hidden md:block p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                disabled={activeTab === 'browse'}
                aria-label="Previous tab"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <nav className="flex-1 flex space-x-8 justify-center" aria-label="Tabs">
                {(['browse', 'compare', 'inspection'] as EvaluateTabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={
                      `relative py-4 px-1 text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? 'text-primary-400 border-b-2 border-primary-400'
                          : 'text-gray-500 hover:text-gray-700'
                      }`
                    }
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {tab === 'compare' && compareCount > 0 && (
                      <span className="ml-1 px-2 py-0.5 bg-primary-400 text-white text-xs rounded-full">
                        {compareCount}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              <button
                onClick={handleNextTab}
                className="hidden md:block p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                disabled={activeTab === 'inspection'}
                aria-label="Next tab"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        {...swipeHandlers}
        className={`transition-opacity duration-300 ${fadeTransition ? 'opacity-0' : 'opacity-100'}`}
      >
        {viewMode === 'detail' && selectedHome ? (
          <HomeDetailView
            homeId={selectedHome.id}
            onBack={handleBackToBrowse}
            onStartRating={handleStartRating}
            onGoToInspection={handleGoToInspection}
          />
        ) : viewMode === 'rating' && selectedHome ? (
          <RatingView
            home={selectedHome}
            evaluation={evaluation}
            onBack={handleBackToDetail}
            onUpdate={handleEvaluationUpdate}
          />
        ) : (
          <>
            {activeTab === 'browse' && (
              <EvaluateBrowse
                homes={homes}
                isLoading={isLoading}
                compareCount={compareCount}
                onAddHome={handleAddHome}
                onToggleFavorite={toggleFavorite}
                onToggleCompare={handleToggleCompare}
                onCompareClick={() => setActiveTab('compare')}
                onHomeClick={handleHomeClick}
              />
            )}
            {activeTab === 'compare' && (
              <EvaluateCompare
                selectedHomeIds={comparableHomes.map((h) => h.id)}
                onBack={() => setActiveTab('browse')}
                allHomes={homes}
                onToggleCompare={handleToggleCompare}
              />
            )}
            {activeTab === 'inspection' && (
              <InspectionView
                homes={homes}
                onBackToBrowse={() => setActiveTab('browse')}
                initialHomeId={selectedHomeId}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
