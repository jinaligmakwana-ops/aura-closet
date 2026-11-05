import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Heart,
  Edit2,
  Trash2,
  CheckCircle2,
  SlidersHorizontal,
  Droplets,
  Shirt,
  Sparkles,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import {
  ClothingCategory,
  ClothingItem,
  Occasion,
  Season,
  WarmthLevel,
} from '../types/wardrobe';

interface ClosetViewProps {
  wardrobe: ClothingItem[];
  onOpenAddModal: () => void;
  onEditItem: (item: ClothingItem) => void;
  onDeleteItem: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onLoadSampleCloset: () => void;
  onLogWearItem: (item: ClothingItem) => void;
}

const CATEGORY_TABS: { label: string; value: ClothingCategory | 'all'; emoji: string }[] = [
  { label: 'All Items', value: 'all', emoji: '✨' },
  { label: 'Tops', value: 'top', emoji: '👕' },
  { label: 'Bottoms', value: 'bottom', emoji: '👖' },
  { label: 'Dresses', value: 'dress', emoji: '👗' },
  { label: 'Outerwear', value: 'outerwear', emoji: '🧥' },
  { label: 'Shoes', value: 'shoes', emoji: '👟' },
  { label: 'Accessories', value: 'accessory', emoji: '🧣' },
];

