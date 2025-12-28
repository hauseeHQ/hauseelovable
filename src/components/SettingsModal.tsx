import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Users,
  Shield,
  Mail,
  Phone,
  Lock,
  Save,
  Check,
  X,
  AlertCircle,
  LogOut,
  Send,
  Clock,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';
import { HomeStage } from '../types';
import { useAuth } from '../contexts/AuthContext';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const HOME_STAGE_OPTIONS: { value: HomeStage; label: string }[] = [
  { value: 'dreaming', label: 'Dreaming' },
  { value: 'getting_ready', label: 'Getting ready' },
  { value: 'actively_looking', label: 'Actively looking' },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, signOut, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSignOut = async () => {
    await signOut();
    onClose();
    navigate('/plan');
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-40 hidden md:block"
        onClick={onClose}
      />

      <div
        className={`fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-white z-50
          md:rounded-xl md:shadow-2xl md:max-w-3xl md:w-full md:max-h-[90vh]
          transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full md:translate-x-[-50%] opacity-0 md:scale-95'}`}
      >
        <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your profile and account</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 md:py-6 px-4 md:px-6 space-y-6">
          <AccountSection
            user={user}
            onSignOut={handleSignOut}
            onSignIn={() => {
              onClose();
              navigate('/signin', { state: { returnTo: window.location.pathname } });
            }}
            onSignInWithGoogle={async () => {
              await signInWithGoogle();
              onClose();
            }}
          />
          {user && (
            <>
              <PersonalInformationSection user={user} />
              <CoBuyerManagementSection />
              <PrivacySecuritySection />
            </>
          )}
        </div>
      </div>
    </>
  );
}

