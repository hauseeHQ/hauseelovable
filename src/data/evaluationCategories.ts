import { EvaluationCategory } from '../types';

export const EVALUATION_CATEGORIES: EvaluationCategory[] = [
  {
    id: 'exteriors',
    title: 'Exteriors',
    icon: 'Home',
    items: [
      { id: 'roof_condition', label: 'Roof Condition', type: 'rating' },
      { id: 'siding_condition', label: 'Siding Condition', type: 'rating' },
      { id: 'windows_condition', label: 'Windows Condition', type: 'rating' },
      { id: 'gutters_downspouts', label: 'Gutters & Downspouts', type: 'rating' },
      { id: 'driveway_condition', label: 'Driveway Condition', type: 'rating' },
      { id: 'garage_condition', label: 'Garage Condition', type: 'rating' },
      { id: 'landscaping', label: 'Landscaping', type: 'rating' },
      { id: 'fencing', label: 'Fencing', type: 'rating' },
      { id: 'deck_patio', label: 'Deck/Patio', type: 'rating' },
      { id: 'foundation_visible', label: 'Foundation (Visible)', type: 'rating' },
    ],
  },
  {
    id: 'interiors',
    title: 'Interiors',
    icon: 'Layout',
    items: [
      { id: 'flooring_main', label: 'Flooring - Main Level', type: 'rating' },
      { id: 'flooring_upper', label: 'Flooring - Upper Level', type: 'rating' },
      { id: 'flooring_basement', label: 'Flooring - Basement', type: 'rating' },
      { id: 'walls_ceiling', label: 'Walls & Ceiling Condition', type: 'rating' },
      { id: 'doors_hardware', label: 'Doors & Hardware', type: 'rating' },
      { id: 'lighting_fixtures', label: 'Lighting Fixtures', type: 'rating' },
      { id: 'closet_storage', label: 'Closet/Storage Space', type: 'rating' },
      { id: 'bathroom_main', label: 'Main Bathroom Condition', type: 'rating' },
      { id: 'bathroom_ensuite', label: 'Ensuite Bathroom', type: 'rating' },
      { id: 'bathroom_fixtures', label: 'Bathroom Fixtures', type: 'rating' },
      { id: 'laundry_area', label: 'Laundry Area', type: 'rating' },
      { id: 'basement_finish', label: 'Basement Finish Quality', type: 'rating' },
    ],
  },
  {
    id: 'kitchen',
    title: 'Kitchen',
    icon: 'Utensils',
    items: [
      { id: 'kitchen_cabinets', label: 'Cabinet Condition', type: 'rating' },
      { id: 'kitchen_countertops', label: 'Countertops', type: 'rating' },
      { id: 'kitchen_backsplash', label: 'Backsplash', type: 'rating' },
      { id: 'kitchen_sink_faucet', label: 'Sink & Faucet', type: 'rating' },
      { id: 'kitchen_appliances', label: 'Appliances (Overall)', type: 'rating' },
      { id: 'kitchen_stove', label: 'Stove/Range', type: 'rating' },
      { id: 'kitchen_fridge', label: 'Refrigerator', type: 'rating' },
      { id: 'kitchen_dishwasher', label: 'Dishwasher', type: 'rating' },
      { id: 'kitchen_microwave', label: 'Microwave', type: 'rating' },
      { id: 'kitchen_layout', label: 'Kitchen Layout', type: 'rating' },
      { id: 'kitchen_pantry', label: 'Pantry Space', type: 'rating' },
      { id: 'kitchen_lighting', label: 'Kitchen Lighting', type: 'rating' },
    ],
  },
  {
    id: 'home_systems',
    title: 'Home Systems',
    icon: 'Settings',
    items: [
      { id: 'hvac_furnace', label: 'Furnace Condition', type: 'rating' },
      { id: 'hvac_ac', label: 'Air Conditioning', type: 'rating' },
      {
        id: 'water_heater_type',
        label: 'Hot Water Heater Type',
        type: 'dropdown',
        options: ['Owned', 'Leased'],
      },
      {
        id: 'water_heater_style',
        label: 'Water Heater Style',
        type: 'dropdown',
        options: ['Tank', 'Tankless'],
      },
      { id: 'water_heater_condition', label: 'Water Heater Condition', type: 'rating' },
      { id: 'electrical_panel', label: 'Electrical Panel', type: 'rating' },
      { id: 'plumbing_visible', label: 'Plumbing (Visible)', type: 'rating' },
      { id: 'water_pressure', label: 'Water Pressure', type: 'rating' },
      { id: 'insulation', label: 'Insulation Quality', type: 'rating' },
      { id: 'ventilation', label: 'Ventilation', type: 'rating' },
      { id: 'sump_pump', label: 'Sump Pump', type: 'rating' },
    ],
  },
  {
    id: 'location',
    title: 'Location',
    icon: 'MapPin',
    items: [
      { id: 'neighborhood_safety', label: 'Neighborhood Safety', type: 'rating' },
      { id: 'street_traffic', label: 'Street Traffic Level', type: 'rating' },
      { id: 'noise_level', label: 'Noise Level', type: 'rating' },
      { id: 'proximity_amenities', label: 'Proximity to Amenities', type: 'rating' },
      { id: 'schools_nearby', label: 'Schools Nearby', type: 'rating' },
      { id: 'public_transit', label: 'Public Transit Access', type: 'rating' },
      { id: 'parking_availability', label: 'Parking Availability', type: 'rating' },
      { id: 'walkability', label: 'Walkability Score', type: 'rating' },
      { id: 'lot_size', label: 'Lot Size', type: 'rating' },
      { id: 'privacy', label: 'Privacy', type: 'rating' },
    ],
  },
  {
    id: 'additional_features',
    title: 'Additional Features',
    icon: 'Star',
    items: [
      { id: 'natural_light', label: 'Natural Light', type: 'rating' },
      { id: 'views', label: 'Views', type: 'rating' },
      { id: 'outdoor_space', label: 'Outdoor Space', type: 'rating' },
      { id: 'storage_space', label: 'Overall Storage', type: 'rating' },
      { id: 'finished_basement', label: 'Finished Basement', type: 'rating' },
      { id: 'home_office_space', label: 'Home Office Potential', type: 'rating' },
      { id: 'energy_efficiency', label: 'Energy Efficiency', type: 'rating' },
      { id: 'move_in_readiness', label: 'Move-in Readiness', type: 'rating' },
    ],
  },
  {
    id: 'smart_features',
    title: 'Smart Features',
    icon: 'Smartphone',
    items: [
      { id: 'smart_thermostat', label: 'Smart Thermostat', type: 'rating' },
      { id: 'smart_doorbell', label: 'Smart Doorbell', type: 'rating' },
      { id: 'smart_locks', label: 'Smart Locks', type: 'rating' },
      { id: 'security_system', label: 'Security System', type: 'rating' },
      { id: 'smart_lighting', label: 'Smart Lighting', type: 'rating' },
      { id: 'internet_speed', label: 'Internet Speed/Capability', type: 'rating' },
    ],
  },
  {
    id: 'monthly_costs',
    title: 'Monthly Costs',
    icon: 'DollarSign',
    items: [
      { id: 'property_taxes_monthly', label: 'Property Taxes (Monthly)', type: 'currency' },
      { id: 'hoa_condo_fees', label: 'HOA/Condo Fees', type: 'currency' },
      { id: 'utilities_estimate', label: 'Utilities Estimate', type: 'currency' },
      { id: 'insurance_estimate', label: 'Home Insurance Estimate', type: 'currency' },
      { id: 'maintenance_reserve', label: 'Maintenance Reserve', type: 'currency' },
    ],
  },
  {
    id: 'other_observations',
    title: 'Other Observations',
    icon: 'FileText',
    items: [
      { id: 'general_impressions', label: 'General Impressions', type: 'textarea' },
      { id: 'concerns_red_flags', label: 'Concerns/Red Flags', type: 'textarea' },
      { id: 'unique_features', label: 'Unique Features', type: 'textarea' },
      { id: 'renovation_potential', label: 'Renovation Potential', type: 'textarea' },
      { id: 'comparable_homes', label: 'Comparison to Other Homes', type: 'textarea' },
    ],
  },
];

