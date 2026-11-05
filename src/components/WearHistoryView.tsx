import React from 'react';
import {
  Calendar,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shirt,
  Flame,
} from 'lucide-react';
import { ClothingItem, WearLog } from '../types/wardrobe';

interface WearHistoryViewProps {
  logs: WearLog[];
  wardrobe: ClothingItem[];
  onGoToOutfitGenerator: () => void;
}

export const WearHistoryView: React.FC<WearHistoryViewProps> = ({
  logs,
  wardrobe,
  onGoToOutfitGenerator,
}) => {
  // Compute analytics
  const totalWornItems = wardrobe.filter((i) => i.wearCount > 0).length;
  const rotationPercentage = wardrobe.length > 0 ? Math.round((totalWornItems / wardrobe.length) * 100) : 0;

  // Most worn items
  const mostWorn = [...wardrobe]
    .filter((i) => i.wearCount > 0)
    .sort((a, b) => b.wearCount - a.wearCount)
    .slice(0, 4);

  // Unworn items
  const unworn = wardrobe.filter((i) => !i.wearCount || i.wearCount === 0);

  if (logs.length === 0 && wardrobe.length > 0 && mostWorn.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/90 shadow-sm max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 stroke-1" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">
          No Wear History Logged Yet
        </h2>
        <p className="text-stone-500 text-xs sm:text-sm mb-6 leading-relaxed">
          When you generate or select an outfit and click <strong>"I'm Wearing This Today"</strong>, we'll log your daily outfit here, compute wardrobe rotation, and highlight your most-loved pieces.
        </p>
        <button
          onClick={onGoToOutfitGenerator}
          className="px-6 py-3 rounded-full bg-stone-900 text-white text-xs sm:text-sm font-semibold hover:bg-stone-800 shadow-sm transition-all"
        >
          Check Today's Outfit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
          Wear History & Closet Analytics
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm mt-1">
          Insights on how often you rotate your clothes and make sustainable styling choices.
        </p>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Days Logged */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-stone-400 tracking-wider">
              Outfits Logged
            </p>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              {logs.length}
            </p>
          </div>
        </div>

        {/* Card 2: Rotation Rate */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-stone-400 tracking-wider">
              Rotation Rate
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                {rotationPercentage}%
              </span>
              <span className="text-xs text-stone-500">
                ({totalWornItems}/{wardrobe.length} items)
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Unworn Pieces */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-stone-400 tracking-wider">
              Dormant Garments
            </p>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              {unworn.length}
            </p>
          </div>
        </div>
      </div>

      {/* Most Worn Pieces Carousel */}
      {mostWorn.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Top Wardrobe Staples (Most Worn)
            </h2>
            <span className="text-xs text-stone-500">Based on wear history</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {mostWorn.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/80"
              >
                <div className="w-12 h-12 rounded-xl bg-white overflow-hidden shrink-0 border border-stone-200">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="font-serif text-xs font-bold text-stone-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-amber-800 font-semibold mt-0.5">
                    Worn {item.wearCount} times
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logged Outfits Timeline */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-stone-900">
          Daily Logbook History
        </h2>

        {logs.length > 0 ? (
          <div className="space-y-4">
            {logs.map((log) => {
              const outfit = log.outfit;
              const pieces = [
                outfit.outerwear,
                outfit.dress || outfit.top,
                outfit.bottom,
                outfit.shoes,
                outfit.accessory,
              ].filter(Boolean);

              return (
                <div
                  key={log.id}
                  className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  {/* Left: Date & Weather Details */}
                  <div className="md:w-1/3 space-y-1">
                    <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-lg">
                      <Clock className="w-4 h-4 text-amber-700" />
                      <span>
                        {new Date(log.date).toLocaleDateString(undefined, {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-stone-500">
                      Weather: {Math.round(outfit.weatherSnapshot.temp)}°C, {outfit.weatherSnapshot.condition} in {outfit.weatherSnapshot.city}
                    </p>

                    {log.notes && (
                      <p className="text-xs text-stone-700 italic bg-amber-50/60 p-2 rounded-xl mt-2 border border-amber-100">
                        "{log.notes}"
                      </p>
                    )}
                  </div>

                  {/* Middle / Right: Piece Thumbnails */}
                  <div className="flex-1 flex flex-wrap gap-2.5 items-center">
                    {pieces.map((piece, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-stone-50 border border-stone-200"
                      >
                        <img
                          src={piece!.imageUrl}
                          alt={piece!.name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <div className="max-w-[120px]">
                          <p className="text-[11px] font-semibold text-stone-900 truncate">
                            {piece!.name}
                          </p>
                          <p className="text-[9px] text-stone-500 uppercase tracking-wider">
                            {piece!.category}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-sm">
            No entries logged yet. Try wearing an outfit to record it here!
          </div>
        )}
      </div>
    </div>
  );
};

