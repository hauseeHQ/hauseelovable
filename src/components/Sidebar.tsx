import { Calendar, Search, Home, BookOpen, MessageCircle, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { NavItem } from '../types';

interface SidebarProps {
  isCollapsed: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
}

const navItems: NavItem[] = [
  { id: 'plan', label: 'Plan', icon: Calendar },
  { id: 'evaluate', label: 'Evaluate', icon: Search },
  { id: 'select', label: 'Select', icon: Home },
  { id: 'guide', label: 'Guide', icon: BookOpen },
  { id: 'ai', label: 'AI', icon: MessageCircle },
];

export default function Sidebar({ isCollapsed, activeTab, onTabChange, onToggleSidebar, onOpenSettings }: SidebarProps) {

  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 relative ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className={`flex items-center ${isCollapsed ? 'justify-center pt-6 pb-4' : 'justify-end pt-6 pb-4 px-4'}`}>
        {!isCollapsed && (
          <button
            onClick={onToggleSidebar}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>
      {isCollapsed && (
        <div className="flex justify-center pb-2">
          <button
            onClick={onToggleSidebar}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}

      <div className={`space-y-1 flex-1 ${isCollapsed ? 'px-2 pt-4' : 'p-4'}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center rounded-lg transition-colors ${
                isCollapsed
                  ? 'justify-center p-3'
                  : 'gap-3 px-4 py-3'
              } ${
                isActive
                  ? 'bg-primary-50 text-primary-400 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>

      <div className={`border-t border-gray-200 ${isCollapsed ? 'px-2 py-4' : 'p-4'}`}>
        <button
          onClick={onOpenSettings}
          title={isCollapsed ? 'Settings' : undefined}
          className={`w-full flex items-center rounded-lg transition-colors text-gray-600 hover:bg-gray-50 ${
            isCollapsed
              ? 'justify-center p-3'
              : 'gap-3 px-4 py-3'
          }`}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </button>
      </div>
    </aside>
  );
}
