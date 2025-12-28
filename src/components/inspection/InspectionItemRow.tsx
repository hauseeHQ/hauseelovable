import { useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { InspectionItem } from '../../types';

interface InspectionItemRowProps {
  item: InspectionItem;
  categoryId: string;
  onRatingChange: (categoryId: string, itemId: string, rating: 'good' | 'fix' | 'replace') => void;
  onNotesChange: (categoryId: string, itemId: string, notes: string) => void;
}

export default function InspectionItemRow({
  item,
  categoryId,
  onRatingChange,
  onNotesChange,
}: InspectionItemRowProps) {
  const [notes, setNotes] = useState(item.notes);
  const [showNotes, setShowNotes] = useState(false);

  const handleRatingClick = useCallback(
    (rating: 'good' | 'fix' | 'replace') => {
      onRatingChange(categoryId, item.id, rating);
    },
    [categoryId, item.id, onRatingChange]
  );

  const handleNotesBlur = useCallback(() => {
    if (notes !== item.notes) {
      onNotesChange(categoryId, item.id, notes);
    }
  }, [categoryId, item.id, notes, item.notes, onNotesChange]);

  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-bold text-gray-600">{item.itemNumber}</span>
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 mb-3">{item.description}</p>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <button
              onClick={() => handleRatingClick('good')}
              className={`min-h-[64px] md:min-h-[56px] rounded-lg font-medium text-sm transition-all flex flex-col items-center justify-center gap-1.5 ${
                item.evaluation === 'good'
                  ? 'bg-green-500 text-white shadow-md scale-105'
                  : 'bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-200'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span>Good</span>
            </button>

            <button
              onClick={() => handleRatingClick('fix')}
              className={`min-h-[64px] md:min-h-[56px] rounded-lg font-medium text-sm transition-all flex flex-col items-center justify-center gap-1.5 ${
                item.evaluation === 'fix'
                  ? 'bg-yellow-500 text-white shadow-md scale-105'
                  : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-2 border-yellow-200'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
              <span>Fix</span>
            </button>

            <button
              onClick={() => handleRatingClick('replace')}
              className={`min-h-[64px] md:min-h-[56px] rounded-lg font-medium text-sm transition-all flex flex-col items-center justify-center gap-1.5 ${
                item.evaluation === 'replace'
                  ? 'bg-red-500 text-white shadow-md scale-105'
                  : 'bg-red-50 text-red-700 hover:bg-red-100 border-2 border-red-200'
              }`}
            >
              <XCircle className="w-5 h-5" />
              <span>Replace</span>
            </button>
          </div>

          <button
            onClick={() => setShowNotes(!showNotes)}
            className="text-xs text-red-400 hover:text-red-500 transition-colors"
          >
            {showNotes ? 'Hide notes' : 'Add notes'}
          </button>

          {showNotes && (
            <div className="mt-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleNotesBlur}
                placeholder="Add specific notes about this item..."
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none text-sm"
                rows={2}
              />
              <div className="text-xs text-gray-500 text-right mt-1">{notes.length} / 200</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
