import React, { useState } from 'react';
import {
  Bookmark,
  Calendar,
  Sparkles,
  Trash2,
  CheckCircle,
  Copy,
  Check,
  ExternalLink,
  Shirt,
} from 'lucide-react';
import { GeneratedOutfit } from '../types/wardrobe';
import { TempUnit } from '../types/weather';
import { formatTemp } from '../services/weatherService';

interface SavedOutfitsViewProps {
  savedOutfits: GeneratedOutfit[];
  tempUnit: TempUnit;
  onRemoveSaved: (id: string) => void;
  onLogWear: (outfit: GeneratedOutfit) => void;
  onGoToOutfitGenerator: () => void;
}

export const SavedOutfitsView: React.FC<SavedOutfitsViewProps> = ({
  savedOutfits,
  tempUnit,
  onRemoveSaved,
  onLogWear,
  onGoToOutfitGenerator,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [wornId, setWornId] = useState<string | null>(null);

  const handleCopy = (outfit: GeneratedOutfit) => {
    const pieces = [
      outfit.top && `Top: ${outfit.top.name}`,
      outfit.bottom && `Bottom: ${outfit.bottom.name}`,
      outfit.dress && `Dress: ${outfit.dress.name}`,
      outfit.outerwear && `Outerwear: ${outfit.outerwear.name}`,
      outfit.shoes && `Shoes: ${outfit.shoes.name}`,
      outfit.accessory && `Accessory: ${outfit.accessory.name}`,
    ]
      .filter(Boolean)
      .join('\n');

    const text = `✨ Aura Outfit Lookbook\nWeather: ${outfit.weatherSnapshot.condition}, ${Math.round(outfit.weatherSnapshot.temp)}°C\n\n${pieces}\n\nStyling Tip: ${outfit.stylingAdvice}`;

    navigator.clipboard.writeText(text);
    setCopiedId(outfit.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleWear = (outfit: GeneratedOutfit) => {
    onLogWear(outfit);
    setWornId(outfit.id);
    setTimeout(() => setWornId(null), 2500);
  };

  if (savedOutfits.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/90 shadow-sm max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <Bookmark className="w-8 h-8 stroke-1" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">
          Your Lookbook is Empty
        </h2>
        <p className="text-stone-500 text-xs sm:text-sm mb-6 leading-relaxed">
          When you generate an outfit that you love, tap "Save to Lookbook" to store it here for future inspiration.
        </p>
        <button
          onClick={onGoToOutfitGenerator}
          className="px-6 py-3 rounded-full bg-stone-900 text-white text-xs sm:text-sm font-semibold hover:bg-stone-800 shadow-sm transition-all hover:shadow"
        >
          Generate Today's Outfit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Saved Looks & Curated Ensembles
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            {savedOutfits.length} saved {savedOutfits.length === 1 ? 'look' : 'looks'} ready for wearing.
          </p>
        </div>
      </div>

      {/* Grid of Saved Looks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedOutfits.map((outfit) => {
          const pieces = [
            outfit.outerwear,
            outfit.dress || outfit.top,
            outfit.bottom,
            outfit.shoes,
            outfit.accessory,
          ].filter(Boolean);

          const isWorn = wornId === outfit.id;
          const isCopied = copiedId === outfit.id;

          return (
            <div
              key={outfit.id}
              className="bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  <span className="font-medium text-stone-800">
                    {outfit.weatherSnapshot.city}
                  </span>
                  <span className="text-stone-300">•</span>
                  <span>{formatTemp(outfit.weatherSnapshot.temp, tempUnit)}</span>
                  <span className="text-stone-300">•</span>
                  <span className="text-stone-500 truncate max-w-[100px]">
                    {outfit.weatherSnapshot.condition}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                    {outfit.matchScore}% Match
                  </span>
                </div>
              </div>

              {/* Garment Grid Preview */}
              <div className="p-4 grid grid-cols-3 gap-2 bg-stone-50/30">
                {pieces.slice(0, 6).map((piece, i) => (
                  <div
                    key={i}
                    className="group/item relative aspect-square rounded-2xl bg-white border border-stone-200/80 overflow-hidden"
                  >
                    <img
                      src={piece!.imageUrl}
                      alt={piece!.name}
                      className="w-full h-full object-cover group-hover/item:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity p-1.5 flex flex-col justify-end text-white text-[10px]">
                      <p className="font-semibold line-clamp-1">{piece!.name}</p>
                      <p className="capitalize opacity-80 text-[9px]">{piece!.category}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Styling Advice & Item List */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100/60">
                  <p className="text-xs text-stone-700 italic leading-snug">
                    "{outfit.stylingAdvice}"
                  </p>
                </div>

                {/* Date saved */}
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span>
                    Saved on {new Date(outfit.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span>{pieces.length} Pieces</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 border-t border-stone-100 flex items-center justify-between gap-2 mt-auto">
                <button
                  onClick={() => onRemoveSaved(outfit.id)}
                  title="Remove from saved"
                  className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(outfit)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Share'}</span>
                  </button>

                  <button
                    onClick={() => handleWear(outfit)}
                    disabled={isWorn}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all ${
                      isWorn
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-900 text-white hover:bg-stone-800'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{isWorn ? 'Logged Today!' : 'Wear Today'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

