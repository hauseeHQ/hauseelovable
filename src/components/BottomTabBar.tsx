import { Calendar, Search, Home, BookOpen, MessageCircle } from 'lucide-react';
import { NavItem } from '../types';

interface BottomTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems: NavItem[] = [
  { id: 'plan', label: 'Plan', icon: Calendar },
  { id: 'evaluate', label: 'Evaluate', icon: Search },
  { id: 'select', label: 'Select', icon: Home },
  { id: 'guide', label: 'Guide', icon: BookOpen },
  { id: 'ai', label: 'AI', icon: MessageCircle },
];

export default function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px] ${
                isActive ? 'text-primary-400' : 'text-gray-500'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-xs ${isActive ? 'font-medium' : ''}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
