import { AssessmentStatus } from '../../types';

interface AssessmentScoreCardProps {
  score: number | null;
  status: AssessmentStatus;
  answeredCount: number;
  totalQuestions: number;
}

export default function AssessmentScoreCard({
  score,
  status,
  answeredCount,
  totalQuestions,
}: AssessmentScoreCardProps) {
  const getStatusBadgeColor = () => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'on_track':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'needs_preparation':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'ready':
        return 'Ready to Buy';
      case 'on_track':
        return 'On Track';
      case 'needs_preparation':
        return 'Needs Preparation';
      default:
        return 'Incomplete';
    }
  };

  const getProgressBarColor = () => {
    switch (status) {
      case 'ready':
        return 'bg-green-500';
      case 'on_track':
        return 'bg-yellow-500';
      case 'needs_preparation':
        return 'bg-orange-500';
      default:
        return 'bg-gray-400';
    }
  };

  const isComplete = answeredCount === totalQuestions;

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm sticky top-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Readiness Score</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-gray-900">
            {isComplete && score !== null ? Math.round(score) : '—'}
          </span>
          {isComplete && score !== null && (
            <span className="text-2xl text-gray-500">%</span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor()}`}>
          {getStatusText()}
        </div>
      </div>

      <div className="mb-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${getProgressBarColor()}`}
            style={{ width: isComplete && score !== null ? `${score}%` : '0%' }}
          />
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <span className="font-medium">{answeredCount}</span> of{' '}
        <span className="font-medium">{totalQuestions}</span> questions answered
      </div>

      {!isComplete && (
        <p className="text-xs text-gray-500 mt-3">
          Complete all questions to see your final score and recommendations.
        </p>
      )}
    </div>
  );
}
