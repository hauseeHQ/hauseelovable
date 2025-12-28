import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface InspectionProgressBarProps {
  progress: {
    completed: number;
    total: number;
    percentage: number;
    goodCount: number;
    fixCount: number;
    replaceCount: number;
  };
}

export default function InspectionProgressBar({ progress }: InspectionProgressBarProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-bold text-gray-900">
            {progress.completed} / {progress.total} items
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <div className="text-center mt-2">
          <span className="text-2xl font-bold text-red-400">{progress.percentage}%</span>
          <span className="text-sm text-gray-500 ml-2">Complete</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{progress.completed}</div>
          <div className="text-xs text-gray-600 mt-1">Completed</div>
        </div>

        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{progress.goodCount}</div>
          <div className="text-xs text-green-700 mt-1">Good</div>
        </div>

        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{progress.fixCount}</div>
          <div className="text-xs text-yellow-700 mt-1">Needs Fix</div>
        </div>

        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{progress.replaceCount}</div>
          <div className="text-xs text-red-700 mt-1">Replace</div>
        </div>
      </div>
    </div>
  );
}
