import { useState, useEffect, useCallback } from 'react';
import { Printer } from 'lucide-react';
import {
  BudgetPlannerData,
  BudgetCategory,
  BudgetLineItem,
  BudgetCalculations,
  CategoryTotals
} from '../../types';
import { saveBudgetPlanner, loadBudgetPlanner } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const createEmptyLineItem = (): BudgetLineItem => ({ current: 0, expected: 0 });

const INITIAL_STATE: BudgetPlannerData = {
  budget: {
    income: {
      netIncome: createEmptyLineItem(),
      partnerNetIncome: createEmptyLineItem(),
      otherIncome: createEmptyLineItem(),
    },
    debt: {
      creditCards: createEmptyLineItem(),
      linesOfCredit: createEmptyLineItem(),
      studentLoans: createEmptyLineItem(),
      personalLoan: createEmptyLineItem(),
      autoLoanLease: createEmptyLineItem(),
      otherLoans: createEmptyLineItem(),
    },
    transportation: {
      autoInsurance: createEmptyLineItem(),
      repairsMaintenance: createEmptyLineItem(),
      fuel: createEmptyLineItem(),
      parking: createEmptyLineItem(),
      publicTransit: createEmptyLineItem(),
    },
    housing: {
      rentMortgage: createEmptyLineItem(),
      propertyTaxes: createEmptyLineItem(),
      insurance: createEmptyLineItem(),
      condoPoaFees: createEmptyLineItem(),
      maintenance: createEmptyLineItem(),
      groceries: createEmptyLineItem(),
      laundry: createEmptyLineItem(),
    },
    health: {
      medication: createEmptyLineItem(),
      glassesContacts: createEmptyLineItem(),
      dental: createEmptyLineItem(),
      therapist: createEmptyLineItem(),
      specialNeedsItems: createEmptyLineItem(),
    },
  },
  calculations: {
    currentMonthlySavings: 0,
    expectedMonthlySavings: 0,
    delta: 0,
    categoryTotals: {
      income: { current: 0, expected: 0 },
      debt: { current: 0, expected: 0 },
      transportation: { current: 0, expected: 0 },
      housing: { current: 0, expected: 0 },
      health: { current: 0, expected: 0 },
    },
  },
  updatedAt: new Date().toISOString(),
};

