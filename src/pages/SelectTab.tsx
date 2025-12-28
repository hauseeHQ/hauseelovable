import { useState } from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AgentMatchingForm from '../components/select/AgentMatchingForm';
import VideoModal from '../components/VideoModal';
import { useAuth } from '../contexts/AuthContext';

export default function SelectTab() {
  const navigate = useNavigate();
  const { user, isLoaded } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const handleGetMatched = () => {
    if (!user) {
      navigate('/signin', { state: { returnTo: '/select' } });
      return;
    }
    setShowForm(true);
  };

  if (showForm) {
    return (
      <AgentMatchingForm
        onComplete={() => {
          setShowForm(false);
          setHasSubmitted(true);
        }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose the Right Real Estate Agent — On Your Terms</h2>
        <p className="text-gray-600 mb-8">
          Compare qualified agents, review personalized service offers, and choose who earns your business — with no pressure, no obligation, and meaningful savings.
        </p>

        {hasSubmitted ? (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-green-900 mb-2">Request Already Submitted</h3>
            <p className="text-green-700">
              We're currently processing your agent matching request. You'll hear from us within 24-48
              hours.
            </p>
          </div>
        ) : (
          <div className="space-y-6 mb-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏡</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Personalized Matching</h3>
                <p className="text-gray-600">
                  We match you with agents based on your goals, timeline, location, and home type — not paid ads or random referrals.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Vetted Professionals</h3>
                <p className="text-gray-600">
                  All agents are licensed, experienced, and selected specifically for your situation — not just "top sellers."
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Agent-Provided Savings</h3>
                <p className="text-gray-600">
                  Agents may offer reduced commission, cashback from their commission, or exclusive perks.
                </p>
                <p className="text-gray-600">
                  Guaranteed minimum $5,000 in savings, with potential savings of up to 1% of your home's purchase price.
                </p>
              </div>
            </div>
          </div>
        )}

        {!hasSubmitted && (
          <p className="text-gray-600 mb-8">
            Savings may be offered upfront, after closing, or through added benefits — depending on the agent you choose.
          </p>
        )}

        <div className="flex flex-col items-center gap-4 mb-8">
          <button
            onClick={() => setShowVideoModal(true)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
          >
            <Play className="w-4 h-4" />
            <span>Watch how Hausee Select works (2 min)</span>
          </button>
          <p className="text-xs text-gray-500 text-center max-w-md">
            See how buyers compare agents and stay in control — before sharing any contact info.
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleGetMatched}
            disabled={hasSubmitted || !isLoaded}
            className="w-full md:w-auto px-8 py-4 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isLoaded ? 'Loading...' : hasSubmitted ? 'Request Already Submitted' : user ? 'Get Matched' : 'Sign In to Get Matched'}
          </button>
        </div>

        <p className="text-sm text-gray-500 text-center mt-3">
          Takes about 5 minutes • Free for buyers
        </p>

        <p className="text-sm text-gray-600 text-center mt-4">
          Have questions?{' '}
          <a
            href="https://wa.me/16479311196"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-400 hover:text-primary-500 transition-colors"
          >
            Chat with us
          </a>
        </p>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="font-bold text-gray-900 mb-3">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-400 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                1
              </div>
              <div className="font-medium text-gray-900">Tell Us What You Need</div>
              <div className="text-gray-600 text-xs">Answer a short questionnaire about your goals, timeline, and preferences.</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-400 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                2
              </div>
              <div className="font-medium text-gray-900">We Curate Your Matches</div>
              <div className="text-gray-600 text-xs">Within 24–48 hours, we match you with up to three qualified agents who want to earn your business.</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-400 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                3
              </div>
              <div className="font-medium text-gray-900">Meet, Compare & Review Offers</div>
              <div className="text-gray-600 text-xs">Interview agents, review and compare their service offer, and ask the questions that matter to you.</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-400 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                4
              </div>
              <div className="font-medium text-gray-900">Choose Confidently</div>
              <div className="text-gray-600 text-xs">Pick the agent that feels right — or walk away. There's no obligation to move forward.</div>
            </div>
          </div>
          <p className="text-sm text-gray-500 text-center mt-6">
            Hausee is buyer-first. We don't sell your contact info or pressure you to choose an agent.
          </p>
          <p className="text-sm text-gray-500 text-center mt-2">
            Savings and incentives vary by agent and transaction. Details are confirmed directly with matched agents before engagement.
          </p>
        </div>
      </div>

      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
        title="How Hausee Select Works"
      />
    </div>
  );
}
