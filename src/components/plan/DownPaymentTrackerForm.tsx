import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Info, PartyPopper } from 'lucide-react';
import {
  DownPaymentTrackerData,
  DownPaymentGoal,
  SavingsAccount,
  DownPaymentCalculations,
} from '../../types';
import { saveDownPaymentTracker, loadDownPaymentTracker } from '../../lib/supabaseClient';

const TEMP_USER_ID = 'temp-user-demo';

const createEmptyGoal = (): DownPaymentGoal => ({
  targetPrice: 0,
  downPaymentPercentage: 20,
  targetDownPayment: 0,
  minimumDownPayment: 0,
  targetDate: '',
  monthsRemaining: 0,
});

const createDefaultAccounts = (): SavingsAccount[] => [
  {
    id: crypto.randomUUID(),
    name: 'FHSA',
    type: 'fhsa',
    currentBalance: 0,
    allocationPercentage: 100,
    monthlyContribution: 0,
    yearlyLimit: 8000,
    notes: '',
  },
  {
    id: crypto.randomUUID(),
    name: 'RRSP HBP',
    type: 'rrsp-hbp',
    currentBalance: 0,
    allocationPercentage: 0,
    monthlyContribution: 0,
    withdrawalLimit: 35000,
    notes: '',
  },
];

const INITIAL_STATE: DownPaymentTrackerData = {
  goal: createEmptyGoal(),
  accounts: createDefaultAccounts(),
  contributions: [],
  calculations: {
    totalSaved: 0,
    progressPercentage: 0,
    remainingAmount: 0,
    monthlyTargetSavings: 0,
    onTrack: true,
    estimatedCompletionDate: '',
  },
  milestones: {
    reached25: false,
    reached50: false,
    reached75: false,
    reached100: false,
  },
  updatedAt: new Date().toISOString(),
};

