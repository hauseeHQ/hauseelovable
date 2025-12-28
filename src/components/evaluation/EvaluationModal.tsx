import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Save } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Home, HomeEvaluation, RatingValue } from '../../types';
import { EVALUATION_CATEGORIES, calculateOverallRating, calculateCompletionPercentage } from '../../data/evaluationCategories';
import { saveEvaluation } from '../../lib/supabaseClient';
import EvaluationItemComponent from './EvaluationItem';
import { useToast } from '../ToastContainer';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface EvaluationModalProps {
  home: Home;
  evaluation: HomeEvaluation | null;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EvaluationModal({ home, evaluation, onClose, onUpdate }: EvaluationModalProps) {
  const { showError, showSuccess } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [ratings, setRatings] = useState<HomeEvaluation['ratings']>({});
  const [itemNotes, setItemNotes] = useState<HomeEvaluation['itemNotes']>({});
  const [sectionNotes, setSectionNotes] = useState<HomeEvaluation['sectionNotes']>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentSection = EVALUATION_CATEGORIES[currentSectionIndex];

  useEffect(() => {
    if (evaluation) {
      setRatings(evaluation.ratings || {});
      setItemNotes(evaluation.itemNotes || {});
      setSectionNotes(evaluation.sectionNotes || {});
    }
  }, [evaluation]);

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
  }, [ratings, itemNotes, sectionNotes, home.id, onUpdate, user, navigate]);

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

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentSectionIndex < EVALUATION_CATEGORIES.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  const handleSectionSelect = (index: number) => {
    setCurrentSectionIndex(index);
  };

  const handleClose = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await performSave();
    onClose();
  };

  const handleCloseClick = () => {
    const completionPercentage = calculateCompletionPercentage(ratings);
    if (completionPercentage > 0 && completionPercentage < 100) {
      setShowCloseConfirm(true);
    } else {
      handleClose();
    }
  };

  const getSectionProgress = (categoryId: string): number => {
    const category = EVALUATION_CATEGORIES.find((c) => c.id === categoryId);
    if (!category) return 0;

    const ratedItems = category.items.filter((item) => {
      const value = ratings[categoryId]?.[item.id];
      return value !== undefined && value !== null && value !== '';
    }).length;

    return Math.round((ratedItems / category.items.length) * 100);
  };

  const IconComponent = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[currentSection.icon] || Icons.Home;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{home.address}</h2>
            <p className="text-sm text-gray-600">{home.neighborhood}</p>
          </div>
          <button
            onClick={handleCloseClick}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 border-b border-gray-200 overflow-x-auto">
          {EVALUATION_CATEGORIES.map((category, index) => (
            <button
              key={category.id}
              onClick={() => handleSectionSelect(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                index === currentSectionIndex
                  ? 'bg-primary-400 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.title}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{currentSection.title}</h3>
                <p className="text-sm text-gray-600">
                  {getSectionProgress(currentSection.id)}% complete
                </p>
              </div>
            </div>

            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-primary-400 transition-all duration-300"
                style={{ width: `${getSectionProgress(currentSection.id)}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            {currentSection.items.map((item) => (
              <EvaluationItemComponent
                key={item.id}
                item={item}
                categoryId={currentSection.id}
                value={ratings[currentSection.id]?.[item.id] || null}
                note={itemNotes[item.id] || ''}
                onRatingChange={handleRatingChange}
                onNoteChange={handleNoteChange}
              />
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Section Notes (optional, max 1000 characters)
            </label>
            <textarea
              value={sectionNotes[currentSection.id] || ''}
              onChange={(e) => handleSectionNoteChange(currentSection.id, e.target.value)}
              placeholder={`Add any general notes about ${currentSection.title.toLowerCase()}...`}
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 resize-none"
            />
            <div className="text-xs text-gray-500 text-right mt-1">
              {(sectionNotes[currentSection.id] || '').length}/1000
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
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

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentSectionIndex === 0}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {currentSectionIndex === EVALUATION_CATEGORIES.length - 1 ? (
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Complete
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors font-medium flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {showCloseConfirm && (
        <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Save and Exit?</h3>
            <p className="text-gray-600 mb-6">
              Your evaluation is {calculateCompletionPercentage(ratings)}% complete. Your progress will be
              saved automatically.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Keep Editing
              </button>
              <button
                onClick={handleClose}
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