export default function BudgetPlannerForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [budget, setBudget] = useState<BudgetPlannerData>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const localData = localStorage.getItem(`hausee_budget_${user.id}`);
      const { data: dbData } = await loadBudgetPlanner(user.id);

      if (dbData) {
        setBudget(dbData);
      } else if (localData) {
        const parsed = JSON.parse(localData);
        setBudget(parsed);
      }
    } catch (err) {
      console.error('Error loading budget:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCategoryTotal = (category: Record<string, BudgetLineItem>): CategoryTotals => {
    let current = 0;
    let expected = 0;

    Object.values(category).forEach((item) => {
      current += item.current;
      expected += item.expected;
    });

    return { current, expected };
  };

  const calculateBudget = (budgetData: BudgetCategory): BudgetCalculations => {
    const incomeTotals = calculateCategoryTotal(budgetData.income);
    const debtTotals = calculateCategoryTotal(budgetData.debt);
    const transportationTotals = calculateCategoryTotal(budgetData.transportation);
    const housingTotals = calculateCategoryTotal(budgetData.housing);
    const healthTotals = calculateCategoryTotal(budgetData.health);

    const currentMonthlySavings =
      incomeTotals.current -
      (debtTotals.current + transportationTotals.current + housingTotals.current + healthTotals.current);

    const expectedMonthlySavings =
      incomeTotals.expected -
      (debtTotals.expected + transportationTotals.expected + housingTotals.expected + healthTotals.expected);

    const delta = expectedMonthlySavings - currentMonthlySavings;

    return {
      currentMonthlySavings,
      expectedMonthlySavings,
      delta,
      categoryTotals: {
        income: incomeTotals,
        debt: debtTotals,
        transportation: transportationTotals,
        housing: housingTotals,
        health: healthTotals,
      },
    };
  };

  const debouncedSave = useCallback(
    (data: BudgetPlannerData) => {
      if (!user?.id) {
        navigate('/signin', { state: { returnTo: window.location.pathname } });
        return;
      }

      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      const timeout = setTimeout(async () => {
        const updatedData = { ...data, updatedAt: new Date().toISOString() };

        localStorage.setItem(`hausee_budget_${user.id}`, JSON.stringify(updatedData));

        const result = await saveBudgetPlanner(user.id, updatedData);

        if (!result.success) {
          console.error('Failed to save budget');
        }
      }, 1000);

      setSaveTimeout(timeout);
    },
    [saveTimeout, user, navigate]
  );

  const handleValueChange = (
    category: keyof BudgetCategory,
    field: string,
    type: 'current' | 'expected',
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    const newBudget = { ...budget.budget };
    const categoryData = newBudget[category] as Record<string, BudgetLineItem>;

    categoryData[field] = {
      ...categoryData[field],
      [type]: numValue,
    };

    const newCalculations = calculateBudget(newBudget);

    const updatedBudget: BudgetPlannerData = {
      budget: newBudget,
      calculations: newCalculations,
      updatedAt: new Date().toISOString(),
    };

    setBudget(updatedBudget);
    debouncedSave(updatedBudget);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading budget planner...</div>
      </div>
    );
  }

  const { calculations } = budget;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budget</h1>
            <p className="text-gray-600">Current vs expected savings</p>
          </div>
          <button
            onClick={handlePrint}
            className="no-print p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Print budget"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-blue-600 rounded-lg p-6 text-white">
          <p className="text-sm mb-4 opacity-90">
            A snapshot of your money picture — no judgment, just clarity.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-pink-100 rounded-lg p-4 text-gray-900">
              <p className="text-xs font-medium mb-1 text-pink-800">Current Savings</p>
              <p className="text-2xl font-bold">
                {formatCurrency(calculations.currentMonthlySavings)}
              </p>
            </div>

            <div className="bg-teal-100 rounded-lg p-4 text-gray-900">
              <p className="text-xs font-medium mb-1 text-teal-800">Expected Savings</p>
              <p className="text-2xl font-bold">
                {formatCurrency(calculations.expectedMonthlySavings)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <span className="text-sm font-medium">
              Δ {calculations.delta >= 0 ? '+' : ''}
              {formatCurrency(calculations.delta)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <CategorySection
          title="Income"
          subtitle="Label"
          items={[
            { key: 'netIncome', label: 'Net income after taxes' },
            { key: 'partnerNetIncome', label: "Partner's net income after taxes" },
            { key: 'otherIncome', label: 'Other income' },
          ]}
          data={budget.budget.income}
          categoryKey="income"
          totals={calculations.categoryTotals.income}
          onChange={handleValueChange}
          formatCurrency={formatCurrency}
        />

        <CategorySection
          title="Debt"
          subtitle="Label"
          items={[
            { key: 'creditCards', label: 'Credit cards' },
            { key: 'linesOfCredit', label: 'Lines of credit' },
            { key: 'studentLoans', label: 'Student loans' },
            { key: 'personalLoan', label: 'Personal loan' },
            { key: 'autoLoanLease', label: 'Auto loan/lease' },
            { key: 'otherLoans', label: 'Other loans' },
          ]}
          data={budget.budget.debt}
          categoryKey="debt"
          totals={calculations.categoryTotals.debt}
          onChange={handleValueChange}
          formatCurrency={formatCurrency}
        />

        <CategorySection
          title="Transportation"
          subtitle="Label"
          items={[
            { key: 'autoInsurance', label: 'Auto insurance' },
            { key: 'repairsMaintenance', label: 'Repairs/maintenance' },
            { key: 'fuel', label: 'Fuel' },
            { key: 'parking', label: 'Parking' },
            { key: 'publicTransit', label: 'Public transit' },
          ]}
          data={budget.budget.transportation}
          categoryKey="transportation"
          totals={calculations.categoryTotals.transportation}
          onChange={handleValueChange}
          formatCurrency={formatCurrency}
        />

        <CategorySection
          title="Housing Costs"
          subtitle="Label"
          items={[
            { key: 'rentMortgage', label: 'Rent/Mortgage' },
            { key: 'propertyTaxes', label: 'Property taxes' },
            { key: 'insurance', label: 'Insurance' },
            { key: 'condoPoaFees', label: 'Condo/POA fees' },
            { key: 'maintenance', label: 'Maintenance' },
            { key: 'groceries', label: 'Groceries' },
            { key: 'laundry', label: 'Laundry' },
          ]}
          data={budget.budget.housing}
          categoryKey="housing"
          totals={calculations.categoryTotals.housing}
          onChange={handleValueChange}
          formatCurrency={formatCurrency}
        />

        <CategorySection
          title="Health"
          subtitle="Label"
          items={[
            { key: 'medication', label: 'Medication' },
            { key: 'glassesContacts', label: 'Glasses/contacts' },
            { key: 'dental', label: 'Dental' },
            { key: 'therapist', label: 'Therapist' },
            { key: 'specialNeedsItems', label: 'Special needs items' },
          ]}
          data={budget.budget.health}
          categoryKey="health"
          totals={calculations.categoryTotals.health}
          onChange={handleValueChange}
          formatCurrency={formatCurrency}
          isLast
        />
      </div>
    </div>
  );
}

interface CategorySectionProps {
  title: string;
  subtitle: string;
  items: Array<{ key: string; label: string }>;
  data: Record<string, BudgetLineItem>;
  categoryKey: keyof BudgetCategory;
  totals: CategoryTotals;
  onChange: (
    category: keyof BudgetCategory,
    field: string,
    type: 'current' | 'expected',
    value: string
  ) => void;
  formatCurrency: (value: number) => string;
  isLast?: boolean;
}

function CategorySection({
  title,
  subtitle,
  items,
  data,
  categoryKey,
  totals,
  onChange,
  formatCurrency,
  isLast = false,
}: CategorySectionProps) {
  return (
    <div className={`p-6 ${!isLast ? 'border-b border-gray-200' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="text-xs text-gray-500">
          Current: {formatCurrency(totals.current)} • Expected: {formatCurrency(totals.expected)}
        </span>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-4 text-xs font-medium text-gray-500 pb-2">
          <div>{subtitle}</div>
          <div className="text-center">Current</div>
          <div className="text-center">Expected</div>
        </div>

        {items.map((item) => (
          <div key={item.key} className="grid grid-cols-3 gap-4 items-center">
            <label className="text-sm text-gray-700">{item.label}</label>

            <input
              type="text"
              value={data[item.key]?.current || ''}
              onChange={(e) => onChange(categoryKey, item.key, 'current', e.target.value)}
              className="h-10 px-3 text-center border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="0"
            />

            <input
              type="text"
              value={data[item.key]?.expected || ''}
              onChange={(e) => onChange(categoryKey, item.key, 'expected', e.target.value)}
              className="h-10 px-3 text-center border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="0"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
