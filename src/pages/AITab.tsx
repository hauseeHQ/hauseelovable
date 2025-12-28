import { useState, useEffect } from 'react';
import { Check, Lock, ExternalLink } from 'lucide-react';

const BRIX_CHAT_URL = 'https://chatgpt.com/g/g-67fba55171f88191b28c5da4bfd14263-brix-by-hausee-ca';

export default function AITab() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleChatClick = () => {
    console.log('Brix chat opened', {
      timestamp: new Date().toISOString(),
      source: 'ai_tab',
      action: 'chat_button_click',
    });

    window.open(BRIX_CHAT_URL, '_blank', 'noopener,noreferrer');
  };

  const features = [
    'Find neighbourhoods in Ontario that fit your lifestyle, commute, schools, parks, amenities, home type, and budget',
    'Instant and easy-to-read School & Neighbourhood Reports for Any Address',
    'Evaluates listings and explains how well each home matches your needs',
    'Compare 2–3 homes with clear analysis and confident recommendations',
    'Make smarter decisions with market insights, guidance on offers strategy and home value estimates',
    'Answering any home buying questions',
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-12">
      <div
        className={`max-w-3xl mx-auto transition-opacity duration-700 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-block mb-4 animate-bounce-gentle">
              <span className="text-7xl" role="img" aria-label="Brix AI Assistant">
                🤖
              </span>
            </div>

            <h1 className="text-2xl font-bold mb-3" style={{ color: '#333' }}>
              Brix
            </h1>

            <p className="text-gray-600 mb-4">
              Your AI Home Buying Assistant
            </p>

            <p className="text-gray-700 font-medium mb-8">
              Ask Brix anything about home buying
            </p>
          </div>

          <div className="mb-10">
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 text-left">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-gray-700 leading-relaxed">{feature}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleChatClick}
              className="w-full sm:w-auto min-w-[280px] h-14 bg-primary-400 hover:bg-primary-500 text-white font-semibold text-lg rounded-full transition-all duration-200 hover:scale-102 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
              aria-label="Open chat with Brix in a new window"
            >
              <span className="text-2xl">💬</span>
              <span>Chat with Brix</span>
              <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>

            <p className="text-sm text-gray-500 flex items-center gap-2">
              Opens in a new window • Powered by ChatGPT
            </p>

            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-lg mt-2">
              <Lock className="w-4 h-4 text-gray-500" />
              <p>Your conversations with Brix are private and secure</p>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <div className="text-sm text-gray-500 text-center space-y-2">
              <p>
                <strong className="text-gray-700">Coming Soon:</strong> Brix will be integrated
                directly into this app for seamless access to your home search data and preferences.
              </p>
              <p className="text-xs">
                The AI assistant will have context about your saved homes, budget, and criteria to
                provide personalized recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
