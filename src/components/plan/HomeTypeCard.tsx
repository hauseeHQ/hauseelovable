import { Check, Building2, Home, Building } from 'lucide-react';
import { PropertyType } from '../../types';

interface HomeTypeCardProps {
  type: PropertyType;
  label: string;
  selected: boolean;
  onSelect: () => void;
}

const ICON_MAP = {
  'condo': Building2,
  'freehold-townhouse': Building,
  'semi-detached': Home,
  'detached': Home,
};

export default function HomeTypeCard({
  type,
  label,
  selected,
  onSelect,
}: HomeTypeCardProps) {
  const Icon = ICON_MAP[type];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative p-4 rounded-lg border-2 transition-all ${
        selected
          ? 'border-primary-400 bg-primary-50'
          : 'border-gray-300 bg-white hover:border-gray-400'
      }`}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
      <div className="flex flex-col items-center gap-2">
        <Icon
          className={`w-8 h-8 ${
            selected ? 'text-primary-500' : 'text-gray-400'
          }`}
        />
        <span
          className={`text-sm font-medium ${
            selected ? 'text-primary-700' : 'text-gray-700'
          }`}
        >
          {label}
        </span>
      </div>
    </button>
  );
}
