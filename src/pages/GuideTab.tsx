import { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Play,
  Check,
  CheckCircle2,
  BookOpen,
  Clock,
  Save,
} from 'lucide-react';
import { Module, Lesson, GuideProgress } from '../types';
import { GUIDE_MODULES, getTotalLessons } from '../data/guideModules';

const TEMP_USER_ID = 'temp-user-demo';

export default function GuideTab() {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<Record<string, GuideProgress>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [savingStates, setSavingStates] = useState<Record<string, 'idle' | 'saving' | 'saved'>>({});
  const [saveTimers, setSaveTimers] = useState<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    loadProgress();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('guideNotes');
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved notes');
      }
    }
  }, []);

  const loadProgress = async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const mockProgress: Record<string, GuideProgress> = {};
    setProgress(mockProgress);
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const toggleLesson = (lessonId: string) => {
    setExpandedLessons((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(lessonId)) {
        newSet.delete(lessonId);
      } else {
        newSet.add(lessonId);
      }
      return newSet;
    });
  };

  const toggleCompletion = async (lessonId: string, moduleId: string) => {
    const currentProgress = progress[lessonId];
    const newCompleted = !currentProgress?.completed;

    const updatedProgress: GuideProgress = {
      id: currentProgress?.id || `progress-${lessonId}`,
      userId: TEMP_USER_ID,
      lessonId,
      moduleId,
      completed: newCompleted,
      notes: notes[lessonId] || '',
      updatedAt: new Date().toISOString(),
    };

    setProgress((prev) => ({
      ...prev,
      [lessonId]: updatedProgress,
    }));

    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  const handleNotesChange = useCallback((lessonId: string, value: string) => {
    setNotes((prev) => {
      const updated = { ...prev, [lessonId]: value };
      localStorage.setItem('guideNotes', JSON.stringify(updated));
      return updated;
    });

    setSavingStates((prev) => ({ ...prev, [lessonId]: 'saving' }));

    if (saveTimers[lessonId]) {
      clearTimeout(saveTimers[lessonId]);
    }

    const timer = setTimeout(async () => {
      await saveNotes(lessonId, value);
      setSavingStates((prev) => ({ ...prev, [lessonId]: 'saved' }));
      setTimeout(() => {
        setSavingStates((prev) => ({ ...prev, [lessonId]: 'idle' }));
      }, 2000);
    }, 1000);

    setSaveTimers((prev) => ({ ...prev, [lessonId]: timer }));
  }, [saveTimers]);

  const saveNotes = async (lessonId: string, notesText: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  const getModuleProgress = (module: Module) => {
    const completed = module.lessons.filter((lesson) => progress[lesson.id]?.completed).length;
    const total = module.lessons.length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const getOverallProgress = () => {
    const completed = Object.values(progress).filter((p) => p.completed).length;
    const total = getTotalLessons();
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const overallProgress = getOverallProgress();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Renter to Owner: Home Buying Playbook
        </h1>
        <p className="text-gray-600 mb-4">Video lesson series</p>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Your Progress</h2>
            <span className="text-2xl font-bold text-primary-400">
              {overallProgress.percentage}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-400 to-primary-500 transition-all duration-500"
              style={{ width: `${overallProgress.percentage}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 mt-2 text-center">
            {overallProgress.completed} of {overallProgress.total} lessons completed
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {GUIDE_MODULES.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            isExpanded={expandedModules.has(module.id)}
            onToggle={() => toggleModule(module.id)}
            progress={getModuleProgress(module)}
            expandedLessons={expandedLessons}
            onToggleLesson={toggleLesson}
            lessonProgress={progress}
            onToggleCompletion={toggleCompletion}
            notes={notes}
            onNotesChange={handleNotesChange}
            savingStates={savingStates}
          />
        ))}
      </div>
    </div>
  );
}

interface ModuleCardProps {
  module: Module;
  isExpanded: boolean;
  onToggle: () => void;
  progress: { completed: number; total: number; percentage: number };
  expandedLessons: Set<string>;
  onToggleLesson: (lessonId: string) => void;
  lessonProgress: Record<string, GuideProgress>;
  onToggleCompletion: (lessonId: string, moduleId: string) => void;
  notes: Record<string, string>;
  onNotesChange: (lessonId: string, value: string) => void;
  savingStates: Record<string, 'idle' | 'saving' | 'saved'>;
}

function ModuleCard({
  module,
  isExpanded,
  onToggle,
  progress,
  expandedLessons,
  onToggleLesson,
  lessonProgress,
  onToggleCompletion,
  notes,
  onNotesChange,
  savingStates,
}: ModuleCardProps) {
  const isComplete = progress.completed === progress.total;
  const hasProgress = progress.completed > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1 text-left">
          <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6 text-primary-400" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-bold text-gray-900">
                Module {module.number}: {module.title}
              </h3>
              {isComplete && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
            </div>
            <p className="text-sm text-gray-600">{module.description}</p>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={`px-3 py-1 rounded-full text-sm font-bold ${
                isComplete
                  ? 'bg-green-100 text-green-700'
                  : hasProgress
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {progress.completed}/{progress.total}
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="divide-y divide-gray-100">
            {module.lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                isExpanded={expandedLessons.has(lesson.id)}
                onToggle={() => onToggleLesson(lesson.id)}
                isCompleted={lessonProgress[lesson.id]?.completed || false}
                onToggleCompletion={() => onToggleCompletion(lesson.id, module.id)}
                notes={notes[lesson.id] || ''}
                onNotesChange={(value) => onNotesChange(lesson.id, value)}
                savingState={savingStates[lesson.id] || 'idle'}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface LessonCardProps {
  lesson: Lesson;
  isExpanded: boolean;
  onToggle: () => void;
  isCompleted: boolean;
  onToggleCompletion: () => void;
  notes: string;
  onNotesChange: (value: string) => void;
  savingState: 'idle' | 'saving' | 'saved';
}

function LessonCard({
  lesson,
  isExpanded,
  onToggle,
  isCompleted,
  onToggleCompletion,
  notes,
  onNotesChange,
  savingState,
}: LessonCardProps) {
  return (
    <div className="bg-white">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1 text-left">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              isCompleted ? 'bg-green-500' : 'bg-gray-200'
            }`}
          >
            {isCompleted ? (
              <Check className="w-5 h-5 text-white" />
            ) : (
              <span className="text-sm font-bold text-gray-600">{lesson.number}</span>
            )}
          </div>

          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">{lesson.title}</h4>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {lesson.duration}
              </div>
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
        <div className="px-6 pb-6 space-y-4 animate-fadeIn">
          <p className="text-gray-600 text-sm">{lesson.description}</p>

          <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                <Play className="w-10 h-10 text-white ml-1" />
              </div>
              <p className="text-lg font-medium">Video content coming soon</p>
              <p className="text-sm text-gray-300 mt-1">Duration: {lesson.duration}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Mark this lesson as complete</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompletion();
              }}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                isCompleted
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isCompleted ? (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Done
                </span>
              ) : (
                'Mark Done'
              )}
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Private Notes</label>
              {savingState !== 'idle' && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  {savingState === 'saving' && (
                    <>
                      <Save className="w-3 h-3 animate-pulse" />
                      Saving...
                    </>
                  )}
                  {savingState === 'saved' && (
                    <>
                      <Check className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">Auto-saved</span>
                    </>
                  )}
                </span>
              )}
            </div>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Add your personal notes here... These are private and only visible to you."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 resize-none"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              Your notes are automatically saved and synced to your account
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
