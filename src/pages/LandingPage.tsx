import { Link } from 'react-router-dom';
import { TrendingUp, Shield, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <img
              src="/hausee-logo.png"
              alt="Hausee Navigator"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Hausee Navigator
          </h1>
          <p className="text-xl md:text-2xl text-primary-400 font-medium mb-6">
            Your trusted home buying co-pilot
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Navigate your home buying journey with confidence. From planning and evaluation
            to selection and closing, we guide first-time Canadian home buyers every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-primary-400 text-white font-semibold rounded-lg hover:bg-primary-500 transition-colors shadow-lg"
            >
              Get Started
            </Link>
            <Link
              to="/signin"
              className="w-full sm:w-auto text-gray-600 hover:text-primary-400 transition-colors"
            >
              Already have an account? <span className="font-medium">Sign in</span>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Plan Your Journey</h3>
            <p className="text-gray-600">
              Create a personalized timeline and budget that works for your unique situation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Evaluate with Confidence</h3>
            <p className="text-gray-600">
              Compare properties, analyze neighborhoods, and make informed decisions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Guidance</h3>
            <p className="text-gray-600">
              Access resources, guides, and AI-powered assistance tailored to first-time buyers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
