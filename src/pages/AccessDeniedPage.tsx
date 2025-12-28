import { useNavigate } from 'react-router-dom';
import { Lock, Home, LogIn } from 'lucide-react';

interface AccessDeniedPageProps {
  reason?: 'permission' | 'session' | 'cobuyer';
}

export default function AccessDeniedPage({ reason = 'permission' }: AccessDeniedPageProps) {
  const navigate = useNavigate();

  const getContent = () => {
    switch (reason) {
      case 'session':
        return {
          title: 'Session Expired',
          description: 'Your session has expired. Please sign in again to continue.',
          action: 'Sign In Again',
          onAction: () => navigate('/signin'),
        };
      case 'cobuyer':
        return {
          title: 'Co-Buyer Access',
          description: 'This action is only available to the primary account holder.',
          action: 'Contact Primary User',
          onAction: () => {},
        };
      default:
        return {
          title: 'Access Denied',
          description: "You don't have permission to access this resource.",
          action: 'Return to Dashboard',
          onAction: () => navigate('/plan'),
        };
    }
  };

  const content = getContent();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <img
            src="/hausee-logo.png"
            alt="Hausee Navigator"
            className="w-16 h-16 object-contain"
          />
        </div>

        <div className="text-6xl mb-6">🔒</div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">{content.title}</h1>

        <p className="text-gray-600 mb-8 leading-relaxed">{content.description}</p>

        <div className="space-y-3">
          <button
            onClick={content.onAction}
            className="w-full px-6 py-3 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-all hover:scale-105 font-medium flex items-center justify-center gap-2"
          >
            {reason === 'session' ? (
              <LogIn className="w-5 h-5" />
            ) : (
              <Home className="w-5 h-5" />
            )}
            {content.action}
          </button>

          <button
            onClick={() => navigate('/plan')}
            className="w-full px-6 py-3 text-gray-700 hover:text-primary-400 transition-colors font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