function AccountSection({ 
  user, 
  onSignOut, 
  onSignIn,
  onSignInWithGoogle,
}: { 
  user: SupabaseUser | null; 
  onSignOut: () => void;
  onSignIn: () => void;
  onSignInWithGoogle: () => void;
}) {
  return (
    <section id="modal-account" className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
          <User className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Account</h2>
          <p className="text-sm text-gray-600">Manage your login and account</p>
        </div>
      </div>

      {user ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-green-900">Logged In</span>
            </div>
            <p className="text-sm text-green-800">
              You are currently signed in as <strong>{user.email}</strong>
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{user.email}</span>
                </div>
              </div>
              {user.user_metadata?.fullName && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                  <span className="text-sm text-gray-900">{user.user_metadata.fullName}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">User ID</label>
                <span className="text-xs text-gray-500 font-mono">{user.id}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onSignOut}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-900">Not Logged In</span>
            </div>
            <p className="text-sm text-yellow-800 mb-4">
              Sign in to save your data and access all features.
            </p>
            <button
              onClick={onSignIn}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In / Sign Up
            </button>
            <div className="mt-3">
              <button
                onClick={onSignInWithGoogle}
                className="w-full px-4 py-3 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" className="w-5 h-5" />
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function PersonalInformationSection({ user }: { user: SupabaseUser }) {
  const { userProfile, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState(userProfile?.firstName || '');
  const [lastName, setLastName] = useState(userProfile?.lastName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [homeStage, setHomeStage] = useState<HomeStage | ''>(userProfile?.homeStage as HomeStage || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || '');
      setLastName(userProfile.lastName || '');
      setPhone(userProfile.phone || '');
      setHomeStage(userProfile.homeStage as HomeStage || '');
    }
  }, [userProfile]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await updateProfile({
        firstName,
        lastName,
        phone: phone || undefined,
        homeStage: homeStage || undefined,
      });

      if (error) {
        throw error;
      }

      setSaveSuccess(true);
      setHasUnsavedChanges(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving user data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section id="modal-personal" className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Personal Information</h2>
            <p className="text-sm text-gray-600">Update your profile details</p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded-lg"></div>
            <div className="h-10 bg-gray-200 rounded-lg"></div>
            <div className="h-10 bg-gray-200 rounded-lg"></div>
            <div className="h-10 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="modal-personal" className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
          <User className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Personal Information</h2>
          <p className="text-sm text-gray-600">Update your profile details</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-400"
              placeholder="John"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-400"
              placeholder="Doe"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={user.email || ''}
              disabled
              className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
            <Lock className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Email is managed through Supabase and cannot be changed here
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(formatPhone(e.target.value));
                setHasUnsavedChanges(true);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-400"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Home Buying Stage <span className="text-red-500">*</span>
          </label>
          <select
            value={homeStage}
            onChange={(e) => {
              setHomeStage(e.target.value as HomeStage);
              setHasUnsavedChanges(true);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-400"
          >
            <option value="">Select your stage</option>
            {HOME_STAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {hasUnsavedChanges && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-800">You have unsaved changes</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            className="px-6 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

function CoBuyerManagementSection() {
  const [coBuyerState, setCoBuyerState] = useState<'none' | 'pending' | 'active'>('none');
  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <section id="modal-co-buyer" className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Co-Buyer Management</h2>
          <p className="text-sm text-gray-600">Collaborate with a partner or spouse</p>
        </div>
      </div>

      {coBuyerState === 'none' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Invite a Co-Buyer</h3>
            <p className="text-sm text-blue-800 mb-4">
              Share your home buying journey with a partner, spouse, or friend. They'll have access
              to all your saved homes, plans, and progress.
            </p>
            <ul className="space-y-2 text-sm text-blue-800 mb-4">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600" />
                View and edit all shared data
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600" />
                Receive notifications about activity
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600" />
                Collaborate in real-time
              </li>
            </ul>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-xs text-yellow-800">
                <strong>Important:</strong> Co-buyers will have full access to your account data.
                Only invite someone you trust completely.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="w-full md:w-auto px-6 py-3 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send Invitation
          </button>
        </div>
      )}

      {coBuyerState === 'pending' && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-1">Invitation Pending</h3>
                <p className="text-sm text-yellow-800 mb-2">
                  Invitation sent to <strong>partner@example.com</strong> on Dec 1, 2025
                </p>
                <p className="text-xs text-yellow-700">Expires in 47 hours</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Resend Invitation
            </button>
            <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
              Cancel Invitation
            </button>
          </div>
        </div>
      )}

      {coBuyerState === 'active' && (
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Jane Doe</h3>
                  <p className="text-sm text-gray-600">partner@example.com</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Active
              </span>
            </div>
            <p className="text-sm text-gray-600">Joined on Nov 15, 2025 • Last active 2 hours ago</p>
          </div>

          <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
            Remove Co-Buyer
          </button>
        </div>
      )}

      {showInviteModal && (
        <InviteModal onClose={() => setShowInviteModal(false)} onSuccess={() => setCoBuyerState('pending')} />
      )}
    </section>
  );
}

function InviteModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Invite Co-Buyer</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-400"
              placeholder="partner@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personal Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-400 resize-none"
              placeholder="Add a personal note..."
            />
            <p className="text-xs text-gray-500 text-right mt-1">{message.length} / 200</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-xs text-yellow-800">
              The invitation will expire in 48 hours. Your co-buyer will have full access to all your data.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!email}
              className="flex-1 px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Send Invitation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrivacySecuritySection() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSignOutAll = async () => {
    // Note: Supabase doesn't have a built-in "sign out all devices" feature
    // This would require custom implementation. For now, just sign out current session.
    await signOut();
    navigate('/plan');
  };

  return (
    <section id="modal-privacy" className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Privacy & Security</h2>
          <p className="text-sm text-gray-600">Manage your data and security settings</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Session Management</h3>
          <p className="text-sm text-gray-600 mb-3">
            Sign out from this device. Note: Supabase manages sessions automatically.
          </p>
          <button 
            onClick={handleSignOutAll}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Your Privacy Matters</h3>
          <p className="text-sm text-blue-800 mb-3">
            We take your privacy seriously. Your data is encrypted, never sold to third parties, and you
            have full control over your information.
          </p>
          <a href="/privacy" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            Read Privacy Policy
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        <div className="border-2 border-red-200 bg-red-50 rounded-lg p-4">
          <h3 className="font-semibold text-red-900 mb-2">Delete Account</h3>
          <p className="text-sm text-red-800 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
      )}
    </section>
  );
}

function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [confirmText, setConfirmText] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Delete Account</h3>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-semibold mb-2">This action cannot be undone!</p>
              <ul className="space-y-1 text-sm text-red-700">
                <li>• All your saved homes will be deleted</li>
                <li>• Your progress and plans will be lost</li>
                <li>• Co-buyer access will be revoked</li>
                <li>• You'll be immediately signed out</li>
              </ul>
            </div>

            <p className="text-sm text-gray-600">
              Type <strong>DELETE</strong> to confirm:
            </p>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-400"
              placeholder="DELETE"
            />

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={confirmText !== 'DELETE'}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              We've sent a confirmation code to <strong>test@example.com</strong>. Enter it below to complete deletion.
            </p>

            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-400"
              placeholder="Enter confirmation code"
            />

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Delete My Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
