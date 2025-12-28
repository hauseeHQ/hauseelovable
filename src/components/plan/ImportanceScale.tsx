import { ImportanceLevel } from '../../types';

interface ImportanceScaleProps {
  value: ImportanceLevel | null;
  onChange: (value: ImportanceLevel | null) => void;
  label: string;
  helperText?: string;
}

const IMPORTANCE_OPTIONS: { value: ImportanceLevel; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export default function ImportanceScale({
  value,
  onChange,
  label,
  helperText,
}: ImportanceScaleProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      {helperText && (
        <p className="text-xs text-gray-500 mb-2">{helperText}</p>
      )}
      <div className="flex gap-2">
        {IMPORTANCE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(value === option.value ? null : option.value)}
            className={`flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-all ${
              value === option.value
                ? 'bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-md'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
