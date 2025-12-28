import { Check } from 'lucide-react';
import { RatingValue } from '../../types';

interface RatingButtonsProps {
  value: RatingValue | null;
  onChange: (value: RatingValue) => void;
  disabled?: boolean;
}

export default function RatingButtons({ value, onChange, disabled }: RatingButtonsProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange('good')}
        disabled={disabled}
        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          value === 'good'
            ? 'bg-green-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <div className="flex items-center justify-center gap-1">
          {value === 'good' && <Check className="w-4 h-4" />}
          <span>Good</span>
          <span className="text-xs opacity-75">(5pts)</span>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onChange('fair')}
        disabled={disabled}
        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          value === 'fair'
            ? 'bg-yellow-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <div className="flex items-center justify-center gap-1">
          {value === 'fair' && <Check className="w-4 h-4" />}
          <span>Fair</span>
          <span className="text-xs opacity-75">(3pts)</span>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onChange('poor')}
        disabled={disabled}
        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          value === 'poor'
            ? 'bg-red-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <div className="flex items-center justify-center gap-1">
          {value === 'poor' && <Check className="w-4 h-4" />}
          <span>Poor</span>
          <span className="text-xs opacity-75">(1pt)</span>
        </div>
      </button>
    </div>
  );
}
