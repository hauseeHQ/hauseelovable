import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  ChevronLeft,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { Home, InspectionFilterType, HomeInspection } from '../../types';
import { initializeInspectionData } from '../../data/inspectionChecklist';
import InspectionCategoryCard from './InspectionCategoryCard';
import InspectionProgressBar from './InspectionProgressBar';

interface InspectionViewProps {
  homes: Home[];
  onBackToBrowse: () => void;
}

export default function InspectionView({ homes, onBackToBrowse }: InspectionViewProps) {
  const [selectedHomeId, setSelectedHomeId] = useState<string | null>(
    homes.length > 0 ? homes[0].id : null
  );
  const [showHomeSelector, setShowHomeSelector] = useState(false);
  const [inspection, setInspection] = useState<HomeInspection | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<InspectionFilterType>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [pendingHomeId, setPendingHomeId] = useState<string | null>(null);

  const selectedHome = useMemo(
    () => homes.find((h) => h.id === selectedHomeId),
    [homes, selectedHomeId]
  );

  useEffect(() => {
    if (selectedHomeId) {
      loadInspection(selectedHomeId);
    }
  }, [selectedHomeId]);

  const loadInspection = async (homeId: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const mockInspection: HomeInspection = {
      id: `inspection-${homeId}`,
      homeId,
      userId: 'temp-user-demo',
      categories: initializeInspectionData(),
      overallProgress: {
        completed: 0,
        total: 92,
        percentage: 0,
        goodCount: 0,
        fixCount: 0,
        replaceCount: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInspection(mockInspection);
    setIsLoading(false);
  };

  const handleHomeChange = (homeId: string) => {
    if (homeId === selectedHomeId) return;

    const hasProgress = inspection && inspection.overallProgress.completed > 0;
    if (hasProgress) {
      setPendingHomeId(homeId);
      setShowSwitchModal(true);
    } else {
      setSelectedHomeId(homeId);
    }
  };

  const confirmHomeSwitch = () => {
    if (pendingHomeId) {
      setSelectedHomeId(pendingHomeId);
      setPendingHomeId(null);
    }
    setShowSwitchModal(false);
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

  const handleRatingChange = useCallback(
    (categoryId: string, itemId: string, rating: 'good' | 'fix' | 'replace') => {
      if (!inspection) return;

      setInspection((prev) => {
        if (!prev) return prev;

        const updatedCategories = { ...prev.categories };
        const category = { ...updatedCategories[categoryId] };
        const items = category.items.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              evaluation: rating,
              evaluatedAt: new Date().toISOString(),
            };
          }
          return item;
        });

        const completedCount = items.filter((i) => i.evaluation !== null).length;
        const goodCount = items.filter((i) => i.evaluation === 'good').length;
        const fixCount = items.filter((i) => i.evaluation === 'fix').length;
        const replaceCount = items.filter((i) => i.evaluation === 'replace').length;

        category.items = items;
        category.completedCount = completedCount;
        category.goodCount = goodCount;
        category.fixCount = fixCount;
        category.replaceCount = replaceCount;

        updatedCategories[categoryId] = category;

        const totalCompleted = Object.values(updatedCategories).reduce(
          (sum, cat: any) => sum + cat.completedCount,
          0
        );
        const totalGood = Object.values(updatedCategories).reduce(
          (sum, cat: any) => sum + cat.goodCount,
          0
        );
        const totalFix = Object.values(updatedCategories).reduce(
          (sum, cat: any) => sum + cat.fixCount,
          0
        );
        const totalReplace = Object.values(updatedCategories).reduce(
          (sum, cat: any) => sum + cat.replaceCount,
          0
        );

        return {
          ...prev,
          categories: updatedCategories,
          overallProgress: {
            ...prev.overallProgress,
            completed: totalCompleted,
            percentage: Math.round((totalCompleted / prev.overallProgress.total) * 100),
            goodCount: totalGood,
            fixCount: totalFix,
            replaceCount: totalReplace,
          },
          updatedAt: new Date().toISOString(),
        };
      });
    },
    [inspection]
  );

  const handleNotesChange = useCallback(
    (categoryId: string, itemId: string, notes: string) => {
      if (!inspection) return;

      setInspection((prev) => {
        if (!prev) return prev;

        const updatedCategories = { ...prev.categories };
        const category = { ...updatedCategories[categoryId] };
        const items = category.items.map((item) => {
          if (item.id === itemId) {
            return { ...item, notes };
          }
          return item;
        });

        category.items = items;
        updatedCategories[categoryId] = category;

        return {
          ...prev,
          categories: updatedCategories,
          updatedAt: new Date().toISOString(),
        };
      });
    },
    [inspection]
  );

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
          className="px-6 py-3 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors font-medium"
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
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">DIY Home Inspection</h2>
            {selectedHome && (
              <div className="relative">
                <button
                  onClick={() => setShowHomeSelector(!showHomeSelector)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{selectedHome.address}</span>
                  <span className="text-gray-500">- {selectedHome.neighborhood}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {showHomeSelector && (
                  <div className="absolute top-full left-0 mt-2 w-full md:w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    {homes.map((home) => (
                      <button
                        key={home.id}
                        onClick={() => {
                          handleHomeChange(home.id);
                          setShowHomeSelector(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                          home.id === selectedHomeId ? 'bg-red-50' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900">{home.address}</div>
                        <div className="text-sm text-gray-600">{home.neighborhood}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden md:inline">Print</span>
            </button>
            <button
              onClick={onBackToBrowse}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden md:inline">Back to Browse</span>
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading inspection...</p>
          </div>
        </div>
      ) : inspection ? (
        <>
          <InspectionProgressBar progress={inspection.overallProgress} />

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
                        : 'bg-red-400 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter === 'not_rated' ? 'Not Rated' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  {filter === 'all' && ` (${inspection.overallProgress.total})`}
                  {filter === 'good' && ` (${inspection.overallProgress.goodCount})`}
                  {filter === 'fix' && ` (${inspection.overallProgress.fixCount})`}
                  {filter === 'replace' && ` (${inspection.overallProgress.replaceCount})`}
                  {filter === 'not_rated' &&
                    ` (${inspection.overallProgress.total - inspection.overallProgress.completed})`}
                </button>
              )
            )}
          </div>

          <div className="mb-4 flex items-center gap-3 no-print">
            <button
              onClick={handleExpandAll}
              className="text-sm text-red-400 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <ChevronDown className="w-4 h-4" />
              Expand All
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={handleCollapseAll}
              className="text-sm text-red-400 hover:text-red-500 transition-colors flex items-center gap-1"
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
                onRatingChange={handleRatingChange}
                onNotesChange={handleNotesChange}
              />
            ))}
          </div>
        </>
      ) : null}

      {showSwitchModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Switch Home?</h3>
            <p className="text-gray-600 mb-6">
              You have inspection progress on the current home. Switching will save your work and load
              the new home's inspection.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSwitchModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmHomeSwitch}
                className="flex-1 px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors"
              >
                Switch Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