export const ClosetView: React.FC<ClosetViewProps> = ({
  wardrobe,
  onOpenAddModal,
  onEditItem,
  onDeleteItem,
  onToggleFavorite,
  onLoadSampleCloset,
  onLogWearItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarmth, setSelectedWarmth] = useState<WarmthLevel | 'all'>('all');
  const [selectedSeason, setSelectedSeason] = useState<Season | 'all'>('all');
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | 'all'>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Category counts
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: wardrobe.length };
    for (const item of wardrobe) {
      map[item.category] = (map[item.category] || 0) + 1;
    }
    return map;
  }, [wardrobe]);

  // Filter items
  const filteredItems = useMemo(() => {
    return wardrobe.filter((item) => {
      // Category
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

      // Favorites
      if (onlyFavorites && !item.isFavorite) return false;

      // Warmth
      if (selectedWarmth !== 'all' && item.warmth !== selectedWarmth) return false;

      // Season
      if (selectedSeason !== 'all' && !item.seasons.includes(selectedSeason)) return false;

      // Occasion
      if (selectedOccasion !== 'all' && !item.occasions.includes(selectedOccasion)) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesBrand = item.brand?.toLowerCase().includes(q);
        const matchesNotes = item.notes?.toLowerCase().includes(q);
        const matchesColor = item.colorName?.toLowerCase().includes(q);
        const matchesSub = item.subCategory?.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesNotes && !matchesColor && !matchesSub) {
          return false;
        }
      }

      return true;
    });
  }, [wardrobe, selectedCategory, onlyFavorites, selectedWarmth, selectedSeason, selectedOccasion, searchQuery]);

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    onlyFavorites ||
    selectedWarmth !== 'all' ||
    selectedSeason !== 'all' ||
    selectedOccasion !== 'all' ||
    searchQuery.trim() !== '';

  const clearFilters = () => {
    setSelectedCategory('all');
    setOnlyFavorites(false);
    setSelectedWarmth('all');
    setSelectedSeason('all');
    setSelectedOccasion('all');
    setSearchQuery('');
  };

  const getWarmthBadge = (warmth: WarmthLevel) => {
    switch (warmth) {
      case 'light':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">Light</span>;
      case 'moderate':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">Moderate</span>;
      case 'warm':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200">Warm</span>;
      case 'heavy':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">Heavy</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            My Digital Wardrobe
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Organize your clothes, track wear frequency, and curate versatile looks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {wardrobe.length === 0 && (
            <button
              onClick={onLoadSampleCloset}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-stone-300 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Load Sample Closet</span>
            </button>
          )}

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all hover:shadow hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Item</span>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORY_TABS.map((cat) => {
          const count = counts[cat.value] || 0;
          const isActive = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium shrink-0 transition-all ${
                isActive
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400 hover:text-stone-900'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/90 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search garments by name, brand, color, silhouette..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-stone-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filter Selects */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Warmth Select */}
            <select
              value={selectedWarmth}
              onChange={(e) => setSelectedWarmth(e.target.value as WarmthLevel | 'all')}
              className="px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-700 text-xs focus:outline-none"
            >
              <option value="all">All Warmth Levels</option>
              <option value="light">Light (&gt; 22°C)</option>
              <option value="moderate">Moderate (16–22°C)</option>
              <option value="warm">Warm (10–16°C)</option>
              <option value="heavy">Heavy (&lt; 10°C)</option>
            </select>

            {/* Season Select */}
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value as Season | 'all')}
              className="px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-700 text-xs focus:outline-none"
            >
              <option value="all">All Seasons</option>
              <option value="spring">Spring</option>
              <option value="summer">Summer</option>
              <option value="autumn">Autumn</option>
              <option value="winter">Winter</option>
            </select>

            {/* Occasion Select */}
            <select
              value={selectedOccasion}
              onChange={(e) => setSelectedOccasion(e.target.value as Occasion | 'all')}
              className="px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-700 text-xs focus:outline-none capitalize"
            >
              <option value="all">All Occasions</option>
              <option value="casual">Casual</option>
              <option value="work">Work</option>
              <option value="formal">Formal</option>
              <option value="sporty">Sporty</option>
              <option value="lounge">Lounge</option>
              <option value="party">Party</option>
            </select>

            {/* Favorites Toggle */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                onlyFavorites
                  ? 'bg-rose-50 text-rose-700 border-rose-200 font-semibold'
                  : 'bg-stone-50/50 text-stone-600 border-stone-200 hover:text-stone-900'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>Favorites</span>
            </button>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-amber-700 hover:underline px-2 py-1 font-medium"
              >
                Reset All
              </button>
            )}
          </div>
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-100">
          <span>
            Showing <strong className="font-semibold text-stone-800">{filteredItems.length}</strong> of{' '}
            {wardrobe.length} garments
          </span>
          {onlyFavorites && (
            <span className="text-rose-600 font-medium">Filtered by Favorites</span>
          )}
        </div>
      </div>

      {/* Wardrobe Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-md hover:border-stone-300 transition-all flex flex-col"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Top Overlay Icons */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-stone-800 px-2 py-0.5 rounded-full shadow-xs">
                    {item.category}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                    className={`p-1.5 rounded-full backdrop-blur-md transition-all shadow-xs ${
                      item.isFavorite
                        ? 'bg-rose-500 text-white'
                        : 'bg-white/80 text-stone-600 hover:text-rose-500 hover:bg-white'
                    }`}
                    title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-white' : ''}`} />
                  </button>
                </div>

                {/* Bottom Overlay Badges */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  {getWarmthBadge(item.warmth)}

                  {item.waterproof && (
                    <span
                      title="Waterproof / Rain resistant"
                      className="p-1 rounded-full bg-white/90 text-sky-600 backdrop-blur-xs shadow-xs"
                    >
                      <Droplets className="w-3 h-3 fill-sky-500" />
                    </span>
                  )}
                </div>
              </div>

              {/* Item Info */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-sm font-bold text-stone-900 line-clamp-1 group-hover:text-amber-800 transition-colors">
                    {item.name}
                  </h3>

                  <div className="flex items-center gap-1.5 mt-1 text-xs text-stone-500">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: item.color }}
                      title={item.colorName || item.color}
                    />
                    <span className="truncate text-[11px]">{item.colorName || 'Custom'}</span>
                    {item.brand && (
                      <>
                        <span className="text-stone-300">•</span>
                        <span className="truncate text-[11px] text-stone-400">{item.brand}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Wear Metrics & Action Buttons */}
                <div className="pt-3 mt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[10px] text-stone-500 font-medium">
                    {item.wearCount > 0 ? `Worn ${item.wearCount}x` : 'Unworn'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onLogWearItem(item)}
                      title="Mark as worn today"
                      className="p-1.5 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEditItem(item)}
                      title="Edit garment"
                      className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(item.id)}
                      title="Delete piece"
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Confirm Delete Popup */}
              {confirmDeleteId === item.id && (
                <div className="p-3 bg-rose-50 border-t border-rose-200 animate-in fade-in">
                  <p className="text-[11px] text-rose-800 font-medium mb-2">Delete this piece?</p>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-[10px] px-2 py-1 rounded bg-white text-stone-600 border border-stone-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onDeleteItem(item.id);
                        setConfirmDeleteId(null);
                      }}
                      className="text-[10px] px-2 py-1 rounded bg-rose-600 text-white font-medium hover:bg-rose-700"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/90 shadow-sm max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
            <Shirt className="w-8 h-8 stroke-1" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
            {wardrobe.length === 0 ? 'Your Closet is Empty' : 'No Garments Match Filters'}
          </h3>
          <p className="text-stone-500 text-xs sm:text-sm mb-6 leading-relaxed">
            {wardrobe.length === 0
              ? 'Add pictures of your clothes to begin receiving personalized outfit recommendations tailored to live weather.'
              : 'Try clearing your search query or loosening season and warmth filters to see more pieces.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {wardrobe.length === 0 ? (
              <>
                <button
                  onClick={onOpenAddModal}
                  className="px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 shadow-sm transition-all"
                >
                  Add Your First Piece
                </button>
                <button
                  onClick={onLoadSampleCloset}
                  className="px-5 py-2.5 rounded-full border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Load Sample Wardrobe</span>
                </button>
              </>
            ) : (
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

