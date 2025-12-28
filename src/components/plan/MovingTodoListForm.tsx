import { useState, useEffect, useCallback } from 'react';
import { Check, Printer, RotateCcw, Sparkles, Clock, Package } from 'lucide-react';
import { MovingTodoList, MovingTodoItemState, ChecklistProgress } from '../../types';
import { saveMovingTodoList, loadMovingTodoList } from '../../lib/supabaseClient';
import { MOVING_TASKS, TOTAL_TASKS } from './movingTasksData';

const TEMP_USER_ID = 'temp-user-demo';

const INITIAL_STATE: MovingTodoList = {
  items: {},
  progress: {
    completed: 0,
    total: TOTAL_TASKS,
    percentage: 0,
  },
  updatedAt: new Date().toISOString(),
};

const CATEGORY_ICONS: Record<string, string> = {
  planning: '📋',
  logistics: '📦',
  utilities: '🔌',
  'final-prep': '✨',
};

const CATEGORY_LABELS: Record<string, string> = {
  planning: 'Planning',
  logistics: 'Logistics',
  utilities: 'Utilities & Services',
  'final-prep': 'Final Preparations',
};

export default function MovingTodoListForm() {
  const userId = TEMP_USER_ID;
  const [todoList, setTodoList] = useState<MovingTodoList>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (todoList.progress.percentage === 100 && todoList.progress.completed > 0) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [todoList.progress.percentage]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const localData = localStorage.getItem(`hausee_moving_${userId}`);
      const { data: dbData } = await loadMovingTodoList(userId);

      if (dbData) {
        setTodoList(dbData);
      } else if (localData) {
        const parsed = JSON.parse(localData);
        setTodoList(parsed);
      }
    } catch (err) {
      console.error('Error loading moving list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = (items: Record<string, MovingTodoItemState>): ChecklistProgress => {
    const total = TOTAL_TASKS;
    const completed = Object.values(items).filter((item) => item.checked).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  };

  const debouncedSave = useCallback(
    (data: MovingTodoList) => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      const timeout = setTimeout(async () => {
        const updatedData = { ...data, updatedAt: new Date().toISOString() };

        localStorage.setItem(`hausee_moving_${userId}`, JSON.stringify(updatedData));

        const result = await saveMovingTodoList(userId, updatedData);

        if (!result.success) {
          console.error('Failed to save moving list');
        }
      }, 100);

      setSaveTimeout(timeout);
    },
    [saveTimeout, userId]
  );

  const handleItemToggle = (taskId: string) => {
    const newItems = { ...todoList.items };

    if (newItems[taskId]?.checked) {
      newItems[taskId] = {
        checked: false,
        completedAt: null,
      };
    } else {
      newItems[taskId] = {
        checked: true,
        completedAt: new Date().toISOString(),
        completedBy: userId,
      };
    }

    const newProgress = calculateProgress(newItems);

    const updatedList: MovingTodoList = {
      items: newItems,
      progress: newProgress,
      updatedAt: new Date().toISOString(),
    };

    setTodoList(updatedList);
    debouncedSave(updatedList);
  };

  const handleReset = async () => {
    const resetList = { ...INITIAL_STATE };
    setTodoList(resetList);

    localStorage.setItem(`hausee_moving_${userId}`, JSON.stringify(resetList));

    await saveMovingTodoList(userId, resetList);
    setShowResetConfirm(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading moving checklist...</div>
      </div>
    );
  }

  const isItemChecked = (taskId: string) => todoList.items[taskId]?.checked || false;

  const filteredTasks = MOVING_TASKS.filter((task) => {
    if (filter === 'completed') return isItemChecked(task.id);
    if (filter === 'pending') return !isItemChecked(task.id);
    return true;
  });

  const groupedTasks = filteredTasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, typeof MOVING_TASKS>);

  return (
    <div className="max-w-4xl mx-auto">
      {showCelebration && (
        <div className="no-print fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in">
          <Sparkles className="w-6 h-6" />
          <div>
            <p className="font-semibold">All tasks completed!</p>
            <p className="text-sm text-green-100">You're ready for your move!</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Moving To-Do List
            </h1>
            <p className="text-gray-600">
              Stay organized throughout your moving journey with this comprehensive timeline
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
              {todoList.progress.completed} of {todoList.progress.total} tasks completed
            </span>
            <span className="text-sm font-semibold text-primary-400">
              {todoList.progress.percentage}%
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-400 transition-all duration-500 ease-out"
              style={{ width: `${todoList.progress.percentage}%` }}
            />
          </div>
        </div>

        <div className="no-print mt-6 flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-400 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({TOTAL_TASKS})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-primary-400 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({todoList.progress.total - todoList.progress.completed})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-primary-400 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed ({todoList.progress.completed})
          </button>
        </div>
      </div>

      {todoList.progress.completed === 0 && (
        <div className="no-print bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Getting Started with Your Move
          </h3>
          <p className="text-blue-800 text-sm mb-3">
            This comprehensive checklist covers the complete moving timeline from 8 weeks before
            through moving day. Tasks are organized by category and timeline to help you stay
            on track.
          </p>
          <p className="text-blue-700 text-sm">
            <strong>Tip:</strong> Start with planning tasks 8 weeks before your move date for the
            smoothest experience.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([category, tasks]) => (
          <div key={category} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{CATEGORY_ICONS[category]}</span>
              <h3 className="text-xl font-semibold text-gray-900">
                {CATEGORY_LABELS[category]}
              </h3>
              <span className="ml-auto text-sm text-gray-500">
                {tasks.filter((t) => isItemChecked(t.id)).length}/{tasks.length} completed
              </span>
            </div>

            <div className="space-y-3">
              {tasks.map((task) => (
                <MovingTaskItem
                  key={task.id}
                  task={task}
                  checked={isItemChecked(task.id)}
                  onToggle={handleItemToggle}
                  completedAt={todoList.items[task.id]?.completedAt}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reset Checklist?</h3>
            <p className="text-gray-600 mb-6">
              This will uncheck all tasks and reset your progress. This action cannot be undone.
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

interface MovingTaskItemProps {
  task: {
    id: string;
    title: string;
    description: string;
    timeline: string;
  };
  checked: boolean;
  onToggle: (id: string) => void;
  completedAt: string | null;
}

function MovingTaskItem({ task, checked, onToggle, completedAt }: MovingTaskItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
      <button
        onClick={() => onToggle(task.id)}
        className="flex-shrink-0 w-6 h-6 rounded border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 mt-0.5"
        style={{
          borderColor: checked ? '#ef4d68' : '#d1d5db',
          backgroundColor: checked ? '#ef4d68' : 'white',
        }}
        aria-label={`${checked ? 'Uncheck' : 'Check'} ${task.title}`}
      >
        {checked && <Check className="w-full h-full text-white p-0.5" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <span
            className={`font-semibold text-gray-900 transition-all duration-200 ${
              checked ? 'line-through text-gray-500' : ''
            }`}
          >
            {task.title}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
            <Clock className="w-3 h-3" />
            {task.timeline}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-2">{task.description}</p>

        {checked && completedAt && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <Check className="w-3 h-3" />
            Completed {formatDate(completedAt)}
          </span>
        )}
      </div>
    </div>
  );
}
