import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Home, DollarSign, CheckSquare, PiggyBank, FileCheck, Package, ClipboardList } from 'lucide-react';
import { PlanModule, ModuleType } from '../../types';

interface ModuleNavigationProps {
  activeModule: ModuleType;
  onModuleChange: (moduleId: ModuleType) => void;
}

const MODULES: PlanModule[] = [
  {
    id: 'my-dream-home',
    title: 'My Dream Home',
    description: 'Define your ideal home criteria',
    isImplemented: true,
  },
  {
    id: 'financial-readiness',
    title: 'Financial Readiness',
    description: 'Learn the money moves that make home buying stress-free',
    isImplemented: true,
  },
  {
    id: 'self-assessment',
    title: 'Self-Assessment',
    description: 'Evaluate your home buying readiness',
    isImplemented: true,
  },
  {
    id: 'budget-planner',
    title: 'Budget Planner',
    description: 'Compare current budget with homeownership costs',
    isImplemented: true,
  },
  {
    id: 'down-payment-tracker',
    title: 'Down Payment Tracker',
    description: 'Monitor your savings progress',
    isImplemented: true,
  },
  {
    id: 'mortgage-checklist',
    title: 'Mortgage Checklist',
    description: 'Track your required mortgage documents',
    isImplemented: true,
  },
  {
    id: 'moving-todo-list',
    title: 'Moving To-Do List',
    description: 'Stay organized throughout your moving journey',
    isImplemented: true,
  },
];

const MODULE_ICONS: Record<ModuleType, typeof Home> = {
  'my-dream-home': Home,
  'financial-readiness': DollarSign,
  'self-assessment': CheckSquare,
  'budget-planner': PiggyBank,
  'down-payment-tracker': FileCheck,
  'mortgage-checklist': Package,
  'moving-todo-list': ClipboardList,
};

export default function ModuleNavigation({ activeModule, onModuleChange }: ModuleNavigationProps) {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const checkScrollArrows = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    );
  };

  useEffect(() => {
    checkScrollArrows();
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', checkScrollArrows);
    window.addEventListener('resize', checkScrollArrows);

    return () => {
      container.removeEventListener('scroll', checkScrollArrows);
      window.removeEventListener('resize', checkScrollArrows);
    };
  }, []);

  useEffect(() => {
    const activeIndex = MODULES.findIndex(m => m.id === activeModule);
    if (activeIndex !== -1 && chipRefs.current[activeIndex]) {
      chipRefs.current[activeIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeModule]);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 300;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleChipClick = (moduleId: ModuleType) => {
    onModuleChange(moduleId);
  };

  return (
    <div className="w-full mb-3">
      <div className="relative flex items-center gap-2">
        {showLeftArrow && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 z-10 flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-10 -mx-10 py-2"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {MODULES.map((module, index) => {
            const ModuleIcon = MODULE_ICONS[module.id];
            const isActive = module.id === activeModule;

            return (
              <button
                key={module.id}
                ref={(el) => (chipRefs.current[index] = el)}
                onClick={() => handleChipClick(module.id)}
                disabled={!module.isImplemented}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'bg-primary-50 border-primary-400 text-primary-600'
                    : module.isImplemented
                    ? 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ModuleIcon className={`w-4 h-4 ${isActive ? 'text-primary-500' : module.isImplemented ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {module.title}
                </span>
                {!module.isImplemented && (
                  <span className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {showRightArrow && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 z-10 flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
