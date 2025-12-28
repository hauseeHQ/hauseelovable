import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Bath,
  UtensilsCrossed,
  Home,
  DoorOpen,
  Trees,
  Building,
  Wind,
  Droplet,
  Zap,
  Shield,
  Camera,
} from 'lucide-react';
import { InspectionCategory } from '../../types';
import InspectionItemRow from './InspectionItemRow';

interface InspectionCategoryCardProps {
  category: InspectionCategory;
  isExpanded: boolean;
  onToggle: () => void;
  onRatingChange: (categoryId: string, itemId: string, rating: 'good' | 'fix' | 'replace') => void;
  onNotesChange: (categoryId: string, itemId: string, notes: string) => void;
}

const iconMap: Record<string, any> = {
  Bath,
  UtensilsCrossed,
  Home,
  DoorOpen,
  Trees,
  Building,
  Wind,
  Droplet,
  Zap,
  Shield,
};

export default function InspectionCategoryCard({
  category,
  isExpanded,
  onToggle,
  onRatingChange,
  onNotesChange,
}: InspectionCategoryCardProps) {
  const [sectionNotes, setSectionNotes] = useState(category.sectionNotes);
  const IconComponent = iconMap[category.icon] || Home;

  const totalItems = category.items.length;
  const progress = totalItems > 0 ? Math.round((category.completedCount / totalItems) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <IconComponent className="w-6 h-6 text-red-400" />
          </div>

          <div className="flex-1 text-left">
            <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
            <p className="text-sm text-gray-600">{category.description}</p>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="font-bold text-gray-900">
                {category.completedCount}/{totalItems}
              </div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>

            {category.completedCount > 0 && (
              <div className="flex items-center gap-2">
                {category.goodCount > 0 && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                    {category.goodCount} Good
                  </span>
                )}
                {category.fixCount > 0 && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                    {category.fixCount} Fix
                  </span>
                )}
                {category.replaceCount > 0 && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                    {category.replaceCount} Replace
                  </span>
                )}
              </div>
            )}

            <div className="w-32 hidden md:block">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 text-center mt-1">{progress}%</div>
            </div>
          </div>
        </div>

        <div className="ml-4">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="divide-y divide-gray-100">
            {category.items.map((item) => (
              <InspectionItemRow
                key={item.id}
                item={item}
                categoryId={category.id}
                onRatingChange={onRatingChange}
                onNotesChange={onNotesChange}
              />
            ))}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Notes (optional)
            </label>
            <textarea
              value={sectionNotes}
              onChange={(e) => setSectionNotes(e.target.value)}
              placeholder="Add any general observations about this category..."
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none"
              rows={3}
            />
            <div className="text-xs text-gray-500 text-right mt-1">
              {sectionNotes.length} / 500
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors">
                <Camera className="w-4 h-4" />
                Add Photos ({category.photos.length}/10)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
