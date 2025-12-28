import { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  Lock,
  Home,
  DollarSign,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  X,
  Edit,
} from 'lucide-react';
import { SelectFormData, ONTARIO_CITIES } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

const PROPERTY_TYPES = [
  'Condo / Condo Townhouse',
  'Freehold Townhouse',
  'Semi-Detached House',
  'Detached House',
];

const BUDGET_RANGES = [
  '$900K or less',
  '$900K – $1.1M',
  '$1.1M – $1.3M',
  '$1.3M – $1.6M',
  '$1.6M or more',
];

const PRICE_EXPECTATION_RANGES = [
  '$900K or less',
  '$900K – $1.1M',
  '$1.1M – $1.3M',
  '$1.3M – $1.6M',
  '$1.6M or more',
];

const initialFormData: SelectFormData = {
  aboutYou: {
    firstName: '',
    lastName: '',
    email: 'user@example.com',
    phone: '',
    hasReferral: false,
    referralCode: '',
  },
  propertyIntent: '',
  buyerQuestions: {
    preferredCities: [],
    budgetRange: '',
    propertyTypes: [],
    timeline: '',
    preApprovalStatus: '',
    mortgageApprovedAmount: '',
    isPrimaryResidence: null,
  },
  sellerQuestions: {
    propertyType: '',
    city: '',
    intersectionOrAddress: '',
    priceExpectationRange: '',
    sellingTimeline: '',
    sellingReason: '',
    propertyCondition: '',
    propertyNotes: '',
  },
  consent: {
    communicationConsent: false,
    termsAccepted: false,
    hasCurrentAgent: false,
    contactPreference: '',
    additionalNotes: '',
  },
  currentStep: 1,
  status: 'draft',
};

interface AgentMatchingFormProps {
  onComplete: () => void;
}