export const RATING_VALUES = {
  good: { value: 5, color: 'green', label: 'Good' },
  fair: { value: 3, color: 'yellow', label: 'Fair' },
  poor: { value: 1, color: 'red', label: 'Poor' },
};

export function getTotalEvaluationItems(): number {
  return EVALUATION_CATEGORIES.reduce((total, category) => {
    return total + category.items.filter((item) => item.type === 'rating').length;
  }, 0);
}

export function calculateOverallRating(ratings: {
  [categoryId: string]: { [itemId: string]: string | number };
}): number {
  let totalValue = 0;
  let totalItems = 0;

  Object.values(ratings).forEach((category) => {
    Object.entries(category).forEach(([, value]) => {
      if (typeof value === 'string' && ['good', 'fair', 'poor'].includes(value)) {
        const points = value === 'good' ? 5 : value === 'fair' ? 3 : 1;
        totalValue += points;
        totalItems++;
      }
    });
  });

  if (totalItems === 0) return 0;

  const averageScore = totalValue / (totalItems * 5);
  const overallRating = averageScore * 5;

  return Math.round(overallRating * 10) / 10;
}

export function calculateCompletionPercentage(ratings: {
  [categoryId: string]: { [itemId: string]: string | number };
}): number {
  let completedItems = 0;
  let totalItems = 0;

  EVALUATION_CATEGORIES.forEach((category) => {
    category.items.forEach((item) => {
      totalItems++;
      const rating = ratings[category.id]?.[item.id];
      if (rating !== undefined && rating !== null && rating !== '') {
        completedItems++;
      }
    });
  });

  return Math.round((completedItems / totalItems) * 100);
}
