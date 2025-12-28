import { EvaluationItem as EvaluationItemType, RatingValue } from '../../types';
import RatingButtons from './RatingButtons';

interface EvaluationItemProps {
  item: EvaluationItemType;
  categoryId: string;
  value: RatingValue | number | string | null;
  note: string;
  onRatingChange: (categoryId: string, itemId: string, value: RatingValue | number | string) => void;
  onNoteChange: (itemId: string, note: string) => void;
}

export default function EvaluationItemComponent({
  item,
  categoryId,
  value,
  note,
  onRatingChange,
  onNoteChange,
}: EvaluationItemProps) {
  return (
    <div className="border-b border-gray-100 last:border-b-0 py-4">
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">{item.label}</label>
        {item.helperText && <p className="text-xs text-gray-500">{item.helperText}</p>}
      </div>

      {item.type === 'rating' && (
        <RatingButtons
          value={value as RatingValue | null}
          onChange={(newValue) => onRatingChange(categoryId, item.id, newValue)}
        />
      )}

      {item.type === 'dropdown' && item.options && (
        <select
          value={(value as string) || ''}
          onChange={(e) => onRatingChange(categoryId, item.id, e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400"
        >
          <option value="">Select an option</option>
          {item.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}

      {item.type === 'currency' && (
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            value={(value as number) || ''}
            onChange={(e) => onRatingChange(categoryId, item.id, Number(e.target.value))}
            placeholder="0"
            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400"
          />
        </div>
      )}

      {item.type === 'textarea' && (
        <textarea
          value={(value as string) || ''}
          onChange={(e) => onRatingChange(categoryId, item.id, e.target.value)}
          placeholder="Enter your observations..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 resize-none"
        />
      )}

      {item.type === 'rating' && (
        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Notes (optional, max 500 characters)
          </label>
          <textarea
            value={note}
            onChange={(e) => onNoteChange(item.id, e.target.value.slice(0, 500))}
            placeholder="Add any specific observations..."
            rows={2}
            maxLength={500}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 resize-none"
          />
          <div className="text-xs text-gray-500 text-right mt-1">{note.length}/500</div>
        </div>
      )}
    </div>
  );
}
