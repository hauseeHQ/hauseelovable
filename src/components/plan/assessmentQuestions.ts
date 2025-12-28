import { AssessmentQuestion } from '../../types';

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    category: 'financial',
    text: 'I have 3–6 months of emergency savings.',
  },
  {
    id: 2,
    category: 'financial',
    text: 'My GDS/TDS debt service ratios should meet Canadian lender limits.',
  },
  {
    id: 3,
    category: 'financial',
    text: 'My credit score is strong enough for a mortgage (approx. 670+).',
  },
  {
    id: 4,
    category: 'financial',
    text: 'I understand Canada\'s minimum down payment rules.',
  },
  {
    id: 5,
    category: 'financial',
    text: 'I am comfortable with mortgage default insurance if my down payment is under 20%.',
  },
  {
    id: 6,
    category: 'knowledge',
    text: 'I understand the key steps from search → offer → firm → closing.',
  },
  {
    id: 7,
    category: 'knowledge',
    text: 'I know how pre-approval affects offers and locks in rates.',
  },
  {
    id: 8,
    category: 'knowledge',
    text: 'I understand Canadian mortgages (fixed vs variable; term vs amortization).',
  },
  {
    id: 9,
    category: 'knowledge',
    text: 'I know the major closing costs required in Ontario.',
  },
  {
    id: 10,
    category: 'knowledge',
    text: 'I feel informed about neighbourhoods and pricing in my preferred areas.',
  },
  {
    id: 11,
    category: 'emotional',
    text: 'I plan to stay in the home for 3–5+ years.',
  },
  {
    id: 12,
    category: 'emotional',
    text: 'I am comfortable making decisions under 24–48 hour offer deadlines.',
  },
  {
    id: 13,
    category: 'emotional',
    text: 'My income feels stable enough for homeownership.',
  },
  {
    id: 14,
    category: 'emotional',
    text: 'I feel confident managing home maintenance responsibilities.',
  },
  {
    id: 15,
    category: 'emotional',
    text: 'I understand tradeoffs like size vs commute vs neighbourhood.',
  },
];

export const CATEGORY_INFO = {
  financial: {
    title: 'Financial Readiness',
    icon: '📊',
    description: 'Assess your financial preparedness for homeownership',
  },
  knowledge: {
    title: 'Knowledge Readiness',
    icon: '🎓',
    description: 'Evaluate your understanding of the home buying process',
  },
  emotional: {
    title: 'Emotional Readiness',
    icon: '💪',
    description: 'Gauge your readiness for the emotional aspects of buying',
  },
};
