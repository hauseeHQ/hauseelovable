import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomTabBar from './BottomTabBar';
import SettingsModal from './SettingsModal';
import LoginModal from './LoginModal';
import PlanTab from '../pages/PlanTab';
import EvaluateTab from '../pages/EvaluateTab';
import SelectTab from '../pages/SelectTab';
import GuideTab from '../pages/GuideTab';
import AITab from '../pages/AITab';
import { TabId } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (location.state?.openSettings) {
      if (user) {
        setShowSettings(true);
      } else {
        setShowLogin(true);
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname, user]);

  useEffect(() => {
    if (user && showLogin) {
      setShowLogin(false);
      setShowSettings(true);
    }
  }, [user, showLogin]);

  const handleOpenSettings = () => {
    if (user) {
      setShowSettings(true);
    } else {
      setShowLogin(true);
    }
  };

  const getActiveTabFromPath = (): TabId => {
    const path = location.pathname.substring(1);
    if (['plan', 'evaluate', 'select', 'guide', 'ai'].includes(path)) {
      return path as TabId;
    }
    return 'plan';
  };

  const activeTab = getActiveTabFromPath();

  const handleTabChange = (tab: string) => {
    navigate(`/${tab}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'plan':
        return <PlanTab />;
      case 'evaluate':
        return <EvaluateTab />;
      case 'select':
        return <SelectTab />;
      case 'guide':
        return <GuideTab />;
      case 'ai':
        return <AITab />;
      default:
        return <PlanTab />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header onOpenSettings={handleOpenSettings} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenSettings={handleOpenSettings}
        />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="p-4 md:p-6">{renderTabContent()}</div>
        </main>
      </div>

      <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
