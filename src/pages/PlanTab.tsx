import { useState, useRef, useEffect } from 'react';
import ModuleNavigation from '../components/plan/ModuleNavigation';
import NavigationDots from '../components/plan/NavigationDots';
import MyDreamHomeForm from '../components/plan/MyDreamHomeForm';
import SelfAssessmentForm from '../components/plan/SelfAssessmentForm';
import FinancialReadinessForm from '../components/plan/FinancialReadinessForm';
import MortgageChecklistForm from '../components/plan/MortgageChecklistForm';
import MovingTodoListForm from '../components/plan/MovingTodoListForm';
import BudgetPlannerForm from '../components/plan/BudgetPlannerForm';
import DownPaymentTrackerForm from '../components/plan/DownPaymentTrackerForm';
import { ModuleType } from '../types';

const MODULES = [
  { id: 'my-dream-home' as ModuleType, title: 'My Dream Home' },
  { id: 'financial-readiness' as ModuleType, title: 'Financial Readiness' },
  { id: 'self-assessment' as ModuleType, title: 'Self-Assessment' },
  { id: 'budget-planner' as ModuleType, title: 'Budget Planner' },
  { id: 'down-payment-tracker' as ModuleType, title: 'Down Payment Tracker' },
  { id: 'mortgage-checklist' as ModuleType, title: 'Mortgage Checklist' },
  { id: 'moving-todo-list' as ModuleType, title: 'Moving To-Do List' },
];

export default function PlanTab() {
  const [activeModule, setActiveModule] = useState<ModuleType>('my-dream-home');
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (swipeDirection) {
      const timer = setTimeout(() => setSwipeDirection(null), 300);
      return () => clearTimeout(timer);
    }
  }, [swipeDirection]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      const currentIndex = MODULES.findIndex(m => m.id === activeModule);

      if (diff > 0 && currentIndex < MODULES.length - 1) {
        setSwipeDirection('left');
        setActiveModule(MODULES[currentIndex + 1].id);
      } else if (diff < 0 && currentIndex > 0) {
        setSwipeDirection('right');
        setActiveModule(MODULES[currentIndex - 1].id);
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleModuleChange = (moduleId: ModuleType) => {
    const currentIndex = MODULES.findIndex(m => m.id === activeModule);
    const newIndex = MODULES.findIndex(m => m.id === moduleId);

    if (newIndex > currentIndex) {
      setSwipeDirection('left');
    } else if (newIndex < currentIndex) {
      setSwipeDirection('right');
    }

    setActiveModule(moduleId);
  };

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'my-dream-home':
        return <MyDreamHomeForm />;
      case 'self-assessment':
        return <SelfAssessmentForm />;
      case 'financial-readiness':
        return <FinancialReadinessForm />;
      case 'budget-planner':
        return <BudgetPlannerForm />;
      case 'mortgage-checklist':
        return <MortgageChecklistForm />;
      case 'moving-todo-list':
        return <MovingTodoListForm />;
      case 'down-payment-tracker':
        return <DownPaymentTrackerForm />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <ModuleNavigation
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
      />

      <NavigationDots
        modules={MODULES}
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
      />

      <div
        ref={contentRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative overflow-hidden"
        style={{ touchAction: 'pan-y' }}
      >
        <div
          className={`transition-all duration-300 ${
            swipeDirection === 'left'
              ? 'animate-slide-in-left'
              : swipeDirection === 'right'
              ? 'animate-slide-in-right'
              : ''
          }`}
        >
          {renderModuleContent()}
        </div>
      </div>

      <style>{`
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.3s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
