import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Home as HomeIcon, Heart, X, Mountain, Printer, ChevronDown } from 'lucide-react';
import { EvaluateTabType, Home, AddHomeFormData } from '../types';
import { loadHomes, addHome, updateHome } from '../lib/supabaseClient';
import InspectionView from '../components/inspection/InspectionView';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/ToastContainer';
import { useAuth } from '../contexts/AuthContext';

export default function EvaluateTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<EvaluateTabType>('browse');
  const [homes, setHomes] = useState<Home[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [fadeTransition, setFadeTransition] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadHomesData();
  }, [user?.id]);

  const loadHomesData = async () => {
    setIsLoading(true);
    try {
      // Load homes for authenticated users only, otherwise show empty
      if (user?.id) {
        const { data } = await loadHomes(user.id);
        if (data) {
          setHomes(data);
        }
      } else {
        setHomes([]);
      }
    } catch (err) {
      console.error('Error loading homes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (newTab: EvaluateTabType) => {
    setFadeTransition(true);
    setTimeout(() => {
      setActiveTab(newTab);
      setFadeTransition(false);
    }, 150);
  };

  const handlePreviousTab = () => {
    const tabs: EvaluateTabType[] = ['browse', 'compare', 'inspection'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      handleTabChange(tabs[currentIndex - 1]);
    }
  };

  const handleNextTab = () => {
    const tabs: EvaluateTabType[] = ['browse', 'compare', 'inspection'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      handleTabChange(tabs[currentIndex + 1]);
    }
  };

  const handleAddHome = async (formData: AddHomeFormData) => {
    if (!user?.id) {
      navigate('/signin', { state: { returnTo: window.location.pathname } });
      return;
    }

    const result = await addHome(user.id, formData);
    if (result.success && result.home) {
      setHomes([result.home, ...homes]);
      setShowAddModal(false);
      showSuccess('Home added successfully!');
    } else {
      showError('Failed to add home. Please try again.');
    }
  };

  const handleToggleFavorite = async (homeId: string) => {
    const home = homes.find((h) => h.id === homeId);
    if (!home) return;

    const newFavoriteState = !home.favorite;
    setHomes(homes.map((h) => (h.id === homeId ? { ...h, favorite: newFavoriteState } : h)));

    await updateHome(homeId, { favorite: newFavoriteState });
  };

  const handleToggleCompare = async (homeId: string) => {
    const home = homes.find((h) => h.id === homeId);
    if (!home) return;

    const selectedCount = homes.filter((h) => h.compareSelected).length;
    if (!home.compareSelected && selectedCount >= 3) {
      alert('You can only compare up to 3 homes at a time');
      return;
    }

    const newCompareState = !home.compareSelected;
    setHomes(homes.map((h) => (h.id === homeId ? { ...h, compareSelected: newCompareState } : h)));

    await updateHome(homeId, { compareSelected: newCompareState });
  };

  const compareCount = homes.filter((h) => h.compareSelected).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Evaluation</h1>

        <div className="relative">
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePreviousTab}
                className="hidden md:block p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={activeTab === 'browse'}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <nav className="flex-1 flex space-x-8 justify-center" aria-label="Tabs">
                {(['browse', 'compare', 'inspection'] as EvaluateTabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={
                      `relative py-4 px-1 text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? 'text-primary-400 border-b-2 border-primary-400'
                          : 'text-gray-500 hover:text-gray-700'
                      }`
                    }
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {tab === 'compare' && compareCount > 0 && (
                      <span className="ml-1 px-2 py-0.5 bg-primary-400 text-white text-xs rounded-full">
                        {compareCount}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              <button
                onClick={handleNextTab}
                className="hidden md:block p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={activeTab === 'inspection'}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="text-center mt-2 text-xs text-gray-500">
            <span className="md:hidden">Swipe left to {activeTab === 'browse' ? 'Compare' : 'Inspection'}</span>
            <span className="hidden md:inline">Click arrows to switch tabs</span>
          </div>
        </div>
      </div>

      <div className={`transition-opacity duration-300 ${fadeTransition ? 'opacity-0' : 'opacity-100'}`}>
        {activeTab === 'browse' && (
          <BrowseView
            homes={homes}
            isLoading={isLoading}
            onAddHome={() => setShowAddModal(true)}
            onToggleFavorite={handleToggleFavorite}
            onToggleCompare={handleToggleCompare}
            compareCount={compareCount}
          />
        )}
        {activeTab === 'compare' && (
          <CompareView
            homes={homes.filter((h) => h.compareSelected)}
            onRemoveFromCompare={handleToggleCompare}
            onBackToBrowse={() => setActiveTab('browse')}
            onClearAll={() => {
              homes.filter((h) => h.compareSelected).forEach((h) => handleToggleCompare(h.id));
            }}
          />
        )}
        {activeTab === 'inspection' && (
          <InspectionView homes={homes} onBackToBrowse={() => setActiveTab('browse')} />
        )}
      </div>

      {showAddModal && (
        <AddHomeModal onClose={() => setShowAddModal(false)} onSubmit={handleAddHome} />
      )}
    </div>
  );
}

interface BrowseViewProps {
  homes: Home[];
  isLoading: boolean;
  onAddHome: () => void;
  onToggleFavorite: (homeId: string) => void;
  onToggleCompare: (homeId: string) => void;
  compareCount: number;
}

function BrowseView({
  homes,
  isLoading,
  onAddHome,
  onToggleFavorite,
  onToggleCompare,
  compareCount,
}: BrowseViewProps) {
  const navigate = useNavigate();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (homes.length === 0) {
    return (
      <EmptyState
        icon="🏠"
        title="You haven't added any homes yet"
        description="Start by browsing listings on Realtor.ca or Zolo.ca, then add homes here to rate, compare, and track them."
        actionLabel="+ Add Your First Home"
        onAction={onAddHome}
      />
    );
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {homes.map((home) => (
          <HomeCard
            key={home.id}
            home={home}
            onToggleFavorite={onToggleFavorite}
            onToggleCompare={onToggleCompare}
            onCardClick={() => navigate(`/evaluate/${home.id}`)}
          />
        ))}
      </div>

      <button
        onClick={onAddHome}
        className="fixed bottom-6 right-6 md:right-8 lg:right-12 w-14 h-14 bg-primary-400 text-white rounded-full shadow-lg hover:bg-primary-500 transition-all hover:scale-110 flex items-center justify-center z-10"
        title="Add a home"
      >
        <Plus className="w-6 h-6" />
      </button>

      {compareCount >= 2 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-primary-400 text-white px-6 py-3 rounded-full shadow-lg z-10 flex items-center gap-2">
          <span className="font-medium">Compare {compareCount} Homes</span>
        </div>
      )}
    </div>
  );
}

interface HomeCardProps {
  home: Home;
  onToggleFavorite: (homeId: string) => void;
  onToggleCompare: (homeId: string) => void;
  onCardClick: () => void;
}

function HomeCard({ home, onToggleFavorite, onToggleCompare, onCardClick }: HomeCardProps) {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadgeColor = (status: Home['evaluationStatus']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Home['evaluationStatus']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  };

  return (
    <div
      onClick={onCardClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
    >
      <div className="relative h-48 bg-gray-200">
        {home.primaryPhoto ? (
          <img src={home.primaryPhoto} alt={home.address} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Mountain className="w-16 h-16 text-gray-400" />
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(home.id);
          }}
          className="absolute top-3 right-3 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md"
        >
          <Heart
            className={`w-5 h-5 ${home.favorite ? 'fill-primary-400 text-primary-400' : 'text-gray-600'}`}
          />
        </button>

        <label
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 left-3 flex items-center gap-2 bg-white/90 px-3 py-2 rounded-lg shadow-md hover:bg-white transition-colors cursor-pointer"
        >
          <input
            type="checkbox"
            checked={home.compareSelected}
            onChange={() => onToggleCompare(home.id)}
            className="w-4 h-4 text-primary-400 border-gray-300 rounded focus:ring-primary-400"
          />
          <span className="text-xs font-medium text-gray-700">Compare</span>
        </label>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{home.address}</h3>
        <p className="text-sm text-gray-600 mb-3">{home.neighborhood}</p>

        <p className="text-xl font-bold text-primary-400 mb-2">{formatCurrency(home.price)}</p>

        <p className="text-sm text-gray-600 mb-3">
          {home.bedrooms} bd • {home.bathrooms} ba
          {home.squareFootage && ` • ${home.squareFootage.toLocaleString()} sq ft`}
        </p>

        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(home.evaluationStatus)}`}>
            {getStatusLabel(home.evaluationStatus)}
          </span>

          {home.offerIntent && (
            <span className="text-xs text-gray-600">
              Offer: <span className="font-medium capitalize">{home.offerIntent}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface AddHomeModalProps {
  onClose: () => void;
  onSubmit: (formData: AddHomeFormData) => void;
}

const BEDROOM_OPTIONS = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5+', value: 5 },
];

const BATHROOM_OPTIONS = [
  { label: '1', value: 1 },
  { label: '1.5', value: 1.5 },
  { label: '2', value: 2 },
  { label: '2.5', value: 2.5 },
  { label: '3', value: 3 },
  { label: '3.5', value: 3.5 },
  { label: '4+', value: 4 },
];

function AddHomeModal({ onClose, onSubmit }: AddHomeModalProps) {
  const [formData, setFormData] = useState<AddHomeFormData>({
    address: '',
    neighborhood: '',
    price: 0,
    bedrooms: 0,
    bathrooms: 0,
    yearBuilt: undefined,
    propertyTaxes: undefined,
    squareFootage: undefined,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AddHomeFormData, string>>>({});

  const handleChange = (field: keyof AddHomeFormData, value: string | number | undefined) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AddHomeFormData, string>> = {};

    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (formData.bedrooms <= 0) newErrors.bedrooms = 'Bedrooms is required';
    if (formData.bathrooms <= 0) newErrors.bathrooms = 'Bathrooms is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const isValid =
    formData.address.trim() &&
    formData.price > 0 &&
    formData.bedrooms > 0 &&
    formData.bathrooms > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add a Home</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address <span className="text-primary-400">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className={`w-full h-12 px-4 border rounded-md focus:ring-2 transition-colors ${
                  errors.address
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                    : 'border-gray-300 focus:border-primary-400 focus:ring-primary-100'
                }`}
                placeholder="123 Main Street"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Neighborhood
              </label>
              <input
                type="text"
                value={formData.neighborhood || ''}
                onChange={(e) => handleChange('neighborhood', e.target.value || undefined)}
                className="w-full h-12 px-4 border border-gray-300 rounded-md focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-colors"
                placeholder="Downtown Toronto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price <span className="text-primary-400">*</span>
              </label>
              <input
                type="number"
                value={formData.price || ''}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                className={`w-full h-12 px-4 border rounded-md focus:ring-2 transition-colors ${
                  errors.price
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                    : 'border-gray-300 focus:border-primary-400 focus:ring-primary-100'
                }`}
                placeholder="500000"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms <span className="text-primary-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.bedrooms || ''}
                  onChange={(e) => handleChange('bedrooms', parseFloat(e.target.value) || 0)}
                  className={`w-full h-12 px-4 pr-10 border rounded-md focus:ring-2 transition-colors appearance-none bg-white ${
                    errors.bedrooms
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : 'border-gray-300 focus:border-primary-400 focus:ring-primary-100'
                  }`}
                >
                  <option value="">Select...</option>
                  {BEDROOM_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bathrooms <span className="text-primary-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.bathrooms || ''}
                  onChange={(e) => handleChange('bathrooms', parseFloat(e.target.value) || 0)}
                  className={`w-full h-12 px-4 pr-10 border rounded-md focus:ring-2 transition-colors appearance-none bg-white ${
                    errors.bathrooms
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : 'border-gray-300 focus:border-primary-400 focus:ring-primary-100'
                  }`}
                >
                  <option value="">Select...</option>
                  {BATHROOM_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year Built</label>
              <input
                type="number"
                value={formData.yearBuilt || ''}
                onChange={(e) => handleChange('yearBuilt', parseInt(e.target.value) || undefined)}
                className="w-full h-12 px-4 border border-gray-300 rounded-md focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-colors"
                placeholder="2020"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Taxes</label>
              <input
                type="number"
                value={formData.propertyTaxes || ''}
                onChange={(e) => handleChange('propertyTaxes', parseFloat(e.target.value) || undefined)}
                className="w-full h-12 px-4 border border-gray-300 rounded-md focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-colors"
                placeholder="5000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Square Footage
              </label>
              <input
                type="number"
                value={formData.squareFootage || ''}
                onChange={(e) => handleChange('squareFootage', parseInt(e.target.value) || undefined)}
                className="w-full h-12 px-4 border border-gray-300 rounded-md focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-colors"
                placeholder="1500"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="flex-1 px-6 py-3 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Home
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CompareViewProps {
  homes: Home[];
  onRemoveFromCompare: (homeId: string) => void;
  onBackToBrowse: () => void;
  onClearAll: () => void;
}

function CompareView({ homes, onRemoveFromCompare, onBackToBrowse, onClearAll }: CompareViewProps) {
  if (homes.length < 2) {
    return (
      <EmptyState
        icon="⚖️"
        title="Pick at least 2 homes to compare"
        description="Select homes using the 'Compare' checkbox in the Browse view, then come back here to see them side-by-side."
        actionLabel="Go to Browse"
        onAction={onBackToBrowse}
      />
    );
  }

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

  return (
    <div className="pb-8">
      <div className="mb-6 no-print">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Comparing {homes.length} homes</h2>
            <p className="text-sm text-gray-600 mt-1">
              Side-by-side comparison of selected properties
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Comparison
            </button>
            <button
              onClick={onBackToBrowse}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Browse
            </button>
          </div>
        </div>
        <button
          onClick={onClearAll}
          className="text-sm text-primary-400 hover:text-primary-500 transition-colors"
        >
          Clear all selections
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="sticky left-0 bg-white z-10 w-[30%] p-4 text-left">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Property Details
                </span>
              </th>
              {homes.map((home) => (
                <th key={home.id} className="p-4 bg-gray-50 min-w-[280px]">
                  <div className="relative">
                    <button
                      onClick={() => onRemoveFromCompare(home.id)}
                      className="no-print absolute top-0 right-0 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                      title="Remove from comparison"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                    <div className="mb-3">
                      {home.primaryPhoto ? (
                        <img
                          src={home.primaryPhoto}
                          alt={home.address}
                          className="w-full h-28 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-28 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Mountain className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-2">
                        {home.address}
                      </h3>
                      <p className="text-sm text-gray-600">{home.neighborhood}</p>
                      {home.favorite && (
                        <div className="mt-2 flex items-center gap-1 text-red-400">
                          <Heart className="w-4 h-4 fill-current" />
                          <span className="text-xs font-medium">Favorited</span>
                        </div>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <ComparisonSection title="BASIC INFORMATION">
              <ComparisonRow label="Price">
                {homes.map((home) => (
                  <td key={home.id} className="p-4 text-center">
                    <span className="text-xl font-bold text-primary-400">
                      {formatCurrency(home.price)}
                    </span>
                  </td>
                ))}
              </ComparisonRow>
              <ComparisonRow label="Bedrooms">
                {homes.map((home) => (
                  <td key={home.id} className="p-4 text-center text-gray-900">
                    {home.bedrooms}
                  </td>
                ))}
              </ComparisonRow>
              <ComparisonRow label="Bathrooms">
                {homes.map((home) => (
                  <td key={home.id} className="p-4 text-center text-gray-900">
                    {home.bathrooms}
                  </td>
                ))}
              </ComparisonRow>
              <ComparisonRow label="Year Built">
                {homes.map((home) => (
                  <td key={home.id} className="p-4 text-center text-gray-900">
                    {home.yearBuilt || '---'}
                  </td>
                ))}
              </ComparisonRow>
              <ComparisonRow label="Square Footage">
                {homes.map((home) => (
                  <td key={home.id} className="p-4 text-center text-gray-900">
                    {home.squareFootage ? home.squareFootage.toLocaleString() : '---'}
                  </td>
                ))}
              </ComparisonRow>
              <ComparisonRow label="Property Taxes (Annual)">
                {homes.map((home) => (
                  <td key={home.id} className="p-4 text-center text-gray-900">
                    {home.propertyTaxes ? formatCurrency(home.propertyTaxes) : '---'}
                  </td>
                ))}
              </ComparisonRow>
              <ComparisonRow label="Overall Rating">
                {homes.map((home) => (
                  <td key={home.id} className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-semibold text-gray-900">
                        {home.overallRating.toFixed(1)}
                      </span>
                      <span className="text-gray-500 text-sm">/5.0</span>
                    </div>
                  </td>
                ))}
              </ComparisonRow>
              <ComparisonRow label="Offer Intent">
                {homes.map((home) => (
                  <td key={home.id} className="p-4 text-center">
                    {home.offerIntent ? (
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          home.offerIntent === 'yes'
                            ? 'bg-green-100 text-green-800'
                            : home.offerIntent === 'maybe'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <span>
                          {home.offerIntent === 'yes' ? '🟢' : home.offerIntent === 'maybe' ? '🟡' : '🔴'}
                        </span>
                        {home.offerIntent.charAt(0).toUpperCase() + home.offerIntent.slice(1)}
                      </span>
                    ) : (
                      <span className="text-gray-400">---</span>
                    )}
                  </td>
                ))}
              </ComparisonRow>
            </ComparisonSection>

            <ComparisonSection title="EVALUATION STATUS">
              <ComparisonRow label="Evaluation Status">
                {homes.map((home) => (
                  <td key={home.id} className="p-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        home.evaluationStatus === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : home.evaluationStatus === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {home.evaluationStatus === 'completed'
                        ? 'Completed'
                        : home.evaluationStatus === 'in_progress'
                        ? 'In Progress'
                        : 'Not Started'}
                    </span>
                  </td>
                ))}
              </ComparisonRow>
            </ComparisonSection>

            <tr className="bg-gray-50">
              <td colSpan={homes.length + 1} className="p-4 text-center text-sm text-gray-600">
                <p className="mb-2">
                  Detailed evaluation data will be available once you complete the evaluation for each
                  home.
                </p>
                <p className="text-xs text-gray-500">
                  Categories include: Exteriors, Interiors, Kitchen, Home Systems, Location, Additional
                  Features, Smart Features, and Monthly Costs.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ComparisonSectionProps {
  title: string;
  children: React.ReactNode;
}

function ComparisonSection({ title, children }: ComparisonSectionProps) {
  return (
    <>
      <tr className="bg-gray-100">
        <td colSpan={100} className="px-4 py-3 text-left">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{title}</span>
        </td>
      </tr>
      {children}
    </>
  );
}

interface ComparisonRowProps {
  label: string;
  children: React.ReactNode;
}

function ComparisonRow({ label, children }: ComparisonRowProps) {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="sticky left-0 bg-white px-4 py-3 text-sm font-medium text-gray-700 border-r border-gray-200">
        {label}
      </td>
      {children}
    </tr>
  );
}

function InspectionPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <HomeIcon className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Home Inspections</h3>
      <p className="text-gray-500 text-center max-w-md">
        Track inspection reports, findings, and recommendations for each home. This feature is coming
        soon!
      </p>
    </div>
  );
}
