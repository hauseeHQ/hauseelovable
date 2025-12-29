import { useState, useEffect, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Filter,
  ChevronLeft,
  ArrowUp,
} from 'lucide-react';
import { Home, InspectionFilterType } from '../../types';
import { useInspection } from '../../hooks/useInspection';
import InspectionCategoryCard from './InspectionCategoryCard';
import InspectionProgressBar from './InspectionProgressBar';

interface InspectionViewProps {
  homes: Home[];
  onBackToBrowse: () => void;
  initialHomeId?: string | null;
}

export default function InspectionView({ homes, onBackToBrowse, initialHomeId }: InspectionViewProps) {
  const [selectedHomeId] = useState<string | null>(
    initialHomeId || (homes.length > 0 ? homes[0].id : null)
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<InspectionFilterType>('all');
  const [showBackToTop, setShowBackToTop] = useState(false);

  const { inspection, loading, error, updateRating, updateNotes, updateSectionNotes } =
    useInspection(selectedHomeId);

  const selectedHome = useMemo(
    () => homes.find((h) => h.id === selectedHomeId),
    [homes, selectedHomeId]
  );

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleExpandAll = () => {
    if (inspection) {
      setExpandedCategories(new Set(Object.keys(inspection.categories)));
    }
  };

  const handleCollapseAll = () => {
    setExpandedCategories(new Set());
  };

  const filteredCategories = useMemo(() => {
    if (!inspection) return [];

    return Object.values(inspection.categories).map((category: any) => {
      let filteredItems = category.items;

      if (activeFilter !== 'all') {
        filteredItems = category.items.filter((item: any) => {
          switch (activeFilter) {
            case 'good':
              return item.evaluation === 'good';
            case 'fix':
              return item.evaluation === 'fix';
            case 'replace':
              return item.evaluation === 'replace';
            case 'not_rated':
              return item.evaluation === null;
            default:
              return true;
          }
        });
      }

      return {
        ...category,
        items: filteredItems,
      };
    });
  }, [inspection, activeFilter]);

  if (homes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No homes to inspect</h3>
        <p className="text-gray-500 text-center max-w-md mb-6">
          Add homes from the Browse tab to start conducting DIY inspections.
        </p>
        <button
          onClick={onBackToBrowse}
          className="px-6 py-3 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors font-medium"
        >
          Go to Browse
        </button>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="mb-6 no-print">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBackToBrowse}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Browse
          </button>
        </div>

        {selectedHome && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{selectedHome.address}</h1>
            <p className="text-gray-600">{selectedHome.city}</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading inspection...</p>
          </div>
        </div>
      ) : inspection ? (
        <>
          <InspectionProgressBar progress={inspection.overall_progress} />

          <div className="mb-6 flex flex-wrap items-center gap-3 no-print">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>
            {(['all', 'good', 'fix', 'replace', 'not_rated'] as InspectionFilterType[]).map(
              (filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === filter
                      ? filter === 'good'
                        ? 'bg-green-500 text-white'
                        : filter === 'fix'
                        ? 'bg-yellow-500 text-white'
                        : filter === 'replace'
                        ? 'bg-red-500 text-white'
                        : 'bg-primary-400 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter === 'not_rated' ? 'Not Rated' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  {filter === 'all' && ` (${inspection.overall_progress.total})`}
                  {filter === 'good' && ` (${inspection.overall_progress.goodCount})`}
                  {filter === 'fix' && ` (${inspection.overall_progress.fixCount})`}
                  {filter === 'replace' && ` (${inspection.overall_progress.replaceCount})`}
                  {filter === 'not_rated' &&
                    ` (${inspection.overall_progress.total - inspection.overall_progress.completed})`}
                </button>
              )
            )}
          </div>

          <div className="mb-4 flex items-center gap-3 no-print">
            <button
              onClick={handleExpandAll}
              className="text-sm text-primary-400 hover:text-primary-500 transition-colors flex items-center gap-1"
            >
              <ChevronDown className="w-4 h-4" />
              Expand All
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={handleCollapseAll}
              className="text-sm text-primary-400 hover:text-primary-500 transition-colors flex items-center gap-1"
            >
              <ChevronUp className="w-4 h-4" />
              Collapse All
            </button>
          </div>

          <div className="space-y-4">
            {filteredCategories.map((category) => (
              <InspectionCategoryCard
                key={category.id}
                category={category}
                isExpanded={expandedCategories.has(category.id)}
                onToggle={() => handleToggleCategory(category.id)}
                onRatingChange={updateRating}
                onNotesChange={updateNotes}
                onSectionNotesChange={updateSectionNotes}
              />
            ))}
          </div>

          {showBackToTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 p-4 bg-primary-400 text-white rounded-full shadow-lg hover:bg-primary-500 transition-all z-50 no-print"
              aria-label="Back to top"
            >
              <ArrowUp className="w-6 h-6" />
            </button>
          )}
        </>
      ) : null}
    </div>
  );
}
