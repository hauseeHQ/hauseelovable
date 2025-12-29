import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronDown, ChevronUp, Check, Save, ArrowUp, Star } from 'lucide-react';
import { Home, HomeEvaluation, RatingValue } from '../../types';
import { EVALUATION_CATEGORIES, calculateOverallRating, calculateCompletionPercentage } from '../../data/evaluationCategories';
import { saveEvaluation } from '../../lib/supabaseClient';
import EvaluationCategoryCard from './EvaluationCategoryCard';
import { useToast } from '../ToastContainer';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface RatingViewProps {
  home: Home;
  evaluation: HomeEvaluation | null;
  onBack: () => void;
  onUpdate: () => void;
}

export default function RatingView({ home, evaluation, onBack, onUpdate }: RatingViewProps) {
  const { showError } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [ratings, setRatings] = useState<HomeEvaluation['ratings']>({});
  const [itemNotes, setItemNotes] = useState<HomeEvaluation['itemNotes']>({});
  const [sectionNotes, setSectionNotes] = useState<HomeEvaluation['sectionNotes']>({});
  const [userOverallRating, setUserOverallRating] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (evaluation) {
      setRatings(evaluation.ratings || {});
      setItemNotes(evaluation.itemNotes || {});
      setSectionNotes(evaluation.sectionNotes || {});
      setUserOverallRating(evaluation.userOverallRating || null);
    }
  }, [evaluation]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const performSave = useCallback(async () => {
    if (!user?.id) {
      navigate('/signin', { state: { returnTo: window.location.pathname } });
      return;
    }

    setIsSaving(true);
    try {
      const overallRating = calculateOverallRating(ratings);
      const completionPercentage = calculateCompletionPercentage(ratings);

      const evaluationData = {
        homeId: home.id,
        userId: user.id,
        ratings,
        itemNotes,
        sectionNotes,
        overallRating,
        userOverallRating,
        completionPercentage,
        evaluationStatus: completionPercentage > 0 ? 'in_progress' as const : 'not_started' as const,
      };

      const { success, error } = await saveEvaluation(evaluationData);

      if (success) {
        setLastSaved(new Date());
        onUpdate();
      } else {
        console.error('Save error:', error);
      }
    } catch (err) {
      console.error('Error saving evaluation:', err);
    } finally {
      setIsSaving(false);
    }
  }, [ratings, itemNotes, sectionNotes, userOverallRating, home.id, onUpdate, user, navigate]);

  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      performSave();
    }, 1000);
  }, [performSave]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleRatingChange = useCallback((categoryId: string, itemId: string, value: RatingValue | number | string) => {
    setRatings((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [itemId]: value,
      },
    }));
    debouncedSave();
  }, [debouncedSave]);

  const handleNoteChange = useCallback((itemId: string, note: string) => {
    setItemNotes((prev) => ({
      ...prev,
      [itemId]: note,
    }));
    debouncedSave();
  }, [debouncedSave]);

  const handleSectionNoteChange = useCallback((sectionId: string, note: string) => {
    setSectionNotes((prev) => ({
      ...prev,
      [sectionId]: note.slice(0, 1000),
    }));
    debouncedSave();
  }, [debouncedSave]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleExpandAll = () => {
    setExpandedCategories(new Set(EVALUATION_CATEGORIES.map(c => c.id)));
  };

  const handleCollapseAll = () => {
    setExpandedCategories(new Set());
  };

  const handleOverallRatingChange = (rating: number) => {
    setUserOverallRating(rating);
    debouncedSave();
  };

  const handleBackClick = async () => {
    const completionPercentage = calculateCompletionPercentage(ratings);
    if (completionPercentage > 0 && completionPercentage < 100) {
      setShowBackConfirm(true);
    } else {
      handleConfirmBack();
    }
  };

  const handleConfirmBack = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await performSave();
    onBack();
  };

  const overallProgress = calculateCompletionPercentage(ratings);

  return (
    <div className="pb-8">
      <div className="mb-4">
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Details
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{home.address}</h1>
            <p className="text-gray-600">{home.neighborhood}</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            {isSaving ? (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4 animate-pulse text-primary-400" />
                <span>Saving...</span>
              </div>
            ) : lastSaved ? (
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-gray-900">{overallProgress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-400 transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Overall Home Rating
              </label>
              <p className="text-xs text-gray-600 mb-3">
                Rate your overall impression of this home (1-5 stars)
              </p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleOverallRatingChange(star)}
                    className="group transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        userOverallRating && star <= userOverallRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 group-hover:text-yellow-200'
                      }`}
                    />
                  </button>
                ))}
                {userOverallRating && (
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {userOverallRating} / 5
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleExpandAll}
            className="text-sm text-primary-400 hover:text-primary-500 transition-colors flex items-center gap-1"
          >
            <ChevronDown className="w-4 h-4" />
            Expand All
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={handleCollapseAll}
            className="text-sm text-primary-400 hover:text-primary-500 transition-colors flex items-center gap-1"
          >
            <ChevronUp className="w-4 h-4" />
            Collapse All
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {EVALUATION_CATEGORIES.map((category) => (
          <EvaluationCategoryCard
            key={category.id}
            category={category}
            categoryId={category.id}
            isExpanded={expandedCategories.has(category.id)}
            onToggle={() => handleToggleCategory(category.id)}
            ratings={ratings[category.id] || {}}
            itemNotes={itemNotes}
            sectionNote={sectionNotes[category.id] || ''}
            onRatingChange={handleRatingChange}
            onNoteChange={handleNoteChange}
            onSectionNoteChange={(note) => handleSectionNoteChange(category.id, note)}
          />
        ))}
      </div>

      {overallProgress === 100 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleConfirmBack}
            className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2 shadow-lg"
          >
            <Check className="w-5 h-5" />
            Complete Evaluation
          </button>
        </div>
      )}

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-4 bg-primary-400 text-white rounded-full shadow-lg hover:bg-primary-500 transition-all z-50"
          aria-label="Back to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}

      {showBackConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Save and Exit?</h3>
            <p className="text-gray-600 mb-6">
              Your evaluation is {overallProgress}% complete. Your progress will be saved automatically.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBackConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Keep Editing
              </button>
              <button
                onClick={handleConfirmBack}
                className="flex-1 px-4 py-2 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors"
              >
                Save & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
