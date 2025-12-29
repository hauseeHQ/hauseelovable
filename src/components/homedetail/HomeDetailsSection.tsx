import { Home } from '../../types';

interface HomeDetailsSectionProps {
  home: Home;
  onEdit?: () => void;
}

export default function HomeDetailsSection({ home, onEdit }: HomeDetailsSectionProps) {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const detailItems = [
    { label: 'House address', value: home.address },
    { label: 'Neighborhood', value: home.neighborhood || '—' },
    { label: 'Asking price', value: formatCurrency(home.price) },
    { label: 'Bedrooms', value: home.bedrooms },
    { label: 'Bathrooms', value: home.bathrooms },
    { label: 'Year Built', value: home.yearBuilt || '—' },
    { label: 'Property taxes', value: home.propertyTaxes ? formatCurrency(home.propertyTaxes) : '—' },
    { label: 'Sq. Ft', value: home.squareFootage ? home.squareFootage.toLocaleString() : '—' },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Home Details</h2>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Edit
          </button>
        )}
      </div>
      <div className="px-6 py-4">
        <div className="space-y-3">
          {detailItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className="text-sm font-medium text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
