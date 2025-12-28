import { ModuleType } from '../../types';

interface NavigationDotsProps {
  modules: { id: ModuleType; title: string }[];
  activeModule: ModuleType;
  onModuleChange: (moduleId: ModuleType) => void;
}

export default function NavigationDots({ modules, activeModule, onModuleChange }: NavigationDotsProps) {
  const activeIndex = modules.findIndex(m => m.id === activeModule);

  return (
    <div className="flex items-center justify-center gap-2 py-3 mb-6">
      {modules.map((module, index) => (
        <button
          key={module.id}
          onClick={() => onModuleChange(module.id)}
          className="group relative"
          aria-label={`Go to ${module.title}`}
          title={module.title}
        >
          <div
            className={`transition-all duration-300 ${
              index === activeIndex
                ? 'w-8 h-2 bg-primary-400 rounded-full'
                : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
