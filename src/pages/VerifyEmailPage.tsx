import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Loader2, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoaded, signIn } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const email = location.state?.email || 'your email';
  const returnTo = location.state?.returnTo || '/plan';

  useEffect(() => {
    if (isLoaded && user) {
      navigate(returnTo);
    }
  }, [isLoaded, user, navigate, returnTo]);

  const handleResend = async () => {
    setIsResending(true);
    setResendMessage('');

    try {
      const { error } = await signIn(email);

      if (error) {
        throw error;
      }

      setResendMessage('Verification link sent! Check your email.');
    } catch (err: any) {
      console.error('Resend error:', err);
      setResendMessage('Failed to resend. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Home className="w-10 h-10 text-primary-400" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Verify Your Email
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-primary-400" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Check your email!
            </h3>

            <p className="text-gray-600 mb-4">
              We've sent a verification link to
            </p>
            <p className="text-primary-400 font-medium mb-6">{email}</p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 w-full">
              <p className="text-sm text-gray-700 mb-2">
                Click the link in your email to continue to Hausee Navigator.
              </p>
              <p className="text-xs text-gray-500">
                The link will automatically sign you in.
              </p>
            </div>

            <div className="flex items-center justify-center mb-4">
              <Loader2 className="w-5 h-5 text-primary-400 animate-spin mr-2" />
              <span className="text-sm text-gray-600">
                Waiting for verification...
              </span>
            </div>

            {resendMessage && (
              <div
                className={`mb-4 p-3 rounded-lg text-sm ${
                  resendMessage.includes('sent')
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {resendMessage}
              </div>
            )}

            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-sm text-primary-400 hover:text-primary-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? 'Sending...' : "Didn't receive it? Resend link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
