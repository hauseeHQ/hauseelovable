# Home Detail View & Evaluation System - Technical Specification

## Overview
A comprehensive property evaluation interface allowing users to rate homes across 9 major categories with 100+ individual data points, multimedia support, and real-time calculation.

---

## 1. PAGE ARCHITECTURE

### 1.1 Component Hierarchy
```
HomeDetailView
├── DetailHeader (sticky)
│   ├── Breadcrumb
│   ├── BackButton
│   └── ActionMenu
├── HeroSection
│   ├── PropertyBanner
│   ├── FavoriteToggle
│   ├── PropertySummary
│   └── OfferIntentSelector
├── OverallRatingCard
├── QuickStatsGrid
├── EvaluationSummary
├── StartEvaluationButton
└── RatingModal (when active)
    ├── ModalHeader
    ├── ProgressBar
    ├── SectionNavigation
    ├── RatingContent
    │   ├── RatingSection[]
    │   │   ├── RatingItem[]
    │   │   │   ├── RatingButtons
    │   │   │   └── ItemNotes
    │   │   ├── SectionNotes
    │   │   └── MediaUpload
    └── ModalFooter
```

### 1.2 Sticky Header
```typescript
// Dimensions: h-16 (64px)
// Background: bg-white with border-b shadow-sm
// z-index: z-40

<header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
  <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
    <nav className="flex items-center gap-2 text-sm">
      <a href="/evaluate" className="text-gray-500 hover:text-gray-700">
        Browse
      </a>
      <ChevronRight className="w-4 h-4 text-gray-400" />
      <span className="text-gray-900 font-medium">{address}</span>
    </nav>
    <div className="flex items-center gap-3">
      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
        <MoreVertical className="w-5 h-5" />
      </button>
    </div>
  </div>
</header>
```

### 1.3 Hero Section
```typescript
// Height: h-96 (384px) on desktop, h-64 (256px) on mobile
// Image overlay gradient: from-transparent to-black/60

<section className="relative h-64 md:h-96">
  {/* Background Image */}
  <img
    src={home.primaryPhoto}
    className="absolute inset-0 w-full h-full object-cover"
  />

  {/* Gradient Overlay */}
  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

  {/* Favorite Toggle - Top Right */}
  <button className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur rounded-full shadow-lg">
    <Heart className={`w-6 h-6 ${favorite ? 'fill-red-400 text-red-400' : 'text-gray-600'}`} />
  </button>

  {/* Property Summary - Bottom Overlay */}
  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
    <h1 className="text-3xl font-bold mb-2">{address}</h1>
    <p className="text-lg mb-4">{neighborhood}</p>
    <div className="flex items-center gap-6 text-sm">
      <span>{bedrooms} bed</span>
      <span>{bathrooms} bath</span>
      <span>{squareFootage} sq ft</span>
    </div>
  </div>
</section>
```