export default function AgentMatchingForm({ onComplete }: AgentMatchingFormProps) {
  const { user, userProfile } = useAuth();
  const [formData, setFormData] = useState<SelectFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otp, setOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [otpLoading, setOtpLoading] = useState<'send' | 'verify' | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('agentMatchingForm');
    if (saved) {
      try {
        const savedData = JSON.parse(saved);
        setFormData(savedData);
      } catch {
        console.error('Failed to load saved form data');
      }
    }

    if (user && userProfile) {
      setFormData((prev) => ({
        ...prev,
        aboutYou: {
          ...prev.aboutYou,
          firstName: userProfile.firstName || prev.aboutYou.firstName,
          lastName: userProfile.lastName || prev.aboutYou.lastName,
          email: user.email || prev.aboutYou.email,
          phone: userProfile.phone || prev.aboutYou.phone,
        },
      }));
    }
  }, [user, userProfile]);

  useEffect(() => {
    if (formData.status !== 'submitted') {
      localStorage.setItem('agentMatchingForm', JSON.stringify(formData));
    }
  }, [formData]);

  const phoneToE164 = (phone: string): string | null => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    return null;
  };

  const resetOtpState = () => {
    setOtp('');
    setOtpSent(false);
    setOtpVerified(false);
    setOtpLoading(null);
    setOtpError(null);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.aboutYou.firstName || formData.aboutYou.firstName.length < 2) {
        newErrors.firstName = 'First name must be at least 2 characters';
      }
      if (!formData.aboutYou.lastName || formData.aboutYou.lastName.length < 2) {
        newErrors.lastName = 'Last name must be at least 2 characters';
      }
      if (!formData.aboutYou.phone || formData.aboutYou.phone.replace(/\D/g, '').length !== 10) {
        newErrors.phone = 'Please enter a valid 10-digit phone number';
      }
      if (!otpVerified) {
        newErrors.phone = 'Please verify your phone number (OTP) before continuing';
      }
      if (formData.aboutYou.hasReferral && !formData.aboutYou.referralCode) {
        newErrors.referralCode = 'Please enter your referral code';
      }
    }

    if (step === 2) {
      if (!formData.propertyIntent) {
        newErrors.propertyIntent = 'Please select your property intent';
      }
    }

    const isBuyer = formData.propertyIntent === 'buy-first' || formData.propertyIntent === 'buy-another' || formData.propertyIntent === 'sell-and-buy';
    const isSeller = formData.propertyIntent === 'sell-current' || formData.propertyIntent === 'sell-and-buy';

    if (step === 3 && isBuyer) {
      if (formData.buyerQuestions!.preferredCities.length === 0) {
        newErrors.preferredCities = 'Please select at least one city';
      }
      if (!formData.buyerQuestions!.budgetRange) {
        newErrors.budgetRange = 'Please select your budget range';
      }
      if (formData.buyerQuestions!.propertyTypes.length === 0) {
        newErrors.propertyTypes = 'Please select at least one property type';
      }
      if (!formData.buyerQuestions!.timeline) {
        newErrors.timeline = 'Please select your timeline';
      }
      if (!formData.buyerQuestions!.preApprovalStatus) {
        newErrors.preApprovalStatus = 'Please select your pre-approval status';
      }
      if (formData.buyerQuestions!.preApprovalStatus === 'yes' && !formData.buyerQuestions!.mortgageApprovedAmount) {
        newErrors.mortgageApprovedAmount = 'Please enter your approved amount';
      }
      if (formData.buyerQuestions!.isPrimaryResidence === null) {
        newErrors.isPrimaryResidence = 'Please indicate if this is for primary residence';
      }
    }

    if (step === 3 && isSeller) {
      if (!formData.sellerQuestions!.propertyType) {
        newErrors.propertyType = 'Please select property type';
      }
      if (!formData.sellerQuestions!.city) {
        newErrors.city = 'Please select a city';
      }
      if (!formData.sellerQuestions!.intersectionOrAddress) {
        newErrors.intersectionOrAddress = 'Please enter intersection or address';
      }
      if (!formData.sellerQuestions!.priceExpectationRange) {
        newErrors.priceExpectationRange = 'Please select price expectation range';
      }
      if (!formData.sellerQuestions!.sellingTimeline) {
        newErrors.sellingTimeline = 'Please select selling timeline';
      }
      if (!formData.sellerQuestions!.sellingReason) {
        newErrors.sellingReason = 'Please select reason for selling';
      }
      if (!formData.sellerQuestions!.propertyCondition) {
        newErrors.propertyCondition = 'Please select property condition';
      }
    }

    if (step === 4) {
      if (!formData.consent.communicationConsent) {
        newErrors.communicationConsent = 'You must consent to receive communication';
      }
      if (!formData.consent.termsAccepted) {
        newErrors.termsAccepted = 'You must accept all terms to continue';
      }
      if (!formData.consent.contactPreference) {
        newErrors.contactPreference = 'Please select your preferred contact method';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToStep = (step: number) => {
    if (step < formData.currentStep || validateStep(formData.currentStep)) {
      setFormData((prev) => ({ ...prev, currentStep: step }));
      window.scrollTo(0, 0);
    }
  };

  const handleNext = () => {
    if (validateStep(formData.currentStep)) {
      goToStep(formData.currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    if (validateStep(4)) {
      const submittedData = {
        ...formData,
        status: 'submitted' as const,
        submittedAt: new Date().toISOString(),
      };
      setFormData(submittedData);
      localStorage.removeItem('agentMatchingForm');
      goToStep(5);
    }
  };

  const renderProgressBar = () => {
    const steps = [
      { num: 1, label: 'About You' },
      { num: 2, label: 'Intent' },
      { num: 3, label: 'Details' },
      { num: 4, label: 'Review' },
      { num: 5, label: 'Complete' },
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    formData.currentStep >= step.num
                      ? 'bg-primary-400 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {formData.currentStep > step.num ? <Check className="w-5 h-5" /> : step.num}
                </div>
                <span
                  className={`text-xs mt-2 font-medium hidden md:block ${
                    formData.currentStep >= step.num ? 'text-primary-400' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 transition-colors ${
                    formData.currentStep > step.num ? 'bg-primary-400' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {formData.currentStep < 5 && renderProgressBar()}

        {formData.currentStep === 1 && (
          <Step1ContactInfo
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            onNext={handleNext}
            otp={otp}
            setOtp={setOtp}
            otpSent={otpSent}
            setOtpSent={setOtpSent}
            otpVerified={otpVerified}
            setOtpVerified={setOtpVerified}
            otpLoading={otpLoading}
            setOtpLoading={setOtpLoading}
            otpError={otpError}
            setOtpError={setOtpError}
            resetOtpState={resetOtpState}
            phoneToE164={phoneToE164}
          />
        )}

        {formData.currentStep === 2 && (
          <Step2PropertyIntent
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            onNext={handleNext}
            onBack={() => goToStep(1)}
          />
        )}

        {formData.currentStep === 3 && (formData.propertyIntent === 'buy-first' || formData.propertyIntent === 'buy-another') && (
          <Step3ABuyerQuestions
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            onNext={handleNext}
            onBack={() => goToStep(2)}
          />
        )}

        {formData.currentStep === 3 && formData.propertyIntent === 'sell-current' && (
          <Step3BSellerQuestions
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            onNext={handleNext}
            onBack={() => goToStep(2)}
          />
        )}

        {formData.currentStep === 3 && formData.propertyIntent === 'sell-and-buy' && (
          <Step3CCombinedQuestions
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            onNext={handleNext}
            onBack={() => goToStep(2)}
          />
        )}

        {formData.currentStep === 4 && (
          <Step4Review
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            onSubmit={handleSubmit}
            onBack={() => goToStep(3)}
            goToStep={goToStep}
          />
        )}

        {formData.currentStep === 5 && <Step5Confirmation onComplete={onComplete} />}
      </div>
    </div>
  );
}

interface StepProps {
  formData: SelectFormData;
  setFormData: React.Dispatch<React.SetStateAction<SelectFormData>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onNext: () => void;
  onBack?: () => void;
}

interface Step1ContactInfoProps extends StepProps {
  otp: string;
  setOtp: (otp: string) => void;
  otpSent: boolean;
  setOtpSent: (sent: boolean) => void;
  otpVerified: boolean;
  setOtpVerified: (verified: boolean) => void;
  otpLoading: 'send' | 'verify' | null;
  setOtpLoading: (loading: 'send' | 'verify' | null) => void;
  otpError: string | null;
  setOtpError: (error: string | null) => void;
  resetOtpState: () => void;
  phoneToE164: (phone: string) => string | null;
}

function Step1ContactInfo({
  formData,
  setFormData,
  errors,
  setErrors,
  onNext,
  otp,
  setOtp,
  otpSent,
  setOtpSent,
  otpVerified,
  setOtpVerified,
  otpLoading,
  setOtpLoading,
  otpError,
  setOtpError,
  resetOtpState,
  phoneToE164,
}: Step1ContactInfoProps) {
  const clearError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handleSendOtp = async () => {
    const e164 = phoneToE164(formData.aboutYou.phone);
    if (!e164) {
      setOtpError('Please enter a valid 10-digit phone number');
      return;
    }

    setOtpLoading('send');
    setOtpError(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: e164 },
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setOtpSent(true);
    } catch (err: any) {
      setOtpError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setOtpLoading(null);
    }
  };

  const handleVerifyOtp = async () => {
    const e164 = phoneToE164(formData.aboutYou.phone);
    if (!e164) {
      setOtpError('Please enter a valid 10-digit phone number');
      return;
    }

    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a 6-digit verification code');
      return;
    }

    setOtpLoading('verify');
    setOtpError(null);

    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone: e164, code: otp },
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.verified) {
        setOtpVerified(true);
        setOtpError(null);
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (err: any) {
      setOtpError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setOtpLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's start with your information</h2>
      <p className="text-gray-600 mb-6">We'll use this to connect you with the right agent.</p>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.aboutYou.firstName}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    aboutYou: { ...prev.aboutYou, firstName: e.target.value },
                  }));
                  if (e.target.value.length >= 2) {
                    clearError('firstName');
                  }
                }}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="John"
              />
            </div>
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.firstName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.aboutYou.lastName}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    aboutYou: { ...prev.aboutYou, lastName: e.target.value },
                  }));
                  if (e.target.value.length >= 2) {
                    clearError('lastName');
                  }
                }}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Doe"
              />
            </div>
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={formData.aboutYou.email}
              disabled
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
            <Lock className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-1">This email is from your account and cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={formData.aboutYou.phone}
              onChange={(e) => {
                resetOtpState();
                const formattedPhone = formatPhone(e.target.value);
                setFormData((prev) => ({
                  ...prev,
                  aboutYou: { ...prev.aboutYou, phone: formattedPhone },
                }));
                if (formattedPhone.replace(/\D/g, '').length === 10) {
                  clearError('phone');
                }
              }}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="(555) 123-4567"
            />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.phone}
            </p>
          )}

          {/* OTP Verification UI */}
          {formData.aboutYou.phone.replace(/\D/g, '').length === 10 && (
            <div className="mt-4 space-y-3">
              {!otpVerified ? (
                <>
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpLoading === 'send'}
                      className="w-full px-4 py-2 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {otpLoading === 'send' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send verification code'
                      )}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Enter verification code
                        </label>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setOtp(digits);
                            setOtpError(null);
                          }}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 ${
                            otpError ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="000000"
                          maxLength={6}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={otpLoading === 'verify' || otp.length !== 6}
                          className="flex-1 px-4 py-2 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {otpLoading === 'verify' ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            'Verify code'
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={otpLoading === 'send'}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {otpLoading === 'send' ? 'Sending...' : 'Resend'}
                        </button>
                      </div>
                    </div>
                  )}
                  {otpError && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {otpError}
                    </p>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Phone number verified</span>
                  </div>
                  <button
                    type="button"
                    onClick={resetOtpState}
                    className="text-sm text-primary-400 hover:text-primary-500 font-medium"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Do you have a referral code?
          </label>
          <div className="flex gap-3 mb-3">
            <button
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  aboutYou: { ...prev.aboutYou, hasReferral: true },
                }))
              }
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                formData.aboutYou.hasReferral
                  ? 'bg-primary-400 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  aboutYou: { ...prev.aboutYou, hasReferral: false, referralCode: '' },
                }))
              }
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                !formData.aboutYou.hasReferral
                  ? 'bg-primary-400 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              No
            </button>
          </div>

          {formData.aboutYou.hasReferral && (
            <div>
              <input
                type="text"
                value={formData.aboutYou.referralCode}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    aboutYou: { ...prev.aboutYou, referralCode: e.target.value },
                  }));
                  if (e.target.value.trim()) {
                    clearError('referralCode');
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 ${
                  errors.referralCode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter referral code"
              />
              {errors.referralCode && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.referralCode}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          className="px-6 py-3 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors font-medium flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function Step2PropertyIntent({ formData, setFormData, errors, setErrors, onNext, onBack }: StepProps) {
  const clearError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const intentOptions = [
    {
      value: 'buy-first' as const,
      title: 'Buy my first home',
      description: 'First-time homebuyer looking to purchase',
      icon: Home,
    },
    {
      value: 'buy-another' as const,
      title: 'Buy another home',
      description: 'Looking to purchase an additional property',
      icon: Home,
    },
    {
      value: 'sell-current' as const,
      title: 'Sell my current home',
      description: 'Ready to list my property for sale',
      icon: DollarSign,
    },
    {
      value: 'sell-and-buy' as const,
      title: 'Sell my current home to buy another home',
      description: 'Looking to sell and purchase at the same time',
      icon: Home,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">What brings you here?</h2>
      <p className="text-gray-600 mb-8">Select the option that best describes your needs.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {intentOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = formData.propertyIntent === option.value;

          return (
            <button
              key={option.value}
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  propertyIntent: option.value,
                }));
                clearError('propertyIntent');
              }}
              className={`p-6 rounded-lg border-2 transition-all text-left hover:shadow-lg ${
                isSelected
                  ? 'border-primary-400 bg-primary-50 shadow-md'
                  : 'border-gray-200 hover:border-primary-200'
              }`}
            >
              <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-7 h-7 text-primary-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{option.title}</h3>
              <p className="text-sm text-gray-600">{option.description}</p>
              {isSelected && (
                <div className="mt-4 flex items-center gap-2 text-primary-400 font-medium">
                  <CheckCircle2 className="w-5 h-5" />
                  Selected
                </div>
              )}
            </button>
          );
        })}
      </div>

      {errors.propertyIntent && (
        <p className="text-red-500 text-sm mb-4 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {errors.propertyIntent}
        </p>
      )}

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-3 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors font-medium flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function Step3ABuyerQuestions({ formData, setFormData, errors, setErrors, onNext, onBack }: StepProps) {
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const clearError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const filteredCities = ONTARIO_CITIES.filter(
    (city) =>
      city.toLowerCase().includes(citySearch.toLowerCase()) &&
      !formData.buyerQuestions!.preferredCities.includes(city)
  );

  const addCity = (city: string) => {
    if (formData.buyerQuestions!.preferredCities.length < 3) {
      setFormData((prev) => ({
        ...prev,
        buyerQuestions: {
          ...prev.buyerQuestions!,
          preferredCities: [...prev.buyerQuestions!.preferredCities, city],
        },
      }));
      setCitySearch('');
      setShowCityDropdown(false);
      if (formData.buyerQuestions!.preferredCities.length >= 0) {
        clearError('preferredCities');
      }
    }
  };

  const removeCity = (city: string) => {
    const newCities = formData.buyerQuestions!.preferredCities.filter((c) => c !== city);
    setFormData((prev) => ({
      ...prev,
      buyerQuestions: {
        ...prev.buyerQuestions!,
        preferredCities: newCities,
      },
    }));
    if (newCities.length > 0 && newCities.length <= 3) {
      clearError('preferredCities');
    }
  };

  const togglePropertyType = (type: string) => {
    const current = formData.buyerQuestions!.propertyTypes;
    const newTypes = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    setFormData((prev) => ({
      ...prev,
      buyerQuestions: {
        ...prev.buyerQuestions!,
        propertyTypes: newTypes,
      },
    }));
    if (newTypes.length > 0) {
      clearError('propertyTypes');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your home search</h2>
      <p className="text-gray-600 mb-6">This helps us match you with the right agent.</p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Cities <span className="text-red-500">*</span>
            <span className="text-gray-500 font-normal ml-2">(Select up to 3)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={citySearch}
              onChange={(e) => {
                setCitySearch(e.target.value);
                setShowCityDropdown(true);
              }}
              onFocus={() => setShowCityDropdown(true)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 ${
                errors.preferredCities ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Search for cities..."
              disabled={formData.buyerQuestions!.preferredCities.length >= 3}
            />
            {showCityDropdown && filteredCities.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredCities.slice(0, 10).map((city) => (
                  <button
                    key={city}
                    onClick={() => addCity(city)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.buyerQuestions!.preferredCities.map((city) => (
              <span
                key={city}
                className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
              >
                {city}
                <button
                  onClick={() => removeCity(city)}
                  className="hover:bg-primary-100 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          {errors.preferredCities && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.preferredCities}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Budget Range <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {BUDGET_RANGES.map((range) => (
              <label
                key={range}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name="budgetRange"
                  value={range}
                  checked={formData.buyerQuestions!.budgetRange === range}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      buyerQuestions: {
                        ...prev.buyerQuestions!,
                        budgetRange: e.target.value,
                      },
                    }));
                    clearError('budgetRange');
                  }}
                  className="w-4 h-4 text-primary-400 focus:ring-primary-400"
                />
                <span className="text-gray-900">{range}</span>
              </label>
            ))}
          </div>
          {errors.budgetRange && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.budgetRange}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Property Types <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => togglePropertyType(type)}
                className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                  formData.buyerQuestions!.propertyTypes.includes(type)
                    ? 'border-primary-400 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-700 hover:border-primary-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          {errors.propertyTypes && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.propertyTypes}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeline <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.buyerQuestions!.timeline}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                buyerQuestions: { ...prev.buyerQuestions!, timeline: e.target.value },
              }));
              if (e.target.value) {
                clearError('timeline');
              }
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 ${
              errors.timeline ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select timeline</option>
            <option value="Ready to buy in next 3 months">Ready to buy in next 3 months</option>
            <option value="Anytime in next 6 months">Anytime in next 6 months</option>
            <option value="Some time in next 6-12 months">Some time in next 6-12 months</option>
            <option value="Unsure at the moment or in next 1-2 years">Unsure at the moment or in next 1-2 years</option>
          </select>
          {errors.timeline && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.timeline}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Mortgage Pre-Approval Status <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {[
              { value: 'yes', label: 'Yes, I have pre-approval' },
              { value: 'in_progress', label: 'In progress' },
              { value: 'no', label: 'Yet to apply' },
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="preApproval"
                  value={option.value}
                  checked={formData.buyerQuestions!.preApprovalStatus === option.value}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      buyerQuestions: {
                        ...prev.buyerQuestions!,
                        preApprovalStatus: e.target.value as any,
                      },
                    }));
                    clearError('preApprovalStatus');
                    if (e.target.value !== 'yes') {
                      clearError('mortgageApprovedAmount');
                    }
                  }}
                  className="w-4 h-4 text-primary-400 focus:ring-primary-400"
                />
                <span className="text-gray-900">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.preApprovalStatus && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.preApprovalStatus}
            </p>
          )}

          {formData.buyerQuestions!.preApprovalStatus === 'yes' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approved Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.buyerQuestions!.mortgageApprovedAmount}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    buyerQuestions: {
                      ...prev.buyerQuestions!,
                      mortgageApprovedAmount: e.target.value,
                    },
                  }));
                  if (e.target.value.trim()) {
                    clearError('mortgageApprovedAmount');
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 ${
                  errors.mortgageApprovedAmount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., $1,200,000"
              />
              {errors.mortgageApprovedAmount && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.mortgageApprovedAmount}
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Primary Residence <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  buyerQuestions: { ...prev.buyerQuestions!, isPrimaryResidence: true },
                }));
                clearError('isPrimaryResidence');
              }}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                formData.buyerQuestions!.isPrimaryResidence === true
                  ? 'bg-primary-400 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  buyerQuestions: { ...prev.buyerQuestions!, isPrimaryResidence: false },
                }));
                clearError('isPrimaryResidence');
              }}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                formData.buyerQuestions!.isPrimaryResidence === false
                  ? 'bg-primary-400 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              No
            </button>
          </div>
          {errors.isPrimaryResidence && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.isPrimaryResidence}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-3 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors font-medium flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function Step3BSellerQuestions({ formData, setFormData, errors, setErrors, onNext, onBack }: StepProps) {
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const clearError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const filteredCities = ONTARIO_CITIES.filter((city) =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your property</h2>
      <p className="text-gray-600 mb-6">This helps us match you with the right agent.</p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Property Type <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {PROPERTY_TYPES.concat(['Other']).map((type) => (
              <label
                key={type}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name="propertyType"
                  value={type}
                  checked={formData.sellerQuestions!.propertyType === type}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      sellerQuestions: { ...prev.sellerQuestions!, propertyType: e.target.value },
                    }));
                    clearError('propertyType');
                  }}
                  className="w-4 h-4 text-primary-400 focus:ring-primary-400"
                />
                <span className="text-gray-900">{type}</span>
              </label>
            ))}
          </div>
          {errors.propertyType && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.propertyType}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.sellerQuestions!.city || citySearch}
              onChange={(e) => {
                setCitySearch(e.target.value);
                setShowCityDropdown(true);
                if (!e.target.value) {
                  setFormData((prev) => ({
                    ...prev,
                    sellerQuestions: { ...prev.sellerQuestions!, city: '' },
                  }));
                }
              }}
              onFocus={() => setShowCityDropdown(true)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 ${
                errors.city ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Search for city..."
            />
            {showCityDropdown && filteredCities.length > 0 && !formData.sellerQuestions!.city && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredCities.slice(0, 10).map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        sellerQuestions: { ...prev.sellerQuestions!, city },
                      }));
                      setCitySearch('');
                      setShowCityDropdown(false);
                      clearError('city');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
          {formData.sellerQuestions!.city && (
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                {formData.sellerQuestions!.city}
                <button
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      sellerQuestions: { ...prev.sellerQuestions!, city: '' },
                    }));
                    setCitySearch('');
                  }}
                  className="hover:bg-primary-100 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}
          {errors.city && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.city}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Major Intersection or Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.sellerQuestions!.intersectionOrAddress}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                sellerQuestions: { ...prev.sellerQuestions!, intersectionOrAddress: e.target.value },
              }));
              if (e.target.value.trim()) {
                clearError('intersectionOrAddress');
              }
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 ${
              errors.intersectionOrAddress ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Yonge St & Bloor St or 123 Main Street"
          />
          <p className="text-xs text-gray-500 mt-1">
            We want to be respectful of your privacy. We are asking for this information because this helps agents prepare well for their first conversation with you.
          </p>
          {errors.intersectionOrAddress && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.intersectionOrAddress}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Price Expectation <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {PRICE_EXPECTATION_RANGES.map((range) => (
              <label
                key={range}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name="priceExpectationRange"
                  value={range}
                  checked={formData.sellerQuestions!.priceExpectationRange === range}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      sellerQuestions: {
                        ...prev.sellerQuestions!,
                        priceExpectationRange: e.target.value,
                      },
                    }));
                    clearError('priceExpectationRange');
                  }}
                  className="w-4 h-4 text-primary-400 focus:ring-primary-400"
                />
                <span className="text-gray-900">{range}</span>
              </label>
            ))}
          </div>
          {errors.priceExpectationRange && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.priceExpectationRange}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selling Timeline <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.sellerQuestions!.sellingTimeline}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                sellerQuestions: { ...prev.sellerQuestions!, sellingTimeline: e.target.value },
              }));
              if (e.target.value) {
                clearError('sellingTimeline');
              }
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 ${
              errors.sellingTimeline ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select timeline</option>
            <option value="At the earliest possible">At the earliest possible</option>
            <option value="Anytime in the next 6 months">Anytime in the next 6 months</option>
            <option value="Sometime in the next 6-10 months">Sometime in the next 6-10 months</option>
            <option value="Unsure at the moment">Unsure at the moment</option>
          </select>
          {errors.sellingTimeline && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.sellingTimeline}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Selling <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.sellerQuestions!.sellingReason}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                sellerQuestions: { ...prev.sellerQuestions!, sellingReason: e.target.value },
              }));
              if (e.target.value) {
                clearError('sellingReason');
              }
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 ${
              errors.sellingReason ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select reason</option>
            <option value="upsizing">Upsizing</option>
            <option value="downsizing">Downsizing</option>
            <option value="relocation">Relocation</option>
            <option value="investment">Investment property</option>
            <option value="other">Other</option>
          </select>
          {errors.sellingReason && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.sellingReason}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Condition <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.sellerQuestions!.propertyCondition}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                sellerQuestions: { ...prev.sellerQuestions!, propertyCondition: e.target.value },
              }));
              if (e.target.value) {
                clearError('propertyCondition');
              }
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 ${
              errors.propertyCondition ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select condition</option>
            <option value="excellent">Excellent - Move-in ready</option>
            <option value="good">Good - Minor updates needed</option>
            <option value="fair">Fair - Some renovations needed</option>
            <option value="needs-work">Needs significant work</option>
          </select>
          {errors.propertyCondition && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.propertyCondition}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Notes (Optional)
          </label>
          <textarea
            value={formData.sellerQuestions!.propertyNotes}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                sellerQuestions: { ...prev.sellerQuestions!, propertyNotes: e.target.value },
              }))
            }
            maxLength={500}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 resize-none"
            placeholder="Any additional details about your property..."
          />
          <div className="text-xs text-gray-500 text-right mt-1">
            {formData.sellerQuestions!.propertyNotes?.length || 0} / 500
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-3 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors font-medium flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function Step3CCombinedQuestions({ formData, setFormData, errors, setErrors, onNext, onBack }: StepProps) {
  const [buyerCitySearch, setBuyerCitySearch] = useState('');
  const [showBuyerCityDropdown, setShowBuyerCityDropdown] = useState(false);
  const [sellerCitySearch, setSellerCitySearch] = useState('');
  const [showSellerCityDropdown, setShowSellerCityDropdown] = useState(false);

  const clearError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const filteredBuyerCities = ONTARIO_CITIES.filter(
    (city) =>
      city.toLowerCase().includes(buyerCitySearch.toLowerCase()) &&
      !formData.buyerQuestions!.preferredCities.includes(city)
  );

  const filteredSellerCities = ONTARIO_CITIES.filter((city) =>
    city.toLowerCase().includes(sellerCitySearch.toLowerCase())
  );

  const addBuyerCity = (city: string) => {
    if (formData.buyerQuestions!.preferredCities.length < 3) {
      setFormData((prev) => ({
        ...prev,
        buyerQuestions: {
          ...prev.buyerQuestions!,
          preferredCities: [...prev.buyerQuestions!.preferredCities, city],
        },
      }));
      setBuyerCitySearch('');
      setShowBuyerCityDropdown(false);
    }
  };

  const removeBuyerCity = (city: string) => {
    setFormData((prev) => ({
      ...prev,
      buyerQuestions: {
        ...prev.buyerQuestions!,
        preferredCities: prev.buyerQuestions!.preferredCities.filter((c) => c !== city),
      },
    }));
  };

  const togglePropertyType = (type: string) => {
    const current = formData.buyerQuestions!.propertyTypes;
    setFormData((prev) => ({
      ...prev,
      buyerQuestions: {
        ...prev.buyerQuestions!,
        propertyTypes: current.includes(type)
          ? current.filter((t) => t !== type)
          : [...current, type],
      },
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your home journey</h2>
      <p className="text-gray-600 mb-6">Since you're selling and buying, we need details about both.</p>

      <div className="space-y-8">
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Buying Information</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Cities <span className="text-red-500">*</span>
                <span className="text-gray-500 font-normal ml-2">(Select up to 3)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={buyerCitySearch}
                  onChange={(e) => {
                    setBuyerCitySearch(e.target.value);
                    setShowBuyerCityDropdown(true);
                  }}
                  onFocus={() => setShowBuyerCityDropdown(true)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 ${
                    errors.preferredCities ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Search for cities..."
                  disabled={formData.buyerQuestions!.preferredCities.length >= 3}
                />
                {showBuyerCityDropdown && filteredBuyerCities.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredBuyerCities.slice(0, 10).map((city) => (
                      <button
                        key={city}
                        onClick={() => addBuyerCity(city)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.buyerQuestions!.preferredCities.map((city) => (
                  <span
                    key={city}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                  >
                    {city}
                    <button
                      onClick={() => removeBuyerCity(city)}
                      className="hover:bg-primary-100 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              {errors.preferredCities && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.preferredCities}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Budget Range <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {BUDGET_RANGES.map((range) => (
                  <label
                    key={range}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="budgetRange"
                      value={range}
                      checked={formData.buyerQuestions!.budgetRange === range}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          buyerQuestions: {
                            ...prev.buyerQuestions!,
                            budgetRange: e.target.value,
                          },
                        }))
                      }
                      className="w-4 h-4 text-primary-400 focus:ring-primary-400"
                    />
                    <span className="text-gray-900 text-sm">{range}</span>
                  </label>
                ))}
              </div>
              {errors.budgetRange && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.budgetRange}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Property Types <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {PROPERTY_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => togglePropertyType(type)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all font-medium text-sm ${
                      formData.buyerQuestions!.propertyTypes.includes(type)
                        ? 'border-primary-400 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-700 hover:border-primary-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {errors.propertyTypes && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.propertyTypes}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeline <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.buyerQuestions!.timeline}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    buyerQuestions: { ...prev.buyerQuestions!, timeline: e.target.value },
                  }))
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 ${
                  errors.timeline ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select timeline</option>
                <option value="Ready to buy in next 3 months">Ready to buy in next 3 months</option>
                <option value="Anytime in next 6 months">Anytime in next 6 months</option>
                <option value="Some time in next 6-12 months">Some time in next 6-12 months</option>
                <option value="Unsure at the moment or in next 1-2 years">Unsure at the moment or in next 1-2 years</option>
              </select>
              {errors.timeline && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.timeline}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Mortgage Pre-Approval Status <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {[
                  { value: 'yes', label: 'Yes, I have pre-approval' },
                  { value: 'in_progress', label: 'In progress' },
                  { value: 'no', label: 'Yet to apply' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="preApproval"
                      value={option.value}
                      checked={formData.buyerQuestions!.preApprovalStatus === option.value}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          buyerQuestions: {
                            ...prev.buyerQuestions!,
                            preApprovalStatus: e.target.value as any,
                          },
                        }))
                      }
                      className="w-4 h-4 text-primary-400 focus:ring-primary-400"
                    />
                    <span className="text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.preApprovalStatus && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.preApprovalStatus}
                </p>
              )}

              {formData.buyerQuestions!.preApprovalStatus === 'yes' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approved Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.buyerQuestions!.mortgageApprovedAmount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        buyerQuestions: {
                          ...prev.buyerQuestions!,
                          mortgageApprovedAmount: e.target.value,
                        },
                      }))
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 ${
                      errors.mortgageApprovedAmount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., $1,200,000"
                  />
                  {errors.mortgageApprovedAmount && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.mortgageApprovedAmount}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Primary Residence <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      buyerQuestions: { ...prev.buyerQuestions!, isPrimaryResidence: true },
                    }))
                  }
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    formData.buyerQuestions!.isPrimaryResidence === true
                      ? 'bg-primary-400 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      buyerQuestions: { ...prev.buyerQuestions!, isPrimaryResidence: false },
                    }))
                  }
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    formData.buyerQuestions!.isPrimaryResidence === false
                      ? 'bg-primary-400 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  No
                </button>
              </div>
              {errors.isPrimaryResidence && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.isPrimaryResidence}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Selling Information</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Property Type <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {PROPERTY_TYPES.concat(['Other']).map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="sellerPropertyType"
                      value={type}
                      checked={formData.sellerQuestions!.propertyType === type}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          sellerQuestions: { ...prev.sellerQuestions!, propertyType: e.target.value },
                        }))
                      }
                      className="w-4 h-4 text-primary-400 focus:ring-primary-400"
                    />
                    <span className="text-gray-900">{type}</span>
                  </label>
                ))}
              </div>
              {errors.propertyType && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.propertyType}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.sellerQuestions!.city || sellerCitySearch}
                  onChange={(e) => {
                    setSellerCitySearch(e.target.value);
                    setShowSellerCityDropdown(true);
                    if (!e.target.value) {
                      setFormData((prev) => ({
                        ...prev,
                        sellerQuestions: { ...prev.sellerQuestions!, city: '' },
                      }));
                    }
                  }}
                  onFocus={() => setShowSellerCityDropdown(true)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Search for city..."
                />
                {showSellerCityDropdown && filteredSellerCities.length > 0 && !formData.sellerQuestions!.city && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredSellerCities.slice(0, 10).map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            sellerQuestions: { ...prev.sellerQuestions!, city },
                          }));
                          setSellerCitySearch('');
                          setShowSellerCityDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {formData.sellerQuestions!.city && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                    {formData.sellerQuestions!.city}
                    <button
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          sellerQuestions: { ...prev.sellerQuestions!, city: '' },
                        }));
                        setSellerCitySearch('');
                      }}
                      className="hover:bg-primary-100 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                </div>
              )}
              {errors.city && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.city}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Major Intersection or Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.sellerQuestions!.intersectionOrAddress}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sellerQuestions: { ...prev.sellerQuestions!, intersectionOrAddress: e.target.value },
                  }))
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 ${
                  errors.intersectionOrAddress ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Yonge St & Bloor St or 123 Main Street"
              />
              <p className="text-xs text-gray-500 mt-1">
                We want to be respectful of your privacy. We are asking for this information because this helps agents prepare well for their first conversation with you.
              </p>
              {errors.intersectionOrAddress && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.intersectionOrAddress}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Price Expectation <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {PRICE_EXPECTATION_RANGES.map((range) => (
                  <label
                    key={range}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="priceExpectationRange"
                      value={range}
                      checked={formData.sellerQuestions!.priceExpectationRange === range}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          sellerQuestions: {
                            ...prev.sellerQuestions!,
                            priceExpectationRange: e.target.value,
                          },
                        }))
                      }
                      className="w-4 h-4 text-primary-400 focus:ring-primary-400"
                    />
                    <span className="text-gray-900 text-sm">{range}</span>
                  </label>
                ))}
              </div>
              {errors.priceExpectationRange && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.priceExpectationRange}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selling Timeline <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.sellerQuestions!.sellingTimeline}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sellerQuestions: { ...prev.sellerQuestions!, sellingTimeline: e.target.value },
                  }))
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 ${
                  errors.sellingTimeline ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select timeline</option>
                <option value="At the earliest possible">At the earliest possible</option>
                <option value="Anytime in the next 6 months">Anytime in the next 6 months</option>
                <option value="Sometime in the next 6-10 months">Sometime in the next 6-10 months</option>
                <option value="Unsure at the moment">Unsure at the moment</option>
              </select>
              {errors.sellingTimeline && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.sellingTimeline}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Selling <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.sellerQuestions!.sellingReason}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sellerQuestions: { ...prev.sellerQuestions!, sellingReason: e.target.value },
                  }))
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 ${
                  errors.sellingReason ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select reason</option>
                <option value="upsizing">Upsizing</option>
                <option value="downsizing">Downsizing</option>
                <option value="relocation">Relocation</option>
                <option value="investment">Investment property</option>
                <option value="other">Other</option>
              </select>
              {errors.sellingReason && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.sellingReason}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Condition <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.sellerQuestions!.propertyCondition}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sellerQuestions: { ...prev.sellerQuestions!, propertyCondition: e.target.value },
                  }))
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 ${
                  errors.propertyCondition ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select condition</option>
                <option value="excellent">Excellent - Move-in ready</option>
                <option value="good">Good - Minor updates needed</option>
                <option value="fair">Fair - Some renovations needed</option>
                <option value="needs-work">Needs significant work</option>
              </select>
              {errors.propertyCondition && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.propertyCondition}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-3 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors font-medium flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

interface Step4Props extends StepProps {
  onSubmit: () => void;
  goToStep: (step: number) => void;
}

function Step4Review({ formData, setFormData, errors, setErrors, onSubmit, onBack, goToStep }: Step4Props) {
  const clearError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Review your information</h2>
      <p className="text-gray-600 mb-6">Please review your details before submitting.</p>

      <div className="space-y-6">
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Contact Information</h3>
            <button
              onClick={() => goToStep(1)}
              className="text-primary-400 hover:text-primary-500 transition-colors flex items-center gap-1 text-sm"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>{' '}
              <span className="text-gray-900 font-medium">
                {formData.aboutYou.firstName} {formData.aboutYou.lastName}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>{' '}
              <span className="text-gray-900 font-medium">{formData.aboutYou.email}</span>
            </div>
            <div>
              <span className="text-gray-600">Phone:</span>{' '}
              <span className="text-gray-900 font-medium">{formData.aboutYou.phone}</span>
            </div>
            {formData.aboutYou.hasReferral && (
              <div>
                <span className="text-gray-600">Referral Code:</span>{' '}
                <span className="text-gray-900 font-medium">{formData.aboutYou.referralCode}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Property Intent</h3>
            <button
              onClick={() => goToStep(2)}
              className="text-primary-400 hover:text-primary-500 transition-colors flex items-center gap-1 text-sm"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
          <div className="text-sm">
            <span className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded-full font-medium">
              {formData.propertyIntent === 'buy-first' && 'Buy my first home'}
              {formData.propertyIntent === 'buy-another' && 'Buy another home'}
              {formData.propertyIntent === 'sell-current' && 'Sell my current home'}
              {formData.propertyIntent === 'sell-and-buy' && 'Sell my current home to buy another home'}
            </span>
          </div>
        </div>

        {(formData.propertyIntent === 'buy-first' || formData.propertyIntent === 'buy-another' || formData.propertyIntent === 'sell-and-buy') && formData.buyerQuestions && (
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Buyer Requirements</h3>
              <button
                onClick={() => goToStep(3)}
                className="text-primary-400 hover:text-primary-500 transition-colors flex items-center gap-1 text-sm"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Cities:</span>{' '}
                <span className="text-gray-900 font-medium">
                  {formData.buyerQuestions.preferredCities.join(', ')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Budget Range:</span>{' '}
                <span className="text-gray-900 font-medium">
                  {formData.buyerQuestions.budgetRange}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Property Types:</span>{' '}
                <span className="text-gray-900 font-medium">
                  {formData.buyerQuestions.propertyTypes.join(', ')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Timeline:</span>{' '}
                <span className="text-gray-900 font-medium">{formData.buyerQuestions.timeline}</span>
              </div>
              <div>
                <span className="text-gray-600">Pre-Approval:</span>{' '}
                <span className="text-gray-900 font-medium">
                  {formData.buyerQuestions.preApprovalStatus === 'yes'
                    ? 'Yes'
                    : formData.buyerQuestions.preApprovalStatus === 'in_progress'
                    ? 'In Progress'
                    : 'No'}
                </span>
              </div>
              {formData.buyerQuestions.mortgageApprovedAmount && (
                <div>
                  <span className="text-gray-600">Approved Amount:</span>{' '}
                  <span className="text-gray-900 font-medium">{formData.buyerQuestions.mortgageApprovedAmount}</span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Primary Residence:</span>{' '}
                <span className="text-gray-900 font-medium">
                  {formData.buyerQuestions.isPrimaryResidence ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        )}

        {(formData.propertyIntent === 'sell-current' || formData.propertyIntent === 'sell-and-buy') && formData.sellerQuestions && (
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Property Details</h3>
              <button
                onClick={() => goToStep(3)}
                className="text-primary-400 hover:text-primary-500 transition-colors flex items-center gap-1 text-sm"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Type:</span>{' '}
                <span className="text-gray-900 font-medium">{formData.sellerQuestions.propertyType}</span>
              </div>
              <div>
                <span className="text-gray-600">City:</span>{' '}
                <span className="text-gray-900 font-medium">
                  {formData.sellerQuestions.city}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Intersection/Address:</span>{' '}
                <span className="text-gray-900 font-medium">
                  {formData.sellerQuestions.intersectionOrAddress}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Price Expectation:</span>{' '}
                <span className="text-gray-900 font-medium">
                  {formData.sellerQuestions.priceExpectationRange}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Timeline:</span>{' '}
                <span className="text-gray-900 font-medium">
                  {formData.sellerQuestions.sellingTimeline}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Condition:</span>{' '}
                <span className="text-gray-900 font-medium">
                  {formData.sellerQuestions.propertyCondition}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border-2 border-primary-100 bg-primary-50 rounded-lg">
          <h3 className="font-bold text-gray-900 mb-4">General Questions & Consent</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Already signed contract with agent? <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-600 mb-3">
                Real estate agents mostly get an agreement signed by their client to work with them, a Buyers Representation Agreement for buying a home and a Listing Agreement for selling a home.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      consent: { ...prev.consent, hasCurrentAgent: true },
                    }))
                  }
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    formData.consent.hasCurrentAgent === true
                      ? 'bg-primary-400 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      consent: { ...prev.consent, hasCurrentAgent: false },
                    }))
                  }
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    formData.consent.hasCurrentAgent === false
                      ? 'bg-primary-400 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Contact Preference <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {[
                  { value: 'call', label: 'Call' },
                  { value: 'whatsapp', label: 'WhatsApp/Text SMS' },
                  { value: 'email', label: 'Email' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="contactPreference"
                      value={option.value}
                      checked={formData.consent.contactPreference === option.value}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          consent: { ...prev.consent, contactPreference: e.target.value as any },
                        }));
                        clearError('contactPreference');
                      }}
                      className="w-4 h-4 text-primary-400 focus:ring-primary-400"
                    />
                    <span className="text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.contactPreference && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.contactPreference}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Anything else we need to know?
              </label>
              <p className="text-xs text-gray-600 mb-2">
                That can help us find you the best options on the real estate services.
              </p>
              <textarea
                value={formData.consent.additionalNotes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    consent: { ...prev.consent, additionalNotes: e.target.value },
                  }))
                }
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 resize-none"
                placeholder="Any additional information you'd like to share..."
              />
              <div className="text-xs text-gray-500 text-right mt-1">
                {formData.consent.additionalNotes?.length || 0} / 500
              </div>
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.consent.communicationConsent}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      consent: { ...prev.consent, communicationConsent: e.target.checked },
                    }));
                    if (e.target.checked) {
                      clearError('communicationConsent');
                    }
                  }}
                  className="w-5 h-5 text-primary-400 focus:ring-primary-400 mt-0.5"
                />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    Communication Consent <span className="text-red-500">*</span>
                  </div>
                  <div className="text-gray-600">
                    We promise we won't spam your inbox. We will make the agent introductions over email and occasionally get in touch with you over the phone, text, email, or WhatsApp to check in or follow up. Your information will not be shared with anyone else. Please report to us if anyone else contacts you with our name.
                  </div>
                </div>
              </label>
              {errors.communicationConsent && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.communicationConsent}
                </p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="bg-white rounded-lg p-4 mb-4">
                <h4 className="font-bold text-gray-900 mb-3">Terms and Conditions</h4>
                <div className="space-y-2 text-xs text-gray-700">
                  <div className="flex gap-2">
                    <span className="font-medium">1.</span>
                    <span>You understand and agree that the information you have provided is true and correct.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium">2.</span>
                    <span>You understand and agree that you will be introduced initially to three agents only who are interested in offering their real estate services to you. You can request more agents at any time.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium">3.</span>
                    <span>You understand and agree that the real estate agents suggested by Hausee don't represent Hausee, they represent the respective brokerage they are associated with.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium">4.</span>
                    <span>You understand and agree that the real estate agents introduced by Hausee to you are only agent suggestions by Hausee, not agent referrals by Hausee.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium">5.</span>
                    <span>You understand and agree that the decision you make on the real estate agent to work with is solely yours and yours only and Hausee can't be held responsible for any losses or damages.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium">6.</span>
                    <span>You understand and agree that you will respond to the real estate agent's first communication to you through your preferred channel within 24 hrs or the earliest possible.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium">7.</span>
                    <span>You understand and agree that you can be released anytime from the representation agreement for home buying and selling if you are dissatisfied with their services but it is contingent on the mutual agreement among you, the client, the real estate agent, and the representing brokerage.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium">8.</span>
                    <span>You understand and agree to provide updates on the progress of your home buying or selling journey with the real estate agent suggested by Hausee.</span>
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.consent.termsAccepted}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      consent: { ...prev.consent, termsAccepted: e.target.checked },
                    }));
                    if (e.target.checked) {
                      clearError('termsAccepted');
                    }
                  }}
                  className="w-5 h-5 text-primary-400 focus:ring-primary-400 mt-0.5"
                />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    I accept all terms <span className="text-red-500">*</span>
                  </div>
                  <div className="text-gray-600">
                    By checking this box, you agree to all the terms and conditions listed above.
                  </div>
                </div>
              </label>
              {errors.termsAccepted && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.termsAccepted}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={onSubmit}
          className="px-8 py-3 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors font-medium flex items-center gap-2"
        >
          Submit Request
          <CheckCircle2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

interface Step5Props {
  onComplete: () => void;
}

function Step5Confirmation({ onComplete }: Step5Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-12 h-12 text-green-600" />
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-4">Request Submitted!</h2>
      <p className="text-gray-600 text-lg mb-4">
        Thank you for submitting your agent matching request. We're working on finding the perfect agent for
        you.
      </p>
      <p className="text-gray-600 mb-8">
        This is completely <span className="font-semibold text-primary-400">no obligation</span> - you're free to explore your options without any commitment.
      </p>

      <div className="max-w-lg mx-auto text-left bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="font-bold text-gray-900 mb-4">What happens next?</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <div className="font-medium text-gray-900">Review (24-48 hours)</div>
              <div className="text-sm text-gray-600">
                Our team reviews your requirements and searches for suitable agents
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <div className="font-medium text-gray-900">Agent Match</div>
              <div className="text-sm text-gray-600">
                You'll be introduced to 3 agents initially, with the option to request more at any time
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <div className="font-medium text-gray-900">Initial Contact</div>
              <div className="text-sm text-gray-600">
                Agents will reach out to introduce themselves and discuss your needs
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div>
              <div className="font-medium text-gray-900">Choose Your Agent</div>
              <div className="text-sm text-gray-600">
                Interview agents and select the one that's the best fit
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onComplete}
          className="px-8 py-3 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors font-medium"
        >
          Return to Dashboard
        </button>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-200 text-sm text-gray-600">
        <p>
          Questions? Contact us at{' '}
          <a href="mailto:support@hausee.ca" className="text-primary-400 hover:text-primary-500">
            support@hausee.ca
          </a>
        </p>
      </div>
    </div>
  );
}
