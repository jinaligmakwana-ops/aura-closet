import React from 'react';
import { X, Check } from 'lucide-react';
import { ClothingCategory, ClothingItem } from '../types/wardrobe';

interface ItemSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ClothingCategory | null;
  allItems: ClothingItem[];
  currentItemId?: string;
  onSelectItem: (item: ClothingItem) => void;
}

export const ItemSwapModal: React.FC<ItemSwapModalProps> = ({
  isOpen,
  onClose,
  category,
  allItems,
  currentItemId,
  onSelectItem,
}) => {
  if (!isOpen || !category) return null;

  const filteredItems = allItems.filter((i) => i.category === category);

  const getCategoryTitle = (cat: ClothingCategory) => {
    switch (cat) {
      case 'top': return 'Choose a Top';
      case 'bottom': return 'Choose a Bottom';
      case 'dress': return 'Choose a Dress';
      case 'outerwear': return 'Choose Outerwear / Jacket';
      case 'shoes': return 'Choose Footwear';
      case 'accessory': return 'Choose an Accessory';
      default: return 'Choose an Item';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold text-stone-900">
              {getCategoryTitle(category)}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Select any alternative piece from your closet
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items Grid */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredItems.length === 0 ? (
            <div className="col-span-full py-12 text-center text-stone-400">
              <p>No other {category} items in your closet yet.</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = item.id === currentItemId;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectItem(item);
                    onClose();
                  }}
                  className={`group relative flex flex-col text-left rounded-2xl border overflow-hidden p-2 transition-all hover:shadow-md ${
                    isSelected
                      ? 'border-amber-600 bg-amber-50/40 ring-2 ring-amber-600/30'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-stone-100 relative mb-2">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-amber-600 text-white rounded-full p-1 shadow">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="px-1">
                    <p className="text-xs font-medium text-stone-900 line-clamp-1 group-hover:text-amber-900">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] text-stone-500 capitalize">{item.warmth} warmth</span>
                      {item.colorName && (
                        <>
                          <span className="text-stone-300 text-[10px]">•</span>
                          <span className="text-[10px] text-stone-400">{item.colorName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