### 1.4 Offer Intent Selector
```typescript
// Position: Below hero, full width bar
// Height: h-16
// Background: bg-gradient-to-r from-green-50 to-blue-50

<div className="bg-white border-y border-gray-200 py-4">
  <div className="max-w-7xl mx-auto px-4">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">
        Would you make an offer on this home?
      </span>
      <div className="flex gap-2">
        <button className={`px-6 py-2 rounded-full font-medium transition-colors ${
          offerIntent === 'yes'
            ? 'bg-green-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}>
          Yes
        </button>
        <button className={`px-6 py-2 rounded-full font-medium transition-colors ${
          offerIntent === 'maybe'
            ? 'bg-yellow-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}>
          Maybe
        </button>
        <button className={`px-6 py-2 rounded-full font-medium transition-colors ${
          offerIntent === 'no'
            ? 'bg-red-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}>
          No
        </button>
      </div>
    </div>
  </div>
</div>
```

---

## 2. RATING SYSTEM SPECIFICATIONS

### 2.1 Nine Evaluation Categories

```typescript
const EVALUATION_CATEGORIES = {
  exteriors: {
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
  interiors: {
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
  kitchen: {
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
  homeSystems: {
    title: 'Home Systems',
    icon: 'Settings',
    items: [
      { id: 'hvac_furnace', label: 'Furnace Condition', type: 'rating' },
      { id: 'hvac_ac', label: 'Air Conditioning', type: 'rating' },
      { id: 'water_heater_type', label: 'Hot Water Heater Type', type: 'dropdown',
        options: ['Owned', 'Leased'] },
      { id: 'water_heater_style', label: 'Water Heater Style', type: 'dropdown',
        options: ['Tank', 'Tankless'] },
      { id: 'water_heater_condition', label: 'Water Heater Condition', type: 'rating' },
      { id: 'electrical_panel', label: 'Electrical Panel', type: 'rating' },
      { id: 'plumbing_visible', label: 'Plumbing (Visible)', type: 'rating' },
      { id: 'water_pressure', label: 'Water Pressure', type: 'rating' },
      { id: 'insulation', label: 'Insulation Quality', type: 'rating' },
      { id: 'ventilation', label: 'Ventilation', type: 'rating' },
      { id: 'sump_pump', label: 'Sump Pump', type: 'rating' },
    ],
  },
  location: {
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
  additionalFeatures: {
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
  smartFeatures: {
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
  monthlyCosts: {
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
  otherObservations: {
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
};
```

### 2.2 Rating Point System
```typescript
const RATING_VALUES = {
  good: { value: 5, color: 'green', label: 'Good', icon: 'ThumbsUp' },
  fair: { value: 3, color: 'yellow', label: 'Fair', icon: 'Minus' },
  poor: { value: 1, color: 'red', label: 'Poor', icon: 'ThumbsDown' },
};

// Overall Rating Calculation:
// 1. Sum all rating values (excluding currency and textarea types)
// 2. Count total rated items
// 3. Calculate: (totalValue / (totalItems * 5)) * 5
// 4. Result: 0.0 - 5.0 stars
```

### 2.3 Rating Button Component
```typescript
// Dimensions: h-20 (80px) width varies by screen
// Mobile: full width stacked
// Desktop: inline-flex with equal spacing

<div className="grid grid-cols-3 gap-3">
  <button
    onClick={() => handleRate(itemId, 'good')}
    className={`
      h-20 rounded-lg font-medium text-sm transition-all
      flex flex-col items-center justify-center gap-2
      ${rating === 'good'
        ? 'bg-green-500 text-white shadow-lg scale-105'
        : 'bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-200'
      }
    `}
  >
    <ThumbsUp className="w-6 h-6" />
    <span>Good</span>
    <span className="text-xs opacity-75">5 pts</span>
  </button>

  <button
    onClick={() => handleRate(itemId, 'fair')}
    className={`
      h-20 rounded-lg font-medium text-sm transition-all
      flex flex-col items-center justify-center gap-2
      ${rating === 'fair'
        ? 'bg-yellow-500 text-white shadow-lg scale-105'
        : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-2 border-yellow-200'
      }
    `}
  >
    <Minus className="w-6 h-6" />
    <span>Fair</span>
    <span className="text-xs opacity-75">3 pts</span>
  </button>

  <button
    onClick={() => handleRate(itemId, 'poor')}
    className={`
      h-20 rounded-lg font-medium text-sm transition-all
      flex flex-col items-center justify-center gap-2
      ${rating === 'poor'
        ? 'bg-red-500 text-white shadow-lg scale-105'
        : 'bg-red-50 text-red-700 hover:bg-red-100 border-2 border-red-200'
      }
    `}
  >
    <ThumbsDown className="w-6 h-6" />
    <span>Poor</span>
    <span className="text-xs opacity-75">1 pt</span>
  </button>
</div>
```

---

## 3. MODAL INTERFACE DESIGN

### 3.1 Modal Layout
```typescript
// Mobile: Full screen (h-screen)
// Desktop: max-w-6xl, max-h-[90vh], centered with backdrop

<div className="fixed inset-0 z-50 overflow-hidden">
  {/* Backdrop */}
  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

  {/* Modal Container */}
  <div className="relative h-full md:h-auto md:max-h-[90vh] md:my-8 md:mx-auto md:max-w-6xl">
    <div className="bg-white h-full md:rounded-lg shadow-2xl flex flex-col">
      {/* Header */}
      <ModalHeader />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <RatingContent />
      </div>

      {/* Footer */}
      <ModalFooter />
    </div>
  </div>
</div>
```

### 3.2 Modal Header
```typescript
<header className="border-b border-gray-200 bg-white">
  {/* Top Bar */}
  <div className="px-6 py-4 flex items-center justify-between">
    <h2 className="text-xl font-bold text-gray-900">{currentSection.title}</h2>
    <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg">
      <X className="w-5 h-5" />
    </button>
  </div>

  {/* Progress Bar */}
  <div className="px-6 pb-4">
    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
      <span>Section {currentSectionIndex + 1} of 9</span>
      <span>{completionPercentage}% Complete</span>
    </div>
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-green-500 transition-all duration-300"
        style={{ width: `${completionPercentage}%` }}
      />
    </div>
  </div>

  {/* Section Navigation */}
  <nav className="px-6 pb-4 overflow-x-auto">
    <div className="flex gap-2">
      {SECTIONS.map((section, index) => (
        <button
          key={section.id}
          onClick={() => setCurrentSection(index)}
          className={`
            flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${index === currentSectionIndex
              ? 'bg-red-400 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          {section.title}
        </button>
      ))}
    </div>
  </nav>
</header>
```

### 3.3 Rating Section (Accordion)
```typescript
<div className="p-6 space-y-6">
  {currentSection.items.map((item) => (
    <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Item Label */}
      <label className="block text-lg font-semibold text-gray-900 mb-4">
        {item.label}
      </label>

      {/* Rating Buttons */}
      {item.type === 'rating' && (
        <RatingButtons
          itemId={item.id}
          value={ratings[item.id]}
          onChange={handleRatingChange}
        />
      )}

      {/* Item Notes */}
      <div className="mt-4">
        <textarea
          value={notes[item.id] || ''}
          onChange={(e) => handleNoteChange(item.id, e.target.value)}
          placeholder="Add notes about this item (optional, 500 char limit)"
          maxLength={500}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none"
          rows={2}
        />
        <div className="text-xs text-gray-500 mt-1 text-right">
          {notes[item.id]?.length || 0} / 500
        </div>
      </div>
    </div>
  ))}

  {/* Section Notes */}
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Section Notes
    </label>
    <textarea
      value={sectionNotes[currentSection.id] || ''}
      onChange={(e) => handleSectionNoteChange(e.target.value)}
      placeholder="Additional notes for this section (1000 char limit)"
      maxLength={1000}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none"
      rows={4}
    />
    <div className="text-xs text-gray-500 mt-1 text-right">
      {sectionNotes[currentSection.id]?.length || 0} / 1000
    </div>
  </div>

  {/* Media Upload */}
  <MediaUploadSection
    sectionId={currentSection.id}
    photos={sectionPhotos[currentSection.id]}
    voiceNotes={sectionVoiceNotes[currentSection.id]}
    onPhotoUpload={handlePhotoUpload}
    onVoiceRecord={handleVoiceRecord}
  />
</div>
```

### 3.4 Modal Footer
```typescript
<footer className="border-t border-gray-200 bg-white px-6 py-4">
  <div className="flex items-center justify-between">
    <button
      onClick={handlePrevious}
      disabled={currentSectionIndex === 0}
      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
    >
      Previous Section
    </button>

    <div className="text-sm text-gray-600">
      {hasUnsavedChanges && (
        <span className="flex items-center gap-2">
          <Loader className="w-4 h-4 animate-spin" />
          Saving...
        </span>
      )}
      {!hasUnsavedChanges && lastSavedTime && (
        <span>Saved {formatRelativeTime(lastSavedTime)}</span>
      )}
    </div>

    {currentSectionIndex < SECTIONS.length - 1 ? (
      <button
        onClick={handleNext}
        className="px-6 py-3 bg-red-400 text-white rounded-lg hover:bg-red-500 font-medium"
      >
        Next Section
      </button>
    ) : (
      <button
        onClick={handleComplete}
        className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
      >
        Complete Evaluation
      </button>
    )}
  </div>
</footer>
```

---

## 4. DATA MANAGEMENT

### 4.1 TypeScript Interfaces
```typescript
// Complete evaluation data structure
interface HomeEvaluation {
  id: string;
  homeId: string;
  userId: string;

  // Ratings (100+ items)
  ratings: {
    [categoryId: string]: {
      [itemId: string]: 'good' | 'fair' | 'poor' | number | string;
    };
  };

  // Notes
  itemNotes: {
    [itemId: string]: string; // max 500 chars
  };

  sectionNotes: {
    [sectionId: string]: string; // max 1000 chars
  };

  // Media
  photos: {
    [sectionId: string]: EvaluationPhoto[];
  };

  voiceNotes: {
    [sectionId: string]: VoiceNote[];
  };

  // Metadata
  overallRating: number; // 0-5
  completionPercentage: number; // 0-100
  evaluationStatus: 'not_started' | 'in_progress' | 'completed';
  startedAt: string;
  completedAt?: string;
  lastUpdated: string;
}

interface EvaluationPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption?: string;
  uploadedAt: string;
  fileSize: number;
}

interface VoiceNote {
  id: string;
  url: string;
  duration: number; // seconds
  transcript?: string;
  recordedAt: string;
  fileSize: number;
}

// Auto-save state
interface AutoSaveState {
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  pendingChanges: Partial<HomeEvaluation>;
}
```

### 4.2 Auto-Save Logic
```typescript
// Debounce configuration
const AUTO_SAVE_CONFIG = {
  ratingDebounce: 100, // ms - immediate feedback
  textDebounce: 2000, // ms - 2 second delay
  batchSize: 10, // items per batch
};

// Auto-save hook
function useAutoSave(homeId: string, evaluationData: HomeEvaluation) {
  const [saveState, setSaveState] = useState<AutoSaveState>({
    isDirty: false,
    isSaving: false,
    lastSaved: null,
    pendingChanges: {},
  });

  const debouncedSaveRating = useMemo(
    () => debounce(async (changes: Partial<HomeEvaluation>) => {
      setSaveState(prev => ({ ...prev, isSaving: true }));

      await updateEvaluation(homeId, changes);

      setSaveState({
        isDirty: false,
        isSaving: false,
        lastSaved: new Date(),
        pendingChanges: {},
      });
    }, AUTO_SAVE_CONFIG.ratingDebounce),
    [homeId]
  );

  const debouncedSaveText = useMemo(
    () => debounce(async (changes: Partial<HomeEvaluation>) => {
      setSaveState(prev => ({ ...prev, isSaving: true }));

      await updateEvaluation(homeId, changes);

      setSaveState({
        isDirty: false,
        isSaving: false,
        lastSaved: new Date(),
        pendingChanges: {},
      });
    }, AUTO_SAVE_CONFIG.textDebounce),
    [homeId]
  );

  return {
    saveRating: debouncedSaveRating,
    saveText: debouncedSaveText,
    saveState,
  };
}
```

### 4.3 Overall Rating Calculation
```typescript
function calculateOverallRating(ratings: HomeEvaluation['ratings']): number {
  let totalValue = 0;
  let totalItems = 0;

  // Iterate through all categories
  Object.values(ratings).forEach(category => {
    Object.entries(category).forEach(([itemId, value]) => {
      // Only count rating-type items (good/fair/poor)
      if (typeof value === 'string' && ['good', 'fair', 'poor'].includes(value)) {
        const points = value === 'good' ? 5 : value === 'fair' ? 3 : 1;
        totalValue += points;
        totalItems++;
      }
    });
  });

  if (totalItems === 0) return 0;

  // Calculate average as percentage of perfect score, then convert to 5-star scale
  const averageScore = totalValue / (totalItems * 5);
  const overallRating = averageScore * 5;

  return Math.round(overallRating * 10) / 10; // Round to 1 decimal place
}

function calculateCompletionPercentage(ratings: HomeEvaluation['ratings']): number {
  let completedItems = 0;
  let totalItems = 0;

  // Count all ratable items across all categories
  Object.values(EVALUATION_CATEGORIES).forEach(category => {
    category.items.forEach(item => {
      totalItems++;
      const rating = ratings[category.id]?.[item.id];
      if (rating !== undefined && rating !== null && rating !== '') {
        completedItems++;
      }
    });
  });

  return Math.round((completedItems / totalItems) * 100);
}
```

---

## 5. DATABASE SCHEMA

### 5.1 Evaluations Table
```sql
CREATE TABLE home_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,

  -- Rating data (JSONB for flexibility)
  ratings JSONB DEFAULT '{}',
  item_notes JSONB DEFAULT '{}',
  section_notes JSONB DEFAULT '{}',

  -- Calculated fields
  overall_rating NUMERIC DEFAULT 0 CHECK (overall_rating >= 0 AND overall_rating <= 5),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),

  -- Status
  evaluation_status TEXT DEFAULT 'not_started' CHECK (evaluation_status IN ('not_started', 'in_progress', 'completed')),

  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one evaluation per home per user
  UNIQUE(home_id, user_id)
);

-- Indexes
CREATE INDEX idx_evaluations_home_id ON home_evaluations(home_id);
CREATE INDEX idx_evaluations_user_id ON home_evaluations(user_id);
CREATE INDEX idx_evaluations_status ON home_evaluations(evaluation_status);

-- RLS Policies
ALTER TABLE home_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own evaluations"
  ON home_evaluations FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own evaluations"
  ON home_evaluations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own evaluations"
  ON home_evaluations FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);
```

### 5.2 Media Tables
```sql
-- Photos
CREATE TABLE evaluation_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES home_evaluations(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL,

  -- Storage paths
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT NOT NULL,

  -- Metadata
  caption TEXT,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_evaluation_photos_evaluation_id ON evaluation_photos(evaluation_id);
CREATE INDEX idx_evaluation_photos_section ON evaluation_photos(section_id);

-- Voice Notes
CREATE TABLE evaluation_voice_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES home_evaluations(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL,

  -- Storage
  storage_path TEXT NOT NULL,

  -- Metadata
  duration INTEGER NOT NULL, -- seconds
  file_size INTEGER NOT NULL,
  transcript TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_evaluation_voice_notes_evaluation_id ON evaluation_voice_notes(evaluation_id);
CREATE INDEX idx_evaluation_voice_notes_section ON evaluation_voice_notes(section_id);

-- RLS Policies
ALTER TABLE evaluation_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_voice_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own evaluation media"
  ON evaluation_photos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM home_evaluations
      WHERE home_evaluations.id = evaluation_photos.evaluation_id
      AND home_evaluations.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage own voice notes"
  ON evaluation_voice_notes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM home_evaluations
      WHERE home_evaluations.id = evaluation_voice_notes.evaluation_id
      AND home_evaluations.user_id = auth.uid()::text
    )
  );
```

### 5.3 Supabase Storage Buckets
```typescript
// Bucket structure:
// evaluations/
//   {userId}/
//     {homeId}/
//       photos/
//         {sectionId}/
//           {photoId}.jpg
//           {photoId}_thumb.jpg
//       voice/
//         {sectionId}/
//           {voiceNoteId}.webm

// Storage policies
const STORAGE_CONFIG = {
  maxPhotoSize: 10 * 1024 * 1024, // 10MB
  maxVoiceSize: 5 * 1024 * 1024,  // 5MB
  allowedPhotoTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedVoiceTypes: ['audio/webm', 'audio/mp4', 'audio/mpeg'],
  maxPhotosPerSection: 10,
  maxVoiceDuration: 120, // seconds
};
```

---

## 6. USER EXPERIENCE FEATURES

### 6.1 Keyboard Shortcuts
```typescript
const KEYBOARD_SHORTCUTS = {
  '1': 'rate-good',
  '2': 'rate-fair',
  '3': 'rate-poor',
  'n': 'next-item',
  'p': 'previous-item',
  'ArrowRight': 'next-section',
  'ArrowLeft': 'previous-section',
  'Escape': 'close-modal',
  'ctrl+s': 'force-save',
};

function useKeyboardShortcuts(handlers: KeyboardHandlers) {
  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      // Ignore if typing in input/textarea
      if (e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement) {
        if (e.key !== 'Escape') return;
      }

      const action = KEYBOARD_SHORTCUTS[e.key];
      if (action && handlers[action]) {
        e.preventDefault();
        handlers[action]();
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlers]);
}
```

### 6.2 Responsive Breakpoints
```typescript
const BREAKPOINTS = {
  mobile: '0px',      // Full screen modal, stacked layout
  tablet: '768px',    // MD - 2-column rating buttons, larger modal
  desktop: '1024px',  // LG - 3-column buttons, max-width modal
  xl: '1280px',       // XL - Wider content area
};

// Mobile adaptations:
// - Full screen modal
// - Single column layout
// - Larger touch targets (min 44px)
// - Bottom navigation
// - Swipe gestures for section navigation
// - Simplified header

// Desktop adaptations:
// - Centered modal with max-width
// - Multi-column layouts
// - Hover states
// - Keyboard shortcuts
// - Side-by-side comparisons
```

### 6.3 Progress Tracking
```typescript
interface ProgressIndicators {
  // Overall completion
  overallPercentage: number;
  completedSections: number;
  totalSections: number;

  // Per-section completion
  sectionProgress: {
    [sectionId: string]: {
      completed: number;
      total: number;
      percentage: number;
    };
  };

  // Item-level tracking
  lastEditedItem: string;
  lastEditedTime: Date;

  // Milestones
  milestones: {
    started: boolean;
    halfway: boolean;
    threeQuarters: boolean;
    completed: boolean;
  };
}
```

---

## 7. PERFORMANCE OPTIMIZATION

### 7.1 Strategies
```typescript
// 1. Lazy Loading
const RatingModal = lazy(() => import('./RatingModal'));
const MediaUpload = lazy(() => import('./MediaUpload'));

// 2. Virtualization for long lists
import { FixedSizeList } from 'react-window';

// 3. Memoization
const MemoizedRatingButton = memo(RatingButton, (prev, next) => {
  return prev.value === next.value && prev.disabled === next.disabled;
});

// 4. Debounced inputs
const debouncedOnChange = useMemo(
  () => debounce(onChange, 300),
  [onChange]
);

// 5. Batch updates
function batchRatingUpdates(ratings: RatingUpdate[]) {
  // Collect multiple rating changes
  // Send single API call
  return updateEvaluationBatch(homeId, ratings);
}

// 6. Image optimization
// - Compress uploads to max 1MB
// - Generate thumbnails server-side
// - Use WebP format when supported
// - Lazy load images below fold

// 7. Code splitting by section
const sections = {
  exteriors: lazy(() => import('./sections/Exteriors')),
  interiors: lazy(() => import('./sections/Interiors')),
  // ... etc
};
```

### 7.2 Loading States
```typescript
<Suspense fallback={<SectionSkeleton />}>
  <CurrentSection />
</Suspense>

function SectionSkeleton() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="border border-gray-200 rounded-lg p-6">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 8. ACCESSIBILITY COMPLIANCE

### 8.1 Checklist
- [ ] Semantic HTML throughout
- [ ] ARIA labels on all interactive elements
- [ ] ARIA live regions for dynamic content
- [ ] Keyboard navigation for all features
- [ ] Focus indicators visible and clear
- [ ] Color contrast ratios meet WCAG AA (4.5:1)
- [ ] Screen reader announcements for state changes
- [ ] Alt text for all images
- [ ] Form labels associated with inputs
- [ ] Error messages programmatically associated
- [ ] Skip links for navigation
- [ ] Tab order logical and intuitive

### 8.2 ARIA Implementation
```typescript
<div role="dialog" aria-labelledby="modal-title" aria-modal="true">
  <h2 id="modal-title">Home Evaluation</h2>

  <div role="region" aria-label="Rating section">
    <button
      onClick={handleRate}
      aria-label={`Rate ${item.label} as Good - 5 points`}
      aria-pressed={rating === 'good'}
    >
      Good
    </button>
  </div>

  <div role="status" aria-live="polite" aria-atomic="true">
    {isSaving ? 'Saving...' : 'Saved'}
  </div>

  <div role="progressbar" aria-valuenow={completionPercentage} aria-valuemin="0" aria-valuemax="100">
    {completionPercentage}% Complete
  </div>
</div>
```

---

## 9. IMPLEMENTATION PHASES

### Phase 1: Foundation (Week 1)
- [ ] Create TypeScript interfaces
- [ ] Set up database schema and migrations
- [ ] Implement basic HomeDetailView routing
- [ ] Build hero section and summary cards

### Phase 2: Rating System (Week 2)
- [ ] Create RatingModal shell
- [ ] Implement section navigation
- [ ] Build RatingButton components
- [ ] Add rating state management
- [ ] Implement overall rating calculation

### Phase 3: Enhanced Features (Week 3)
- [ ] Add notes functionality (item + section)
- [ ] Implement auto-save with debouncing
- [ ] Build progress tracking
- [ ] Add keyboard shortcuts
- [ ] Create loading and error states

### Phase 4: Media (Week 4)
- [ ] Set up Supabase storage buckets
- [ ] Implement photo upload
- [ ] Add thumbnail generation
- [ ] Build voice note recording
- [ ] Create media galleries

### Phase 5: Polish (Week 5)
- [ ] Responsive design refinements
- [ ] Accessibility audit and fixes
- [ ] Performance optimization
- [ ] User testing and feedback
- [ ] Bug fixes and edge cases

---

## 10. SUCCESS METRICS

### 10.1 Performance Targets
- Initial page load: < 2 seconds
- Modal open time: < 300ms
- Rating button response: < 100ms
- Auto-save completion: < 500ms
- Image upload: < 5 seconds (10MB)
- Voice recording: < 100ms latency

### 10.2 User Experience Goals
- Completion rate: > 80% of started evaluations
- Average time to complete: < 30 minutes
- User satisfaction: > 4.5/5 stars
- Mobile completion rate: > 70%
- Accessibility score: 100% WCAG AA

---

This specification provides a complete blueprint for implementing the Home Detail View and advanced rating system. The modular approach allows for incremental development while maintaining a clear vision of the final product.
