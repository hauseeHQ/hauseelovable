import { useNavigate } from 'react-router-dom';
import { Play, CheckSquare, PiggyBank, TrendingUp, BookOpen, Sparkles } from 'lucide-react';

interface ActionCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  route: string;
}

const ACTION_CARDS: ActionCard[] = [
  {
    id: 'self-assessment',
    icon: '✅',
    title: 'Self-Assessment',
    description: 'Evaluate your financial, knowledge, and emotional readiness to buy a home',
    route: '/plan?module=self-assessment',
  },
  {
    id: 'budget-planner',
    icon: '💰',
    title: 'Budget Planning',
    description: 'Create a comprehensive budget and understand your affordability range',
    route: '/plan?module=budget-planner',
  },
  {
    id: 'down-payment',
    icon: '📊',
    title: 'Down Payment Tracker',
    description: 'Track your savings progress and set goals for your down payment',
    route: '/plan?module=down-payment-tracker',
  },
  {
    id: 'guide',
    icon: '📖',
    title: 'Home Buying Guide',
    description: 'Access step-by-step guides covering the entire home buying process',
    route: '/guide',
  },
  {
    id: 'ai-copilot',
    icon: '✨',
    title: 'AI Co-Pilot',
    description: 'Get personalized advice and answers to your home buying questions',
    route: '/ai',
  },
];

export default function FinancialReadinessForm() {
  const navigate = useNavigate();

  const handleCardClick = (route: string) => {
    if (route.startsWith('/plan?module=')) {
      const module = route.split('module=')[1];
      navigate(`/plan`);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('changeModule', { detail: module }));
      }, 100);
    } else {
      navigate(route);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Financial Readiness
        </h1>
        <p className="text-gray-600">
          Learn the money moves that make home buying stress-free
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="relative w-full bg-gradient-to-br from-gray-50 to-gray-100" style={{ paddingBottom: '56.25%' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="mb-4 relative">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white shadow-lg mx-auto flex items-center justify-center group cursor-pointer hover:scale-105 transition-transform">
                  <Play className="w-10 h-10 md:w-12 md:h-12 text-primary-400 ml-1" fill="currentColor" />
                </div>
              </div>
              <p className="text-gray-700 font-semibold text-lg">Financial Readiness</p>
              <p className="text-sm text-gray-500 mt-2">16-minute comprehensive video guide</p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-xs text-gray-600 shadow-sm">
                <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
                Video content in production
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Prototype: Video player integration coming soon
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8 mb-8">
        <h2 className="text-2xl font-bold text-primary-400 mb-6">What You'll Learn</h2>

        <div className="prose prose-lg max-w-none" style={{ lineHeight: '1.7' }}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-primary-400 mb-2">💵 Cash Flow Management</h3>
            <p className="text-gray-700 text-base">
              Understanding your monthly income and expenses is the foundation of homeownership readiness.
              Learn how to analyze your current cash flow, identify areas for optimization, and prepare for
              the budget changes that come with owning a home including property taxes, insurance, utilities,
              and maintenance costs.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-primary-400 mb-2">📏 GDS/TDS Ratios</h3>
            <p className="text-gray-700 text-base">
              Canadian lenders use two key metrics to assess your borrowing capacity. The Gross Debt Service
              (GDS) ratio measures housing costs against your income and should not exceed 32%. The Total Debt
              Service (TDS) ratio includes all your debt obligations and must stay under 40%. Understanding these
              ratios helps you determine how much house you can realistically afford.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-primary-400 mb-2">🏠 Down Payment Requirements</h3>
            <p className="text-gray-700 text-base">
              In Canada, minimum down payment rules vary by purchase price. You need at least 5% for the first
              $500,000, 10% for the portion between $500,000 and $1 million, and 20% for any amount over $1 million.
              Properties over $1 million require a minimum 20% down payment. The more you put down, the lower your
              mortgage payments and interest costs over time.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-primary-400 mb-2">🛡️ CMHC Mortgage Insurance</h3>
            <p className="text-gray-700 text-base">
              When your down payment is less than 20%, you're required to purchase mortgage default insurance from
              CMHC, Sagen, or Canada Guaranty. Insurance premiums range from 0.6% to 4% of your mortgage amount,
              depending on your down payment size. This cost is typically added to your mortgage principal. While
              it increases your overall cost, it allows you to enter the market sooner with a smaller down payment.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-primary-400 mb-2">💳 Closing Costs Breakdown</h3>
            <p className="text-gray-700 text-base">
              Budget for 1.5% to 4% of your purchase price for closing costs in Ontario. This includes land transfer
              tax (provincial and municipal in Toronto), legal fees ($1,500-$2,500), home inspection ($400-$600),
              title insurance ($200-$400), property tax adjustments, and moving expenses. First-time buyers in Ontario
              may qualify for land transfer tax rebates of up to $4,000.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-primary-400 mb-2">✓ Mortgage Pre-Approval Process</h3>
            <p className="text-gray-700 text-base">
              Getting pre-approved locks in your interest rate for 90-120 days and shows sellers you're a serious buyer.
              You'll need to provide proof of income (pay stubs, T4s, NOAs), employment verification, credit history,
              down payment source documentation, and details of assets and liabilities. Pre-approval doesn't guarantee
              final approval, but it gives you confidence when making offers and protects you from rate increases during
              your house hunt.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-primary-400"></div>
          <h2 className="text-2xl font-bold text-gray-900">Recommended Next Steps</h2>
          <div className="flex-1 h-px bg-primary-400"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ACTION_CARDS.map((card, index) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.route)}
              className="bg-white border border-gray-200 rounded-lg p-5 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">{card.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="text-center py-6">
        <p className="text-xs text-gray-400">
          Prototype Disclaimer: This is a demonstration module. Video content and interactive features are in development.
        </p>
      </div>
    </div>
  );
}
