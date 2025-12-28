import { ChecklistSection } from '../../types';

export const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    id: 'income',
    title: 'Income Documents',
    icon: '💼',
    subsections: [
      {
        id: 'employee',
        title: 'Employee',
        items: [
          {
            id: 'income-employee-letter',
            label: 'Letter of Employment',
            helperText: 'Must be dated within the last 60 days, on company letterhead',
          },
          {
            id: 'income-employee-paystub',
            label: 'Most Recent Paystub',
            helperText: 'Must be dated within the last 30 days',
          },
        ],
      },
      {
        id: 'variable',
        title: 'Variable Income',
        items: [
          {
            id: 'income-variable-t4',
            label: 'Most Recent T4',
            helperText: 'Required for commission, bonus, or overtime income',
          },
        ],
      },
      {
        id: 'sole-proprietor',
        title: 'Sole Proprietor',
        items: [
          {
            id: 'income-sole-noa',
            label: 'Notice of Assessment (Last 2 Years)',
            helperText: 'From Canada Revenue Agency',
          },
          {
            id: 'income-sole-t1',
            label: 'T1 General (Last 2 Years)',
            helperText: 'Complete personal tax return',
          },
          {
            id: 'income-sole-t2125',
            label: 'T2125 Statement of Business Activities',
            helperText: 'Shows business income and expenses',
          },
          {
            id: 'income-sole-tax-payment',
            label: 'Tax Payment Confirmation',
            helperText: 'Proof of payment or payment arrangement',
          },
        ],
      },
      {
        id: 'corporation',
        title: 'Corporation Owners (25%+ ownership)',
        items: [
          {
            id: 'income-corp-noa',
            label: 'Notice of Assessment (Last 2 Years)',
            helperText: 'Personal NOA from CRA',
          },
          {
            id: 'income-corp-t1',
            label: 'T1 General (Last 2 Years)',
            helperText: 'Complete personal tax return',
          },
          {
            id: 'income-corp-financials',
            label: 'Corporate Financial Statements (Last 2 Years)',
            helperText: 'Balance sheet and income statement',
          },
        ],
      },
    ],
  },
  {
    id: 'down-payment',
    title: 'Down Payment Documentation',
    icon: '💰',
    items: [
      {
        id: 'down-payment-history',
        label: '90-Day Account History',
        helperText: 'Bank statements showing source and accumulation of down payment funds',
      },
      {
        id: 'down-payment-gift',
        label: 'Gift Letter (if applicable)',
        helperText: 'Signed letter from family member gifting funds, stating no repayment expected',
      },
    ],
  },
  {
    id: 'property',
    title: 'Property Documents',
    icon: '🏠',
    items: [
      {
        id: 'property-mls',
        label: 'MLS Listing PDF',
        helperText: 'Complete property listing from realtor.ca or MLS system',
      },
      {
        id: 'property-lease',
        label: 'Current Lease Agreement (if tenant-occupied)',
        helperText: 'Required if purchasing rental property or property with existing tenants',
      },
      {
        id: 'property-condo-fees',
        label: 'Condo Fee Confirmation (if applicable)',
        helperText: 'Statement showing monthly condo fees and any special assessments',
      },
    ],
  },
  {
    id: 'banking',
    title: 'Banking Information',
    icon: '🏦',
    items: [
      {
        id: 'banking-void-cheque',
        label: 'VOID Cheque or Pre-Authorized Debit Form',
        helperText: 'For setting up mortgage payment withdrawals',
      },
    ],
  },
];

export function getTotalItemCount(): number {
  let count = 0;
  CHECKLIST_SECTIONS.forEach((section) => {
    if (section.items) {
      count += section.items.length;
    }
    if (section.subsections) {
      section.subsections.forEach((subsection) => {
        count += subsection.items.length;
      });
    }
  });
  return count;
}