export default function DownPaymentTrackerForm() {
  const userId = TEMP_USER_ID;
  const [tracker, setTracker] = useState<DownPaymentTrackerData>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const localData = localStorage.getItem(`hausee_downpayment_${userId}`);
      const { data: dbData } = await loadDownPaymentTracker(userId);

      if (dbData) {
        setTracker(dbData);
      } else if (localData) {
        const parsed = JSON.parse(localData);
        setTracker(parsed);
      }
    } catch (err) {
      console.error('Error loading down payment tracker:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMinimumDownPayment = (price: number): number => {
    if (price <= 500000) {
      return price * 0.05;
    } else if (price <= 1000000) {
      return 25000 + (price - 500000) * 0.1;
    } else {
      return price * 0.2;
    }
  };

  const calculateDownPayment = (
    goal: DownPaymentGoal,
    accounts: SavingsAccount[]
  ): DownPaymentCalculations => {
    const totalSaved = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
    const targetAmount = goal.targetDownPayment || goal.minimumDownPayment;
    const progressPercentage = targetAmount > 0 ? (totalSaved / targetAmount) * 100 : 0;
    const remainingAmount = Math.max(0, targetAmount - totalSaved);

    const today = new Date();
    const targetDate = goal.targetDate ? new Date(goal.targetDate) : null;
    const monthsRemaining = targetDate
      ? Math.max(
          0,
          (targetDate.getFullYear() - today.getFullYear()) * 12 +
            (targetDate.getMonth() - today.getMonth())
        )
      : 0;

    const monthlyTargetSavings = monthsRemaining > 0 ? remainingAmount / monthsRemaining : 0;

    const totalMonthlyContributions = accounts.reduce(
      (sum, acc) => sum + acc.monthlyContribution,
      0
    );
    const onTrack = totalMonthlyContributions >= monthlyTargetSavings;

    const estimatedMonths = totalMonthlyContributions > 0
      ? Math.ceil(remainingAmount / totalMonthlyContributions)
      : 0;
    const estimatedDate = new Date();
    estimatedDate.setMonth(estimatedDate.getMonth() + estimatedMonths);
    const estimatedCompletionDate = estimatedDate.toISOString().split('T')[0];

    return {
      totalSaved,
      progressPercentage: Math.min(100, progressPercentage),
      remainingAmount,
      monthlyTargetSavings,
      onTrack,
      estimatedCompletionDate,
    };
  };

  const checkMilestones = (
    currentProgress: number,
    previousMilestones: DownPaymentTrackerData['milestones']
  ): DownPaymentTrackerData['milestones'] => {
    const newMilestones = { ...previousMilestones };
    let celebrationMessage = '';

    if (currentProgress >= 25 && !previousMilestones.reached25) {
      newMilestones.reached25 = true;
      celebrationMessage = '25% of your down payment saved!';
    } else if (currentProgress >= 50 && !previousMilestones.reached50) {
      newMilestones.reached50 = true;
      celebrationMessage = 'Halfway there! 50% saved!';
    } else if (currentProgress >= 75 && !previousMilestones.reached75) {
      newMilestones.reached75 = true;
      celebrationMessage = '75% saved! Almost there!';
    } else if (currentProgress >= 100 && !previousMilestones.reached100) {
      newMilestones.reached100 = true;
      celebrationMessage = 'Goal reached! 100% saved!';
    }

    if (celebrationMessage) {
      setToastMessage(celebrationMessage);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    }

    return newMilestones;
  };

  const debouncedSave = useCallback(
    (data: DownPaymentTrackerData) => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      const timeout = setTimeout(async () => {
        const updatedData = { ...data, updatedAt: new Date().toISOString() };

        localStorage.setItem(`hausee_downpayment_${userId}`, JSON.stringify(updatedData));

        const result = await saveDownPaymentTracker(userId, updatedData);

        if (!result.success) {
          console.error('Failed to save down payment tracker');
        }
      }, 1000);

      setSaveTimeout(timeout);
    },
    [saveTimeout, userId]
  );

  const handleGoalChange = (field: keyof DownPaymentGoal, value: string | number) => {
    const newGoal = { ...tracker.goal, [field]: value };

    if (field === 'targetPrice' || field === 'downPaymentPercentage') {
      const price = field === 'targetPrice' ? Number(value) : newGoal.targetPrice;
      const percentage =
        field === 'downPaymentPercentage' ? Number(value) : newGoal.downPaymentPercentage;

      newGoal.minimumDownPayment = calculateMinimumDownPayment(price);
      newGoal.targetDownPayment = price * (percentage / 100);
    }

    if (field === 'targetDate') {
      const today = new Date();
      const targetDate = new Date(value as string);
      newGoal.monthsRemaining = Math.max(
        0,
        (targetDate.getFullYear() - today.getFullYear()) * 12 +
          (targetDate.getMonth() - today.getMonth())
      );
    }

    const newCalculations = calculateDownPayment(newGoal, tracker.accounts);
    const newMilestones = checkMilestones(newCalculations.progressPercentage, tracker.milestones);

    const updatedTracker: DownPaymentTrackerData = {
      ...tracker,
      goal: newGoal,
      calculations: newCalculations,
      milestones: newMilestones,
    };

    setTracker(updatedTracker);
    debouncedSave(updatedTracker);
  };

  const handleAccountChange = (accountId: string, field: keyof SavingsAccount, value: unknown) => {
    const newAccounts = tracker.accounts.map((acc) =>
      acc.id === accountId ? { ...acc, [field]: value } : acc
    );

    const newCalculations = calculateDownPayment(tracker.goal, newAccounts);
    const newMilestones = checkMilestones(newCalculations.progressPercentage, tracker.milestones);

    const updatedTracker: DownPaymentTrackerData = {
      ...tracker,
      accounts: newAccounts,
      calculations: newCalculations,
      milestones: newMilestones,
    };

    setTracker(updatedTracker);
    debouncedSave(updatedTracker);
  };

  const addAccount = () => {
    const newAccount: SavingsAccount = {
      id: crypto.randomUUID(),
      name: 'New Account',
      type: 'custom',
      currentBalance: 0,
      allocationPercentage: 0,
      monthlyContribution: 0,
      notes: '',
    };

    const updatedTracker: DownPaymentTrackerData = {
      ...tracker,
      accounts: [...tracker.accounts, newAccount],
    };

    setTracker(updatedTracker);
    debouncedSave(updatedTracker);
  };

  const removeAccount = (accountId: string) => {
    const newAccounts = tracker.accounts.filter((acc) => acc.id !== accountId);
    const newCalculations = calculateDownPayment(tracker.goal, newAccounts);

    const updatedTracker: DownPaymentTrackerData = {
      ...tracker,
      accounts: newAccounts,
      calculations: newCalculations,
    };

    setTracker(updatedTracker);
    debouncedSave(updatedTracker);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading down payment tracker...</div>
      </div>
    );
  }

  const { goal, accounts, calculations } = tracker;
  const hasGoal = goal.targetPrice > 0;

  return (
    <div className="max-w-5xl mx-auto">
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
            <PartyPopper className="w-6 h-6" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Down Payment Tracker</h1>
          <p className="text-gray-600">Track your progress toward homeownership</p>
        </div>

        {!hasGoal && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Get Started</h3>
            <p className="text-blue-800 text-sm">
              Set your home buying goal below to start tracking your down payment progress. We'll
              help you calculate minimum requirements based on Canadian mortgage rules and track
              your savings across multiple accounts.
            </p>
          </div>
        )}

        <GoalSettingSection
          goal={goal}
          onChange={handleGoalChange}
          formatCurrency={formatCurrency}
        />

        {hasGoal && (
          <>
            <ProgressSection calculations={calculations} formatCurrency={formatCurrency} />

            <SavingsAccountsSection
              accounts={accounts}
              calculations={calculations}
              onAccountChange={handleAccountChange}
              onAddAccount={addAccount}
              onRemoveAccount={removeAccount}
              formatCurrency={formatCurrency}
            />
          </>
        )}
      </div>
    </div>
  );
}

