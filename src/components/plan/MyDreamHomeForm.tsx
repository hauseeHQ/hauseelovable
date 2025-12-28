import { useState, useEffect, useCallback } from 'react';
import { X, MapPin, Home, DollarSign, Bed, Wrench, Calendar, Edit2 } from 'lucide-react';
import { DreamHome, DreamHomeFormErrors, ONTARIO_CITIES, PropertyType, PriorityLevel, MaxCommute, NeighborhoodVibe } from '../../types';
import { saveDreamHome, loadDreamHome } from '../../lib/supabaseClient';
import DualRangeSlider from './DualRangeSlider';
import CustomSelect from './CustomSelect';
import PriorityPillGroup from './PriorityPillGroup';
import HomeTypeCard from './HomeTypeCard';
import ImportanceScale from './ImportanceScale';
import CollapsibleSection from './CollapsibleSection';

const INITIAL_FORM_STATE: DreamHome = {
  constructionStatus: null,
  priceRange: {
    min: 400000,
    max: 800000,
  },
  preferredCities: [],
  propertyTypes: [],
  bedrooms: null,
  bathrooms: null,
  maxCondoFees: null,
  backyard: null,
  parkingPriority: null,
  outdoorSpacePriority: null,
  basementPriority: null,
  maxCommute: null,
  schoolProximityImportance: null,
  walkabilityImportance: null,
  neighborhoodVibe: null,
  timeline: null,
  notes: '',
  isComplete: false,
  completedAt: null,
  updatedAt: new Date().toISOString(),
};

const TEMP_USER_ID = 'temp-user-demo';

const BEDROOM_OPTIONS = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5+', value: '5+' },
];

const BATHROOM_OPTIONS = [
  { label: '1', value: '1' },
  { label: '1.5', value: '1.5' },
  { label: '2', value: '2' },
  { label: '2.5', value: '2.5' },
  { label: '3', value: '3' },
  { label: '3.5', value: '3.5' },
  { label: '4+', value: '4+' },
];

const TIMELINE_OPTIONS = [
  { label: '0-6 months', value: '0-6 months' },
  { label: '6-12 months', value: '6-12 months' },
  { label: '12-24 months', value: '12-24 months' },
  { label: '2+ years', value: '2+ years' },
];

const COMMUTE_OPTIONS = [
  { label: '15 min', value: '15' },
  { label: '30 min', value: '30' },
  { label: '45 min', value: '45' },
  { label: '60 min', value: '60' },
  { label: 'Not a factor', value: 'not-a-factor' },
];

const HOME_TYPES: { type: PropertyType; label: string }[] = [
  { type: 'condo', label: 'Condo / Condo Townhouse' },
  { type: 'freehold-townhouse', label: 'Freehold Townhouse' },
  { type: 'semi-detached', label: 'Semi-Detached' },
  { type: 'detached', label: 'Detached' },
];

const NEIGHBORHOOD_OPTIONS: { value: NeighborhoodVibe; label: string }[] = [
  { value: 'quiet', label: 'Quiet' },
  { value: 'lively', label: 'Lively' },
  { value: 'no-preference', label: 'No preference' },
];

