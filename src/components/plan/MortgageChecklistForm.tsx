import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Check, Printer, RotateCcw, Sparkles } from 'lucide-react';
import { MortgageChecklist, ChecklistItemState, ChecklistProgress } from '../../types';
import { saveMortgageChecklist, loadMortgageChecklist } from '../../lib/supabaseClient';
import { CHECKLIST_SECTIONS, getTotalItemCount } from './checklistData';

const TEMP_USER_ID = 'temp-user-demo';

const INITIAL_STATE: MortgageChecklist = {
  items: {},
  progress: {
    completed: 0,
    total: getTotalItemCount(),
    percentage: 0,
  },
  updatedAt: new Date().toISOString(),
};

export default function MortgageChecklistForm() {
  const userId = TEMP_USER_ID;
  const [checklist, setChecklist] = useState<MortgageChecklist>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['income']));
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (checklist.progress.percentage === 100 && checklist.progress.completed > 0) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [checklist.progress.percentage]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const localData = localStorage.getItem(`hausee_checklist_${userId}`);
      const { data: dbData } = await loadMortgageChecklist(userId);

      if (dbData) {
        setChecklist(dbData);
      } else if (localData) {
        const parsed = JSON.parse(localData);
        setChecklist(parsed);
      }
    } catch (err) {
      console.error('Error loading checklist:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = (items: Record<string, ChecklistItemState>): ChecklistProgress => {
    const total = getTotalItemCount();
    const completed = Object.values(items).filter((item) => item.checked).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  };

  const debouncedSave = useCallback(
    (data: MortgageChecklist) => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      const timeout = setTimeout(async () => {
        const updatedData = { ...data, updatedAt: new Date().toISOString() };

        localStorage.setItem(
          `hausee_checklist_${userId}`,
          JSON.stringify(updatedData)
        );

        const result = await saveMortgageChecklist(userId, updatedData);

        if (!result.success) {
          console.error('Failed to save checklist');
        }
      }, 100);

      setSaveTimeout(timeout);
    },
    [saveTimeout, userId]
  );

  const handleItemToggle = (itemId: string) => {
    const newItems = { ...checklist.items };

    if (newItems[itemId]?.checked) {
      newItems[itemId] = {
        checked: false,
        completedAt: null,
      };
    } else {
      newItems[itemId] = {
        checked: true,
        completedAt: new Date().toISOString(),
      };
    }

    const newProgress = calculateProgress(newItems);

    const updatedChecklist: MortgageChecklist = {
      items: newItems,
      progress: newProgress,
      updatedAt: new Date().toISOString(),
    };

    setChecklist(updatedChecklist);
    debouncedSave(updatedChecklist);
  };

  const handleSectionToggle = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleReset = async () => {
    const resetChecklist = { ...INITIAL_STATE };
    setChecklist(resetChecklist);

    localStorage.setItem(
      `hausee_checklist_${userId}`,
      JSON.stringify(resetChecklist)
    );

    await saveMortgageChecklist(userId, resetChecklist);
    setShowResetConfirm(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading checklist...</div>
      </div>
    );
  }

  const isItemChecked = (itemId: string) => checklist.items[itemId]?.checked || false;

  return (
    <div className="max-w-4xl mx-auto">
      {showCelebration && (
        <div className="no-print fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in">
          <Sparkles className="w-6 h-6" />
          <div>
            <p className="font-semibold">All documents collected!</p>
            <p className="text-sm text-green-100">You're ready to submit your application</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Mortgage Checklist
            </h1>
            <p className="text-gray-600">
              Track your required mortgage documents and prepare your application package
            </p>
          </div>
          <div className="no-print flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Print checklist"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Reset checklist"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {checklist.progress.completed} of {checklist.progress.total} documents collected
            </span>
            <span className="text-sm font-semibold text-primary-400">
              {checklist.progress.percentage}%
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-400 transition-all duration-500 ease-out"
              style={{ width: `${checklist.progress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {checklist.progress.completed === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Getting Started
          </h3>
          <p className="text-blue-800 text-sm mb-3">
            This checklist helps you organize all the documents needed for your mortgage application.
            Check off items as you collect them, and we'll track your progress automatically.
          </p>
          <p className="text-blue-700 text-sm">
            <strong>Tip:</strong> Start with income documents as they typically take the longest to gather.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {CHECKLIST_SECTIONS.map((section) => (
          <div
            key={section.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
          >
            <button
              onClick={() => handleSectionToggle(section.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{section.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900">
                  {section.title}
                </h3>
              </div>
              {expandedSections.has(section.id) ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {expandedSections.has(section.id) && (
              <div className="px-6 pb-6">
                {section.subsections ? (
                  <div className="space-y-4">
                    {section.subsections.map((subsection) => (
                      <div key={subsection.id}>
                        <div className="bg-pink-50 border border-pink-100 rounded-lg px-4 py-2 mb-3">
                          <h4 className="text-sm font-semibold text-gray-900">
                            {subsection.title}
                          </h4>
                        </div>
                        <div className="space-y-3">
                          {subsection.items.map((item) => (
                            <ChecklistItemComponent
                              key={item.id}
                              id={item.id}
                              label={item.label}
                              helperText={item.helperText}
                              checked={isItemChecked(item.id)}
                              onToggle={handleItemToggle}
                              completedAt={checklist.items[item.id]?.completedAt}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {section.items?.map((item) => (
                      <ChecklistItemComponent
                        key={item.id}
                        id={item.id}
                        label={item.label}
                        helperText={item.helperText}
                        checked={isItemChecked(item.id)}
                        onToggle={handleItemToggle}
                        completedAt={checklist.items[item.id]?.completedAt}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Reset Checklist?
            </h3>
            <p className="text-gray-600 mb-6">
              This will uncheck all items and reset your progress. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ChecklistItemComponentProps {
  id: string;
  label: string;
  helperText?: string;
  checked: boolean;
  onToggle: (id: string) => void;
  completedAt: string | null;
}

function ChecklistItemComponent({
  id,
  label,
  helperText,
  checked,
  onToggle,
  completedAt,
}: ChecklistItemComponentProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <button
        onClick={() => onToggle(id)}
        className="flex-shrink-0 w-6 h-6 rounded border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 mt-0.5"
        style={{
          borderColor: checked ? '#ef4d68' : '#d1d5db',
          backgroundColor: checked ? '#ef4d68' : 'white',
        }}
        aria-label={`${checked ? 'Uncheck' : 'Check'} ${label}`}
      >
        {checked && (
          <Check className="w-full h-full text-white p-0.5" strokeWidth={3} />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`font-medium text-gray-900 transition-all duration-200 ${
              checked ? 'line-through text-gray-500' : ''
            }`}
          >
            {label}
          </span>
          {checked && completedAt && (
            <span className="text-xs text-gray-500">
              • Completed {formatDate(completedAt)}
            </span>
          )}
        </div>
        {helperText && (
          <p className="text-sm text-gray-600 mt-1">{helperText}</p>
        )}
      </div>
    </div>
  );
}
