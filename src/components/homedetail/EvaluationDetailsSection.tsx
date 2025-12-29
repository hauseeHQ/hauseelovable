import { Check, X } from 'lucide-react';
import { HomeEvaluation } from '../../types';
import { EVALUATION_CATEGORIES } from '../../data/evaluationCategories';

interface EvaluationDetailsSectionProps {
  evaluation: HomeEvaluation | null;
}

export default function EvaluationDetailsSection({ evaluation }: EvaluationDetailsSectionProps) {
  const getRatingDisplay = (categoryId: string, itemId: string) => {
    const value = evaluation?.ratings?.[categoryId]?.[itemId];

    if (value === undefined || value === null || value === '') {
      return <span className="text-sm text-gray-400">—</span>;
    }

    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-4 h-4 text-green-600" />
      ) : (
        <span className="text-xs text-gray-500">No</span>
      );
    }

    if (value === 'good') {
      return (
        <div className="flex items-center gap-1">
          <Check className="w-4 h-4 text-green-600" />
        </div>
      );
    }

    if (value === 'fair') {
      return (
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-yellow-600">Fair</span>
        </div>
      );
    }

    if (value === 'poor') {
      return (
        <div className="flex items-center gap-1">
          <X className="w-4 h-4 text-red-600" />
        </div>
      );
    }

    if (typeof value === 'number') {
      return <span className="text-sm text-gray-900">${value.toLocaleString()}</span>;
    }

    if (typeof value === 'string' && value.length > 0) {
      return <span className="text-sm text-gray-900 truncate max-w-[120px]" title={value}>{value}</span>;
    }

    return <span className="text-sm text-gray-400">—</span>;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Evaluation Details</h2>
        <p className="text-sm text-gray-600 mt-1">Categories, notes, and attachments</p>
      </div>

      <div className="divide-y divide-gray-200">
        {EVALUATION_CATEGORIES.map((category) => (
          <div key={category.id} className="px-6 py-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">{category.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {category.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-1.5"
                >
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <div className="flex items-center">
                    {getRatingDisplay(category.id, item.id)}
                  </div>
                </div>
              ))}
            </div>
            {evaluation?.sectionNotes?.[category.id] && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600 italic">
                  {evaluation.sectionNotes[category.id]}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
