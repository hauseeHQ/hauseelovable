import { useNavigate } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

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

        <div className="text-gray-300 text-9xl font-bold mb-4">404</div>

        <div className="text-6xl mb-6">🏚️</div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          Oops! The page you're looking for doesn't exist. It may have been moved or deleted.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/plan')}
            className="w-full px-6 py-3 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-all hover:scale-105 font-medium flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </button>

          <button
            onClick={() => navigate('/evaluate')}
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Browse Homes
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full px-6 py-3 text-gray-700 hover:text-primary-400 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Need help?{' '}
          <a href="mailto:support@hausee.ca" className="text-primary-400 hover:text-primary-500">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
