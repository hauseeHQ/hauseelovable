import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { SelfAssessment, AssessmentStatus, CategoryScore } from '../../types';
import { saveAssessment, loadAssessment } from '../../lib/supabaseClient';
import { ASSESSMENT_QUESTIONS } from './assessmentQuestions';
import CategorySection from './CategorySection';
import AssessmentScoreCard from './AssessmentScoreCard';

const TEMP_USER_ID = 'temp-user-demo';
const TOTAL_QUESTIONS = 15;
const MAX_POINTS = 75;

const INITIAL_STATE: SelfAssessment = {
  answers: Array(TOTAL_QUESTIONS).fill(null),
  completedAt: null,
  score: null,
  status: 'incomplete',
  categoryScores: [],
  updatedAt: new Date().toISOString(),
};

export default function SelfAssessmentForm() {
  const navigate = useNavigate();
  const userId = TEMP_USER_ID;
  const [assessment, setAssessment] = useState<SelfAssessment>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const localData = localStorage.getItem(`hausee_assessment_${userId}`);
      const { data: dbData } = await loadAssessment(userId);

      if (dbData) {
        setAssessment(dbData);
      } else if (localData) {
        const parsed = JSON.parse(localData);
        setAssessment(parsed);
      }
    } catch (err) {
      console.error('Error loading assessment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateScore = (answers: (number | null)[]): number => {
    const totalPoints = answers.reduce((sum, answer) => sum + (answer || 0), 0);
    return (totalPoints / MAX_POINTS) * 100;
  };

  const determineStatus = (score: number): AssessmentStatus => {
    if (score >= 75) return 'ready';
    if (score >= 50) return 'on_track';
    return 'needs_preparation';
  };

  const calculateCategoryScores = (answers: (number | null)[]): CategoryScore[] => {
    const categories = [
      { name: 'Financial Readiness', category: 'financial', start: 0, end: 5 },
      { name: 'Knowledge Readiness', category: 'knowledge', start: 5, end: 10 },
      { name: 'Emotional Readiness', category: 'emotional', start: 10, end: 15 },
    ];

    return categories.map(({ name, category, start, end }) => {
      const categoryAnswers = answers.slice(start, end);
      const score = categoryAnswers.reduce((sum, answer) => sum + (answer || 0), 0);
      const maxScore = 25;
      const percentage = (score / maxScore) * 100;

      return {
        category: name,
        score,
        maxScore,
        percentage,
      };
    });
  };

  const debouncedSave = useCallback(
    (data: SelfAssessment) => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      const timeout = setTimeout(async () => {
        setIsSaving(true);
        const updatedData = { ...data, updatedAt: new Date().toISOString() };

        localStorage.setItem(
          `hausee_assessment_${userId}`,
          JSON.stringify(updatedData)
        );

        const result = await saveAssessment(userId, updatedData);

        if (!result.success) {
          console.error('Failed to save assessment');
        }

        setIsSaving(false);
      }, 500);

      setSaveTimeout(timeout);
    },
    [saveTimeout, userId]
  );

  const handleAnswerChange = (questionId: number, rating: number) => {
    const newAnswers = [...assessment.answers];
    newAnswers[questionId - 1] = rating;

    const answeredCount = newAnswers.filter(a => a !== null).length;
    const isComplete = answeredCount === TOTAL_QUESTIONS;

    let newScore = null;
    let newStatus: AssessmentStatus = 'incomplete';
    let newCategoryScores: CategoryScore[] = [];
    let completedAt = assessment.completedAt;

    if (isComplete) {
      newScore = calculateScore(newAnswers);
      newStatus = determineStatus(newScore);
      newCategoryScores = calculateCategoryScores(newAnswers);
      if (!completedAt) {
        completedAt = new Date().toISOString();
      }
    }

    const updatedAssessment: SelfAssessment = {
      answers: newAnswers,
      completedAt,
      score: newScore,
      status: newStatus,
      categoryScores: newCategoryScores,
      updatedAt: new Date().toISOString(),
    };

    setAssessment(updatedAssessment);
    debouncedSave(updatedAssessment);
  };

  const handleReset = async () => {
    const resetAssessment = { ...INITIAL_STATE };
    setAssessment(resetAssessment);

    localStorage.setItem(
      `hausee_assessment_${userId}`,
      JSON.stringify(resetAssessment)
    );

    await saveAssessment(userId, resetAssessment);
    setShowResetConfirm(false);
  };

  const getActionButtons = () => {
    const { status } = assessment;
    const answeredCount = assessment.answers.filter(a => a !== null).length;
    const isComplete = answeredCount === TOTAL_QUESTIONS;

    if (!isComplete) return null;

    switch (status) {
      case 'ready':
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              You're Ready to Buy!
            </h3>
            <p className="text-green-800 mb-4">
              Your assessment shows strong readiness across financial, knowledge, and emotional dimensions.
            </p>
            <button
              onClick={() => navigate('/evaluate')}
              className="w-full md:w-auto px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Property Search
            </button>
          </div>
        );

      case 'on_track':
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              You're On Track
            </h3>
            <p className="text-yellow-800 mb-4">
              You're making good progress. Consider reviewing a few areas to strengthen your readiness.
            </p>
            <div className="flex flex-col md:flex-row gap-3">
              <button
                onClick={() => navigate('/guide')}
                className="flex-1 px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Continue Learning
              </button>
            </div>
          </div>
        );

      case 'needs_preparation':
        return (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-900 mb-2">
              Build Your Foundation
            </h3>
            <p className="text-orange-800 mb-4">
              Focus on strengthening your financial position and knowledge before buying.
            </p>
            <div className="flex flex-col md:flex-row gap-3">
              <button
                onClick={() => navigate('/guide')}
                className="flex-1 px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
              >
                Review Learning Resources
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading assessment...</div>
      </div>
    );
  }

  const financialQuestions = ASSESSMENT_QUESTIONS.filter(q => q.category === 'financial');
  const knowledgeQuestions = ASSESSMENT_QUESTIONS.filter(q => q.category === 'knowledge');
  const emotionalQuestions = ASSESSMENT_QUESTIONS.filter(q => q.category === 'emotional');
  const answeredCount = assessment.answers.filter(a => a !== null).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Home Buying Readiness Assessment
            </h2>
            <p className="text-gray-600">
              Evaluate your readiness across financial, knowledge, and emotional dimensions.
            </p>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Reset assessment"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>
      </div>

      <AssessmentScoreCard
        score={assessment.score}
        status={assessment.status}
        answeredCount={answeredCount}
        totalQuestions={TOTAL_QUESTIONS}
      />

      <CategorySection
        category="financial"
        questions={financialQuestions}
        answers={assessment.answers}
        onAnswerChange={handleAnswerChange}
      />

      <CategorySection
        category="knowledge"
        questions={knowledgeQuestions}
        answers={assessment.answers}
        onAnswerChange={handleAnswerChange}
      />

      <CategorySection
        category="emotional"
        questions={emotionalQuestions}
        answers={assessment.answers}
        onAnswerChange={handleAnswerChange}
      />

      {getActionButtons()}

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Reset Assessment?
            </h3>
            <p className="text-gray-600 mb-6">
              This will clear all your answers and you'll need to start over. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
