import { RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ServerErrorPageProps {
  errorId?: string;
}

export default function ServerErrorPage({ errorId }: ServerErrorPageProps) {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

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

        <div className="text-6xl mb-6">⚠️</div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">Something Went Wrong</h1>

        <p className="text-gray-600 mb-6 leading-relaxed">
          We encountered an unexpected error. Our team has been notified and we're working to fix it.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
          <p className="text-sm font-semibold text-blue-900 mb-2">What you can do:</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Refresh the page</li>
            <li>• Try again in a few minutes</li>
            <li>• Check our status page</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRefresh}
            className="w-full px-6 py-3 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-all hover:scale-105 font-medium flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh Page
          </button>

          <button
            onClick={() => navigate('/plan')}
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Return to Dashboard
          </button>
        </div>

        {errorId && (
          <div className="mt-8 p-3 bg-gray-100 rounded text-xs text-gray-600">
            Error ID: <span className="font-mono">{errorId}</span>
          </div>
        )}

        <p className="text-sm text-gray-500 mt-4">
          Still having trouble?{' '}
          <a href="mailto:support@hausee.ca" className="text-primary-400 hover:text-primary-500">
            Contact support
          </a>
          {errorId && ' with this error ID'}
        </p>
      </div>
    </div>
  );
}