export default function MyDreamHomeForm() {
  const userId = TEMP_USER_ID;
  const [formData, setFormData] = useState<DreamHome>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<DreamHomeFormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const localData = localStorage.getItem(`hausee_dream_home_${userId}`);

      const { data: dbData } = await loadDreamHome(userId);

      if (dbData) {
        setFormData(dbData);
        setLastSaved(dbData.updatedAt);
        setIsEditMode(!dbData.isComplete);
      } else if (localData) {
        const parsed = JSON.parse(localData);
        setFormData(parsed);
        setLastSaved(parsed.updatedAt);
        setIsEditMode(!parsed.isComplete);
      } else {
        setIsEditMode(true);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setIsEditMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSave = useCallback(
    (data: DreamHome) => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      const timeout = setTimeout(async () => {
        setIsSaving(true);
        const updatedData = { ...data, updatedAt: new Date().toISOString() };

        localStorage.setItem(
          `hausee_dream_home_${userId}`,
          JSON.stringify(updatedData)
        );

        const result = await saveDreamHome(userId, updatedData);

        if (result.success) {
          setLastSaved(updatedData.updatedAt);
        }

        setIsSaving(false);
      }, 1000);

      setSaveTimeout(timeout);
    },
    [saveTimeout, userId]
  );

  const updateField = <K extends keyof DreamHome>(
    field: K,
    value: DreamHome[K]
  ) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    debouncedSave(newData);

    if (errors[field as keyof DreamHomeFormErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: DreamHomeFormErrors = {};

    if (formData.preferredCities.length === 0) {
      newErrors.preferredCities = 'Please select at least one city';
    }

    if (formData.preferredCities.length > 3) {
      newErrors.preferredCities = 'You can select up to 3 cities';
    }

    if (!formData.propertyTypes || formData.propertyTypes.length === 0) {
      newErrors.propertyTypes = 'Please select at least one home type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveCompletion = async () => {
    if (!validateForm()) {
      return;
    }

    const completedData = {
      ...formData,
      isComplete: true,
      completedAt: formData.completedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setFormData(completedData);
    localStorage.setItem(
      `hausee_dream_home_${userId}`,
      JSON.stringify(completedData)
    );

    const result = await saveDreamHome(userId, completedData);

    if (result.success) {
      setLastSaved(completedData.updatedAt);
      setIsEditMode(false);
    }
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    updateField('priceRange', { min, max });
  };

  const addCity = (city: string) => {
    if (formData.preferredCities.length >= 3) {
      setErrors({ ...errors, preferredCities: 'You can select up to 3 cities' });
      return;
    }

    const trimmedCity = city.trim();
    if (!trimmedCity) return;

    if (!formData.preferredCities.includes(trimmedCity)) {
      updateField('preferredCities', [...formData.preferredCities, trimmedCity]);
    }

    setCitySearch('');
    setShowCityDropdown(false);
  };

  const handleCityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && citySearch.trim()) {
      e.preventDefault();
      addCity(citySearch);
    }
  };

  const removeCity = (city: string) => {
    updateField(
      'preferredCities',
      formData.preferredCities.filter(c => c !== city)
    );
    if (errors.preferredCities) {
      setErrors({ ...errors, preferredCities: undefined });
    }
  };

  const toggleHomeType = (type: PropertyType) => {
    const currentTypes = formData.propertyTypes || [];
    const types = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    updateField('propertyTypes', types);
  };

  const filteredCities = ONTARIO_CITIES.filter(
    city =>
      city.toLowerCase().includes(citySearch.toLowerCase()) &&
      !formData.preferredCities.includes(city)
  );

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const date = new Date(lastSaved);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isEditMode && formData.isComplete) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 max-w-3xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">My Dream Home</h2>
            <p className="text-sm text-gray-500">
              Your strategic north star for home buying decisions
            </p>
          </div>
          <button
            onClick={() => setIsEditMode(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        </div>

        <div className="space-y-6">
          <div className="border-l-4 border-primary-400 pl-4 py-2">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-gray-900">Location</h3>
            </div>
            <p className="text-gray-700">
              {formData.preferredCities.length > 0
                ? formData.preferredCities.join(', ')
                : 'No cities selected'}
            </p>
          </div>

          <div className="border-l-4 border-primary-400 pl-4 py-2">
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-gray-900">Home Type</h3>
            </div>
            <p className="text-gray-700">
              {formData.propertyTypes && formData.propertyTypes.length > 0
                ? formData.propertyTypes.map(t => HOME_TYPES.find(ht => ht.type === t)?.label).join(', ')
                : 'No types selected'}
            </p>
            {formData.constructionStatus && (
              <p className="text-sm text-gray-600 mt-1">
                {formData.constructionStatus === 'new' ? 'New Construction' : 'Ready to move in'}
              </p>
            )}
          </div>

          <div className="border-l-4 border-primary-400 pl-4 py-2">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-gray-900">Budget Comfort Zone</h3>
            </div>
            <p className="text-gray-700">
              ${formData.priceRange.min.toLocaleString()} - ${formData.priceRange.max.toLocaleString()}
            </p>
          </div>

          {(formData.parkingPriority === 'must-have' || formData.outdoorSpacePriority === 'must-have' || formData.basementPriority === 'must-have' || formData.bedrooms || formData.bathrooms) && (
            <div className="border-l-4 border-primary-400 pl-4 py-2">
              <div className="flex items-center gap-2 mb-2">
                <Bed className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-gray-900">Must-Haves</h3>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {formData.bedrooms && <li>{formData.bedrooms} bedroom{formData.bedrooms !== '1' ? 's' : ''}</li>}
                {formData.bathrooms && <li>{formData.bathrooms} bathroom{formData.bathrooms !== '1' ? 's' : ''}</li>}
                {formData.parkingPriority === 'must-have' && <li>Parking</li>}
                {formData.outdoorSpacePriority === 'must-have' && <li>Outdoor Space</li>}
                {formData.basementPriority === 'must-have' && <li>Basement</li>}
              </ul>
            </div>
          )}

          {(formData.parkingPriority === 'nice-to-have' || formData.outdoorSpacePriority === 'nice-to-have' || formData.basementPriority === 'nice-to-have') && (
            <div className="border-l-4 border-gray-300 pl-4 py-2">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="w-5 h-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Nice-to-Haves</h3>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {formData.parkingPriority === 'nice-to-have' && <li>Parking</li>}
                {formData.outdoorSpacePriority === 'nice-to-have' && <li>Outdoor Space</li>}
                {formData.basementPriority === 'nice-to-have' && <li>Basement</li>}
              </ul>
            </div>
          )}

          {(formData.maxCommute || formData.schoolProximityImportance || formData.walkabilityImportance || formData.neighborhoodVibe) && (
            <div className="border-l-4 border-primary-400 pl-4 py-2">
              <h3 className="font-semibold text-gray-900 mb-2">Lifestyle Priorities</h3>
              <div className="text-gray-700 space-y-1 text-sm">
                {formData.maxCommute && formData.maxCommute !== 'not-a-factor' && <p>Max commute to work: {formData.maxCommute} minutes</p>}
                {formData.schoolProximityImportance && <p>School proximity: {formData.schoolProximityImportance}</p>}
                {formData.walkabilityImportance && <p>Walkability: {formData.walkabilityImportance}</p>}
                {formData.neighborhoodVibe && formData.neighborhoodVibe !== 'no-preference' && <p>Neighborhood vibe: {formData.neighborhoodVibe}</p>}
              </div>
            </div>
          )}

          {formData.timeline && (
            <div className="border-l-4 border-gray-300 pl-4 py-2">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Timeline</h3>
              </div>
              <p className="text-gray-700">{formData.timeline}</p>
            </div>
          )}

          {formData.notes && (
            <div className="border-l-4 border-gray-300 pl-4 py-2">
              <h3 className="font-semibold text-gray-900 mb-2">Additional Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{formData.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Dream Home</h2>
        <p className="text-gray-600">Define your ideal home to guide your search</p>
        {lastSaved && (
          <p className="text-xs text-gray-400 mt-2">
            {isSaving ? 'Saving...' : `Saved ${formatLastSaved()}`}
          </p>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            WHERE <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            {formData.preferredCities.length} of 3 selected • Type and press Enter to add any city
          </p>
          <div className="relative">
            <input
              type="text"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              onKeyDown={handleCityKeyDown}
              onFocus={() => setShowCityDropdown(true)}
              onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
              placeholder="Search for cities or type your own..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              disabled={formData.preferredCities.length >= 3}
            />
            {showCityDropdown && (citySearch.trim() || filteredCities.length > 0) && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {citySearch.trim() && !ONTARIO_CITIES.some(c => c.toLowerCase() === citySearch.toLowerCase()) && (
                  <button
                    key="custom"
                    type="button"
                    onClick={() => addCity(citySearch)}
                    className="w-full px-4 py-2 text-left bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium border-b border-primary-200"
                  >
                    Add "{citySearch}" (press Enter)
                  </button>
                )}
                {filteredCities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => addCity(city)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700"
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
          {formData.preferredCities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.preferredCities.map((city) => (
                <span
                  key={city}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-primary-50 to-pink-50 text-primary-700 rounded-full text-sm"
                >
                  {city}
                  <button
                    type="button"
                    onClick={() => removeCity(city)}
                    className="hover:bg-primary-100 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          {errors.preferredCities && (
            <p className="text-red-500 text-sm mt-1">{errors.preferredCities}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            HOME TYPE <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">Select all types you're open to</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {HOME_TYPES.map((homeType) => (
              <HomeTypeCard
                key={homeType.type}
                type={homeType.type}
                label={homeType.label}
                selected={formData.propertyTypes?.includes(homeType.type) || false}
                onSelect={() => toggleHomeType(homeType.type)}
              />
            ))}
          </div>
          {errors.propertyTypes && (
            <p className="text-red-500 text-sm mt-2">{errors.propertyTypes}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Construction Status
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => updateField('constructionStatus', 'new')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                formData.constructionStatus === 'new'
                  ? 'border-primary-400 bg-primary-50 text-primary-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              New Construction
            </button>
            <button
              type="button"
              onClick={() => updateField('constructionStatus', 'ready')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                formData.constructionStatus === 'ready'
                  ? 'border-primary-400 bg-primary-50 text-primary-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              Ready to move in
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            BUDGET COMFORT ZONE <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Your realistic comfort range, not just max approval
          </p>
          <div className="mb-6">
            <p className="text-lg font-semibold text-gray-900 text-center">
              ${formData.priceRange.min.toLocaleString()} to ${formData.priceRange.max.toLocaleString()}
            </p>
          </div>
          <DualRangeSlider
            min={200000}
            max={2000000}
            step={10000}
            minValue={formData.priceRange.min}
            maxValue={formData.priceRange.max}
            onChange={handlePriceRangeChange}
          />
        </div>

        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-4">MUST-HAVES & PREFERENCES</h3>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <CustomSelect
                  value={formData.bedrooms}
                  onChange={(value) => updateField('bedrooms', value)}
                  options={BEDROOM_OPTIONS}
                  placeholder="Select..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <CustomSelect
                  value={formData.bathrooms}
                  onChange={(value) => updateField('bathrooms', value)}
                  options={BATHROOM_OPTIONS}
                  placeholder="Select..."
                />
              </div>
            </div>

            <PriorityPillGroup
              value={formData.parkingPriority}
              onChange={(value) => updateField('parkingPriority', value)}
              label="Parking"
            />

            <PriorityPillGroup
              value={formData.outdoorSpacePriority}
              onChange={(value) => updateField('outdoorSpacePriority', value)}
              label="Outdoor Space"
            />

            <PriorityPillGroup
              value={formData.basementPriority}
              onChange={(value) => updateField('basementPriority', value)}
              label="Basement"
            />
          </div>
        </div>

        <CollapsibleSection
          title="LIFESTYLE PRIORITIES"
          helperText="Optional but helps with recommendations"
          defaultExpanded={true}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Commute to Work
            </label>
            <CustomSelect
              value={formData.maxCommute}
              onChange={(value) => updateField('maxCommute', value as MaxCommute)}
              options={COMMUTE_OPTIONS}
              placeholder="Select..."
            />
          </div>

          <ImportanceScale
            value={formData.schoolProximityImportance}
            onChange={(value) => updateField('schoolProximityImportance', value)}
            label="School Proximity"
            helperText="How important is being near schools?"
          />

          <ImportanceScale
            value={formData.walkabilityImportance}
            onChange={(value) => updateField('walkabilityImportance', value)}
            label="Walkability"
            helperText="Access to amenities on foot"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Neighborhood Vibe
            </label>
            <div className="flex gap-2">
              {NEIGHBORHOOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateField('neighborhoodVibe', formData.neighborhoodVibe === option.value ? null : option.value)}
                  className={`flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-all ${
                    formData.neighborhoodVibe === option.value
                      ? 'bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-md'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </CollapsibleSection>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeline to Buy
          </label>
          <CustomSelect
            value={formData.timeline}
            onChange={(value) => updateField('timeline', value)}
            options={TIMELINE_OPTIONS}
            placeholder="Select..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ADDITIONAL NOTES
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Any special preferences or requirements
          </p>
          <textarea
            value={formData.notes}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                updateField('notes', e.target.value);
              }
            }}
            rows={4}
            placeholder="e.g., Must have a home office, near transit, pet-friendly building..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {formData.notes.length}/500 characters
          </p>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleSaveCompletion}
            className="w-full py-3 bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Save My Dream Home
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            You can always edit these preferences later
          </p>
        </div>
      </div>
    </div>
  );
}
