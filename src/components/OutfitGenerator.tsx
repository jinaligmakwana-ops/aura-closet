import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  RotateCcw,
  Lock,
  Unlock,
  Heart,
  Check,
  RefreshCw,
  Plus,
  ArrowRightLeft,
  ShieldCheck,
  Compass,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { ClothingCategory, ClothingItem, GeneratedOutfit, Occasion } from '../types/wardrobe';
import { WeatherData, TempUnit } from '../types/weather';
import { formatTemp } from '../services/weatherService';
import { ItemSwapModal } from './ItemSwapModal';

interface OutfitGeneratorProps {
  outfit: GeneratedOutfit | null;
  wardrobe: ClothingItem[];
  weather: WeatherData | null;
  tempUnit: TempUnit;
  occasion: Occasion | 'all';
  setOccasion: (occ: Occasion | 'all') => void;
  onGenerateNew: (locked: Record<string, ClothingItem | undefined>) => void;
  onSaveOutfit: (outfit: GeneratedOutfit) => void;
  onLogWearToday: (outfit: GeneratedOutfit) => void;
  onOpenAddModal: () => void;
  onLoadSamples: () => void;
  userName?: string;
}

export const OutfitGenerator: React.FC<OutfitGeneratorProps> = ({
  outfit,
  wardrobe,
  weather,
  tempUnit,
  occasion,
  setOccasion,
  onGenerateNew,
  onSaveOutfit,
  onLogWearToday,
  onOpenAddModal,
  onLoadSamples,
  userName = 'Jinali',
}) => {
  // State for locked items
  const [lockedSlots, setLockedSlots] = useState<{
    top?: ClothingItem;
    bottom?: ClothingItem;
    dress?: ClothingItem;
    outerwear?: ClothingItem;
    shoes?: ClothingItem;
    accessory?: ClothingItem;
  }>({});

  // State for item swap modal
  const [swapCategory, setSwapCategory] = useState<ClothingCategory | null>(null);
  const [activeOutfit, setActiveOutfit] = useState<GeneratedOutfit | null>(outfit);
  const [justSaved, setJustSaved] = useState(false);
  const [justWorn, setJustWorn] = useState(false);

  // Sync internal active outfit when prop updates
  React.useEffect(() => {
    setActiveOutfit(outfit);
    setJustSaved(false);
    setJustWorn(false);
  }, [outfit]);

  const toggleLock = (category: 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessory', item?: ClothingItem) => {
    if (!item) return;
    setLockedSlots((prev) => {
      const isLocked = !!prev[category];
      if (isLocked) {
        const next = { ...prev };
        delete next[category];
        return next;
      } else {
        return { ...prev, [category]: item };
      }
    });
  };

  const handleShuffle = () => {
    onGenerateNew(lockedSlots);
  };

  const handleSave = () => {
    if (!activeOutfit) return;
    onSaveOutfit(activeOutfit);
    setJustSaved(true);
    // Fire celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#D97757', '#A78B71', '#1C1917', '#E7DDD3'],
    });
  };

  const handleLogWear = () => {
    if (!activeOutfit) return;
    onLogWearToday(activeOutfit);
    setJustWorn(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#6E8F6E', '#A78B71', '#1C1917'],
    });
  };

  const handleSwapSelected = (newItem: ClothingItem) => {
    if (!activeOutfit) return;
    const cat = newItem.category;
    const updated = { ...activeOutfit, [cat]: newItem };
    setActiveOutfit(updated);
    // If it was locked, update the locked slot
    if (lockedSlots[cat]) {
      setLockedSlots((prev) => ({ ...prev, [cat]: newItem }));
    }
  };

  const occasionsList: { label: string; value: Occasion | 'all' }[] = [
    { label: 'All Styles', value: 'all' },
    { label: 'Casual', value: 'casual' },
    { label: 'Work / Office', value: 'work' },
    { label: 'Date / Formal', value: 'formal' },
    { label: 'Sporty', value: 'sporty' },
    { label: 'Lounge', value: 'lounge' },
  ];

  if (!wardrobe || wardrobe.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-stone-200 shadow-sm max-w-2xl mx-auto my-8">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-700">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">
          Your Closet is Waiting, {userName}
        </h3>
        <p className="text-sm text-stone-600 mb-6 max-w-md mx-auto leading-relaxed">
          Upload pictures of your tops, pants, jackets, and shoes, or instantly test the weather outfit engine using our curated capsule closet.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onOpenAddModal}
            className="w-full sm:w-auto px-5 py-2.5 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Upload My Clothes</span>
          </button>
          <button
            onClick={onLoadSamples}
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-sm font-medium hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Load Curated Capsule Closet</span>
          </button>
        </div>
      </div>
    );
  }

  const renderClothingSlot = (
    item: ClothingItem | undefined,
    categoryKey: 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessory',
    label: string
  ) => {
    if (!item) return null;
    const isLocked = !!lockedSlots[categoryKey];

    return (
      <div className="group relative bg-[#FAF8F5] rounded-2xl border border-stone-200/90 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
        {/* Top Badges & Actions */}
        <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between pointer-events-none">
          <span className="pointer-events-auto px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-sm text-stone-800 shadow-sm border border-stone-200/60 uppercase tracking-wider">
            {label}
          </span>
          <div className="pointer-events-auto flex items-center gap-1">
            {/* Lock Button */}
            <button
              onClick={() => toggleLock(categoryKey, item)}
              title={isLocked ? 'Unlock item' : 'Lock this item when regenerating'}
              className={`p-1.5 rounded-full transition-colors backdrop-blur-sm shadow-sm ${
                isLocked
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-white/90 text-stone-600 hover:text-stone-900 hover:bg-white'
              }`}
            >
              {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>

            {/* Swap Button */}
            <button
              onClick={() => setSwapCategory(item.category)}
              title="Swap this piece for another from your closet"
              className="p-1.5 rounded-full bg-white/90 text-stone-600 hover:text-stone-900 hover:bg-white transition-colors backdrop-blur-sm shadow-sm"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Clothing Image */}
        <div className="relative aspect-[4/5] sm:aspect-square w-full overflow-hidden bg-stone-100 flex items-center justify-center">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {item.waterproof && (
            <div className="absolute bottom-2 left-2 bg-sky-900/80 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm shadow">
              Rain-Ready
            </div>
          )}
        </div>

        {/* Item Info */}
        <div className="p-3 bg-white flex-1 flex flex-col justify-between border-t border-stone-100">
          <div>
            <h4 className="font-medium text-stone-900 text-xs sm:text-sm line-clamp-1 group-hover:text-amber-900 transition-colors">
              {item.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-stone-500">
              <span className="capitalize">{item.warmth} layer</span>
              {item.colorName && (
                <>
                  <span className="text-stone-300">•</span>
                  <span>{item.colorName}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-50 text-[10px] text-stone-400">
            <span>Worn {item.wearCount || 0}x</span>
            {item.subCategory && <span className="font-mono">{item.subCategory}</span>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Bar with Style Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
              Today's Recommended Look for {userName}
            </h2>
            {activeOutfit && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {activeOutfit.matchScore}% Match
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Synchronized with {weather?.city || 'today\'s'} weather ({weather ? formatTemp(weather.temperature, tempUnit) : '...'}).
          </p>
        </div>

        {/* Occasion Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {occasionsList.map((occ) => (
            <button
              key={occ.value}
              onClick={() => setOccasion(occ.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                occasion === occ.value
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              {occ.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Flat-lay Visual Display */}
      {activeOutfit ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {activeOutfit.outerwear && renderClothingSlot(activeOutfit.outerwear, 'outerwear', 'Outerwear')}
            {activeOutfit.top && renderClothingSlot(activeOutfit.top, 'top', 'Top')}
            {activeOutfit.bottom && renderClothingSlot(activeOutfit.bottom, 'bottom', 'Bottom')}
            {activeOutfit.dress && renderClothingSlot(activeOutfit.dress, 'dress', 'Dress')}
            {activeOutfit.shoes && renderClothingSlot(activeOutfit.shoes, 'shoes', 'Footwear')}
            {activeOutfit.accessory && renderClothingSlot(activeOutfit.accessory, 'accessory', 'Accessory')}
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-stone-200/80 shadow-sm">
            <div className="flex items-center gap-2">
              {/* Shuffle / Regenerate */}
              <button
                onClick={handleShuffle}
                className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-full text-sm font-medium shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Shuffle / New Look</span>
              </button>

              {/* Locked items count badge */}
              {Object.keys(lockedSlots).length > 0 && (
                <span className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>{Object.keys(lockedSlots).length} piece(s) locked</span>
                  <button
                    onClick={() => setLockedSlots({})}
                    className="ml-1 text-[11px] underline hover:text-amber-950"
                  >
                    Reset
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Save to Favorites */}
              <button
                onClick={handleSave}
                disabled={justSaved}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  justSaved
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-700 border-stone-200 hover:border-rose-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${justSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{justSaved ? 'Saved to Lookbook' : 'Save Look'}</span>
              </button>

              {/* Wear Today */}
              <button
                onClick={handleLogWear}
                disabled={justWorn}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  justWorn
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border-stone-200 hover:border-emerald-200'
                }`}
              >
                <Check className={`w-4 h-4 ${justWorn ? 'stroke-[2.5] text-emerald-600' : ''}`} />
                <span>{justWorn ? 'Worn Today ✓' : 'Wear Today'}</span>
              </button>
            </div>
          </div>

          {/* Stylist Breakdown Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Stylist Match Analysis
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Why this look works */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                  Weather & Style Alignment
                </p>
                <ul className="space-y-1.5">
                  {activeOutfit.matchReasons.map((reason, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-stone-700 flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Styling Advice */}
              <div className="p-4 bg-sand-50 rounded-2xl border border-sand-200/60 flex flex-col justify-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Styling Tip
                </p>
                <p className="text-xs sm:text-sm text-stone-800 leading-relaxed italic">
                  "{activeOutfit.stylingAdvice}"
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm">
          <p className="text-stone-500 mb-4">No matching outfit could be composed with current filters.</p>
          <button
            onClick={handleShuffle}
            className="px-5 py-2.5 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800"
          >
            Retry Suggestion
          </button>
        </div>
      )}

      {/* Item Swap Modal */}
      <ItemSwapModal
        isOpen={swapCategory !== null}
        onClose={() => setSwapCategory(null)}
        category={swapCategory}
        allItems={wardrobe}
        currentItemId={swapCategory ? activeOutfit?.[swapCategory]?.id : undefined}
        onSelectItem={handleSwapSelected}
      />
    </div>
  );
};