interface GoalSettingSectionProps {
  goal: DownPaymentGoal;
  onChange: (field: keyof DownPaymentGoal, value: string | number) => void;
  formatCurrency: (value: number) => string;
}

function GoalSettingSection({ goal, onChange, formatCurrency }: GoalSettingSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Goal</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Home Price
          </label>
          <input
            type="number"
            value={goal.targetPrice || ''}
            onChange={(e) => onChange('targetPrice', parseFloat(e.target.value) || 0)}
            className="w-full h-12 px-4 border border-gray-300 rounded-md focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-colors"
            placeholder="$500,000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            Down Payment %
            <Tooltip content="Minimum: 5% for homes under $500K, 10% for $500K-$1M, 20% for over $1M" />
          </label>
          <input
            type="number"
            value={goal.downPaymentPercentage || ''}
            onChange={(e) => onChange('downPaymentPercentage', parseFloat(e.target.value) || 0)}
            className="w-full h-12 px-4 border border-gray-300 rounded-md focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-colors"
            placeholder="20"
            min="5"
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
          <input
            type="date"
            value={goal.targetDate}
            onChange={(e) => onChange('targetDate', e.target.value)}
            className="w-full h-12 px-4 border border-gray-300 rounded-md focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-colors"
          />
        </div>

        <div className="flex flex-col justify-end">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Minimum Required</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(goal.minimumDownPayment)}
            </p>
          </div>
        </div>
      </div>

      {goal.targetPrice > 0 && (
        <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Your Target:</span>{' '}
            {formatCurrency(goal.targetDownPayment)} ({goal.downPaymentPercentage}% of{' '}
            {formatCurrency(goal.targetPrice)})
          </p>
          {goal.monthsRemaining > 0 && (
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-semibold">Timeline:</span> {goal.monthsRemaining} months
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface ProgressSectionProps {
  calculations: DownPaymentCalculations;
  formatCurrency: (value: number) => string;
}

function ProgressSection({ calculations, formatCurrency }: ProgressSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress</h2>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Your Progress</span>
          <span className="text-2xl font-bold text-primary-400">
            {calculations.progressPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-400 transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, calculations.progressPercentage)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-primary-50 rounded-lg p-4">
          <p className="text-xs text-primary-800 font-medium mb-1">Total Saved</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(calculations.totalSaved)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 font-medium mb-1">Remaining</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(calculations.remainingAmount)}
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs text-blue-800 font-medium mb-1">Monthly Target</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(calculations.monthlyTargetSavings)}
          </p>
        </div>
      </div>

      {calculations.estimatedCompletionDate && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Estimated Completion:</span>{' '}
            {new Date(calculations.estimatedCompletionDate).toLocaleDateString('en-CA', {
              year: 'numeric',
              month: 'long',
            })}
          </p>
          {!calculations.onTrack && (
            <p className="text-sm text-orange-600 mt-1">
              Increase your monthly contributions to reach your goal on time.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface SavingsAccountsSectionProps {
  accounts: SavingsAccount[];
  calculations: DownPaymentCalculations;
  onAccountChange: (accountId: string, field: keyof SavingsAccount, value: unknown) => void;
  onAddAccount: () => void;
  onRemoveAccount: (accountId: string) => void;
  formatCurrency: (value: number) => string;
}

function SavingsAccountsSection({
  accounts,
  onAccountChange,
  onAddAccount,
  onRemoveAccount,
  formatCurrency,
}: SavingsAccountsSectionProps) {
  const accountTypeLabels = {
    fhsa: 'FHSA',
    'rrsp-hbp': 'RRSP HBP',
    tfsa: 'TFSA',
    savings: 'Savings',
    investments: 'Investments',
    custom: 'Custom',
  };

  const accountTypeTooltips = {
    fhsa: 'First Home Savings Account: $8,000/year contribution limit',
    'rrsp-hbp': 'RRSP Home Buyers Plan: $35,000 withdrawal limit for first-time buyers',
    tfsa: 'Tax-Free Savings Account: Tax-free growth',
    savings: 'Regular savings account',
    investments: 'Investment account',
    custom: 'Custom account type',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Savings Accounts</h2>
        <button
          onClick={onAddAccount}
          className="flex items-center gap-2 px-4 py-2 bg-primary-400 text-white rounded-md hover:bg-primary-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-medium text-gray-500 pb-3 px-2">Account</th>
              <th className="text-left text-xs font-medium text-gray-500 pb-3 px-2">Type</th>
              <th className="text-right text-xs font-medium text-gray-500 pb-3 px-2">Balance</th>
              <th className="text-right text-xs font-medium text-gray-500 pb-3 px-2">
                Monthly Contribution
              </th>
              <th className="text-center text-xs font-medium text-gray-500 pb-3 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id} className="border-b border-gray-100">
                <td className="py-3 px-2">
                  <input
                    type="text"
                    value={account.name}
                    onChange={(e) => onAccountChange(account.id, 'name', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
                  />
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-1">
                    <select
                      value={account.type}
                      onChange={(e) => onAccountChange(account.id, 'type', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
                    >
                      {Object.entries(accountTypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <Tooltip content={accountTypeTooltips[account.type]} />
                  </div>
                </td>
                <td className="py-3 px-2">
                  <input
                    type="number"
                    value={account.currentBalance || ''}
                    onChange={(e) =>
                      onAccountChange(account.id, 'currentBalance', parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
                    placeholder="0"
                  />
                </td>
                <td className="py-3 px-2">
                  <input
                    type="number"
                    value={account.monthlyContribution || ''}
                    onChange={(e) =>
                      onAccountChange(
                        account.id,
                        'monthlyContribution',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
                    placeholder="0"
                  />
                </td>
                <td className="py-3 px-2 text-center">
                  <button
                    onClick={() => onRemoveAccount(account.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-300">
              <td colSpan={2} className="py-3 px-2 text-sm font-semibold text-gray-900">
                Total
              </td>
              <td className="py-3 px-2 text-right text-sm font-bold text-gray-900">
                {formatCurrency(accounts.reduce((sum, acc) => sum + acc.currentBalance, 0))}
              </td>
              <td className="py-3 px-2 text-right text-sm font-bold text-gray-900">
                {formatCurrency(accounts.reduce((sum, acc) => sum + acc.monthlyContribution, 0))}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

interface TooltipProps {
  content: string;
}

function Tooltip({ content }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-gray-400 hover:text-gray-600"
      >
        <Info className="w-4 h-4" />
      </button>
      {show && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}
