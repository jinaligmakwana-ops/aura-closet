import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Sparkles,
  Droplets,
  Link,
  Layers,
  HelpCircle,
} from 'lucide-react';
import {
  ClothingCategory,
  ClothingItem,
  ColorTone,
  Occasion,
  Season,
  WarmthLevel,
} from '../types/wardrobe';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ClothingItem) => void;
  itemToEdit?: ClothingItem | null;
}

const CATEGORIES: { label: string; value: ClothingCategory; emoji: string }[] = [
  { label: 'Top', value: 'top', emoji: '👕' },
  { label: 'Bottom', value: 'bottom', emoji: '👖' },
  { label: 'Dress', value: 'dress', emoji: '👗' },
  { label: 'Outerwear', value: 'outerwear', emoji: '🧥' },
  { label: 'Shoes', value: 'shoes', emoji: '👟' },
  { label: 'Accessory', value: 'accessory', emoji: '🧣' },
];

const WARMTH_LEVELS: {
  level: WarmthLevel;
  title: string;
  description: string;
  temp: string;
}[] = [
  { level: 'light', title: 'Light', description: 'Tees, tanks, linen, shorts', temp: '> 22°C (Hot)' },
  { level: 'moderate', title: 'Moderate', description: 'Long sleeves, light pants, knits', temp: '16–22°C (Mild)' },
  { level: 'warm', title: 'Warm', description: 'Sweaters, denim, light jackets', temp: '10–16°C (Cool)' },
  { level: 'heavy', title: 'Heavy', description: 'Parkas, wool overcoats, thermal', temp: '< 10°C (Cold)' },
];

const SEASONS: { label: string; value: Season }[] = [
  { label: 'Spring', value: 'spring' },
  { label: 'Summer', value: 'summer' },
  { label: 'Autumn', value: 'autumn' },
  { label: 'Winter', value: 'winter' },
];

const OCCASIONS: { label: string; value: Occasion }[] = [
  { label: 'Casual', value: 'casual' },
  { label: 'Work', value: 'work' },
  { label: 'Formal', value: 'formal' },
  { label: 'Sporty', value: 'sporty' },
  { label: 'Lounge', value: 'lounge' },
  { label: 'Party', value: 'party' },
];

const COLOR_SWATCHES: { name: string; hex: string; tone: ColorTone }[] = [
  { name: 'Crisp White', hex: '#FFFFFF', tone: 'neutral' },
  { name: 'Cream / Off-White', hex: '#F5F2EB', tone: 'neutral' },
  { name: 'Beige / Oat', hex: '#D7C4B7', tone: 'earth' },
  { name: 'Camel / Tan', hex: '#C19A6B', tone: 'warm' },
  { name: 'Coffee Brown', hex: '#4A3525', tone: 'earth' },
  { name: 'Pitch Black', hex: '#1C1917', tone: 'neutral' },
  { name: 'Charcoal Grey', hex: '#4B5563', tone: 'neutral' },
  { name: 'Heather Grey', hex: '#9CA3AF', tone: 'neutral' },
  { name: 'Deep Navy', hex: '#1E293B', tone: 'cool' },
  { name: 'Sky Blue', hex: '#93C5FD', tone: 'pastel' },
  { name: 'Sage / Olive', hex: '#556B2F', tone: 'earth' },
  { name: 'Forest Green', hex: '#1B4332', tone: 'cool' },
  { name: 'Terracotta', hex: '#C86446', tone: 'warm' },
  { name: 'Burgundy / Wine', hex: '#722F37', tone: 'warm' },
  { name: 'Blush Pink', hex: '#FBCFE8', tone: 'pastel' },
  { name: 'Mustard Yellow', hex: '#D97706', tone: 'bold' },
];

// Curated stock photo presets for easy one-click testing
const PRESET_PHOTOS: { category: ClothingCategory; name: string; url: string }[] = [
  { category: 'top', name: 'White Cotton Tee', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80' },
  { category: 'top', name: 'Ribbed Knit Sweater', url: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&auto=format&fit=crop&q=80' },
  { category: 'top', name: 'Striped Breton Longsleeve', url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80' },
  { category: 'bottom', name: 'Pleated Linen Trousers', url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop&q=80' },
  { category: 'bottom', name: 'Straight-Leg Blue Jeans', url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80' },
  { category: 'bottom', name: 'Tailored Wide-Leg Pants', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80' },
  { category: 'dress', name: 'Sleeveless Black Midi Dress', url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80' },
  { category: 'outerwear', name: 'Camel Double-Breasted Trench', url: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&auto=format&fit=crop&q=80' },
  { category: 'outerwear', name: 'Oversized Wool Blazer', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80' },
  { category: 'shoes', name: 'White Leather Sneakers', url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80' },
  { category: 'shoes', name: 'Black Leather Ankle Boots', url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80' },
  { category: 'accessory', name: 'Cognac Leather Tote Bag', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80' },
];

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ClothingCategory>('top');
  const [subCategory, setSubCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [warmth, setWarmth] = useState<WarmthLevel>('moderate');
  const [seasons, setSeasons] = useState<Season[]>(['spring', 'autumn']);
  const [occasions, setOccasions] = useState<Occasion[]>(['casual']);
  const [colorHex, setColorHex] = useState('#1C1917');
  const [colorName, setColorName] = useState('Pitch Black');
  const [colorTone, setColorTone] = useState<ColorTone>('neutral');
  const [waterproof, setWaterproof] = useState(false);
  const [brand, setBrand] = useState('');
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Photo tab: upload vs URL vs stock preset
  const [photoTab, setPhotoTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if editing
  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setCategory(itemToEdit.category);
      setSubCategory(itemToEdit.subCategory || '');
      setImageUrl(itemToEdit.imageUrl);
      setWarmth(itemToEdit.warmth);
      setSeasons(itemToEdit.seasons || ['spring', 'summer', 'autumn', 'winter']);
      setOccasions(itemToEdit.occasions || ['casual']);
      setColorHex(itemToEdit.color || '#1C1917');
      setColorName(itemToEdit.colorName || 'Classic');
      setColorTone(itemToEdit.colorTone || 'neutral');
      setWaterproof(!!itemToEdit.waterproof);
      setBrand(itemToEdit.brand || '');
      setNotes(itemToEdit.notes || '');
      setIsFavorite(!!itemToEdit.isFavorite);
    } else {
      // Reset defaults
      setName('');
      setCategory('top');
      setSubCategory('');
      setImageUrl('');
      setWarmth('moderate');
      setSeasons(['spring', 'autumn']);
      setOccasions(['casual']);
      setColorHex('#1C1917');
      setColorName('Pitch Black');
      setColorTone('neutral');
      setWaterproof(false);
      setBrand('');
      setNotes('');
      setIsFavorite(false);
      setError(null);
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  // Handle image file selection
  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setImageUrl(result);
        setError(null);
        // Auto suggest name if empty
        if (!name) {
          const autoName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setName(autoName.charAt(0).toUpperCase() + autoName.slice(1));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const toggleSeason = (season: Season) => {
    if (seasons.includes(season)) {
      if (seasons.length > 1) {
        setSeasons(seasons.filter((s) => s !== season));
      }
    } else {
      setSeasons([...seasons, season]);
    }
  };

  const toggleOccasion = (occ: Occasion) => {
    if (occasions.includes(occ)) {
      if (occasions.length > 1) {
        setOccasions(occasions.filter((o) => o !== occ));
      }
    } else {
      setOccasions([...occasions, occ]);
    }
  };

  const selectColorSwatch = (swatch: typeof COLOR_SWATCHES[0]) => {
    setColorHex(swatch.hex);
    setColorName(swatch.name);
    setColorTone(swatch.tone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please give your clothing item a name.');
      return;
    }
    if (!imageUrl) {
      setError('Please add a photo for your item.');
      return;
    }

    const item: ClothingItem = {
      id: itemToEdit ? itemToEdit.id : `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      category,
      subCategory: subCategory.trim() || undefined,
      imageUrl,
      warmth,
      seasons,
      occasions,
      color: colorHex,
      colorName: colorName.trim() || 'Custom Color',
      colorTone,
      waterproof,
      brand: brand.trim() || undefined,
      notes: notes.trim() || undefined,
      isFavorite,
      wearCount: itemToEdit?.wearCount || 0,
      lastWorn: itemToEdit?.lastWorn,
      createdAt: itemToEdit?.createdAt || new Date().toISOString(),
    };

    onSave(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 sm:px-7 border-b border-stone-100 flex items-center justify-between shrink-0 bg-stone-50/50">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
              {itemToEdit ? 'Edit Garment' : 'Add Clothes to Wardrobe'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Upload photos and set attributes to unlock intelligent weather styling.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-7 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* 1. Image Upload Section */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
              Garment Photo *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Image Preview */}
              <div className="sm:col-span-4 aspect-square rounded-2xl bg-stone-100 border-2 border-dashed border-stone-300 overflow-hidden relative flex items-center justify-center">
                {imageUrl ? (
                  <>
                    <img
                      src={imageUrl}
                      alt="Garment Preview"
                      className="w-full h-full object-cover"
                      onError={() => setError('Image failed to load. Check the URL or re-upload.')}
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                      title="Clear photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-3 text-stone-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 stroke-1" />
                    <span className="text-xs block font-medium">No photo selected</span>
                  </div>
                )}
              </div>

              {/* Photo Input Controls */}
              <div className="sm:col-span-8 flex flex-col justify-between">
                {/* Mode Tabs */}
                <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-medium mb-3">
                  <button
                    type="button"
                    onClick={() => setPhotoTab('upload')}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${
                      photoTab === 'upload' ? 'bg-white shadow-sm text-stone-900 font-semibold' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoTab('url')}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${
                      photoTab === 'url' ? 'bg-white shadow-sm text-stone-900 font-semibold' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Image Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoTab('presets')}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${
                      photoTab === 'presets' ? 'bg-white shadow-sm text-stone-900 font-semibold' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Sample Presets
                  </button>
                </div>

                {/* Tab: Upload File */}
                {photoTab === 'upload' && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors flex-1 flex flex-col items-center justify-center ${
                      isDragging
                        ? 'border-amber-500 bg-amber-50/50'
                        : 'border-stone-200 hover:border-amber-400 hover:bg-stone-50/50'
                    }`}
                  >
                    <Upload className="w-6 h-6 text-stone-400 mb-1" />
                    <p className="text-xs font-medium text-stone-800">
                      Click to choose photo or drag & drop here
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">PNG, JPG, WEBP from your phone or camera</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileProcess(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                )}

                {/* Tab: Image URL */}
                {photoTab === 'url' && (
                  <div className="flex-1 flex flex-col justify-center gap-2">
                    <div className="relative">
                      <Link className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        placeholder="https://example.com/jacket.jpg"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                      />
                    </div>
                    <p className="text-[11px] text-stone-400">
                      Paste a direct link to any garment photo online (e.g. Zara, Uniqlo, Pinterest).
                    </p>
                  </div>
                )}

                {/* Tab: Presets */}
                {photoTab === 'presets' && (
                  <div className="flex-1 overflow-x-auto pb-1 flex gap-2">
                    {PRESET_PHOTOS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setImageUrl(preset.url);
                          setCategory(preset.category);
                          if (!name) setName(preset.name);
                        }}
                        className="shrink-0 w-16 h-16 rounded-xl border border-stone-200 overflow-hidden relative group hover:ring-2 hover:ring-amber-500 transition-all"
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        <span className="absolute inset-0 bg-black/40 text-[9px] text-white font-medium p-0.5 opacity-0 group-hover:opacity-100 flex items-center justify-center text-center">
                          {preset.category}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                Piece Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cream Merino Turtleneck"
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                Subcategory / Silhouette
              </label>
              <input
                type="text"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="e.g. Knitwear, Trench, Denim"
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
              Closet Category *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                    category === cat.value
                      ? 'border-stone-900 bg-stone-900 text-white font-semibold shadow-sm'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                  }`}
                >
                  <span className="text-base block mb-0.5">{cat.emoji}</span>
                  <span className="text-xs block">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Warmth Level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Thermal Warmth Level *
              </label>
              <span className="text-[11px] text-stone-400">Used by AI weather matcher</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {WARMTH_LEVELS.map((item) => (
                <button
                  key={item.level}
                  type="button"
                  onClick={() => setWarmth(item.level)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    warmth === item.level
                      ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-600/20'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-stone-900">{item.title}</span>
                    <span className="text-[10px] font-mono font-medium text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded">
                      {item.temp}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 leading-snug">{item.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Color Swatches */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Primary Color & Tone
              </label>
              <span className="text-xs font-medium text-stone-700">{colorName}</span>
            </div>

            <div className="flex flex-wrap gap-2 items-center mb-3">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch.hex}
                  type="button"
                  onClick={() => selectColorSwatch(swatch)}
                  style={{ backgroundColor: swatch.hex }}
                  title={`${swatch.name} (${swatch.tone})`}
                  className={`w-7 h-7 rounded-full border border-black/10 transition-transform ${
                    colorHex.toLowerCase() === swatch.hex.toLowerCase()
                      ? 'scale-125 ring-2 ring-stone-900 ring-offset-2'
                      : 'hover:scale-110'
                  }`}
                />
              ))}
              {/* Custom color picker */}
              <label
                className="w-7 h-7 rounded-full border border-stone-300 flex items-center justify-center cursor-pointer hover:border-stone-500 overflow-hidden relative"
                title="Custom color picker"
              >
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => {
                    setColorHex(e.target.value);
                    setColorName('Custom Hex');
                  }}
                  className="opacity-0 absolute inset-0 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-stone-500">+</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  placeholder="Color label (e.g. Oatmeal)"
                  className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-xl"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">Tone:</span>
                <select
                  value={colorTone}
                  onChange={(e) => setColorTone(e.target.value as ColorTone)}
                  className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-xl bg-white"
                >
                  <option value="neutral">Neutral (Black, White, Grey)</option>
                  <option value="earth">Earth (Beige, Olive, Brown)</option>
                  <option value="warm">Warm (Tan, Burgundy, Coral)</option>
                  <option value="cool">Cool (Navy, Forest Green)</option>
                  <option value="pastel">Pastel (Sky, Blush Pink)</option>
                  <option value="bold">Bold (Vibrant accent)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5. Seasons & Occasions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Seasons
                </label>
                <button
                  type="button"
                  onClick={() => setSeasons(['spring', 'summer', 'autumn', 'winter'])}
                  className="text-[10px] text-amber-700 hover:underline"
                >
                  All Year
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {SEASONS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => toggleSeason(s.value)}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border text-center transition-colors ${
                      seasons.includes(s.value)
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Occasions
                </label>
                <button
                  type="button"
                  onClick={() => setOccasions(['casual', 'work', 'formal', 'sporty', 'lounge', 'party'])}
                  className="text-[10px] text-amber-700 hover:underline"
                >
                  All Settings
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {OCCASIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggleOccasion(o.value)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition-colors capitalize ${
                      occasions.includes(o.value)
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 6. Special Attributes (Waterproof, Favorite, Brand) */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={waterproof}
                onChange={(e) => setWaterproof(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
              />
              <div className="flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-sky-500" />
                <span className="text-xs font-medium text-stone-800">
                  Waterproof / Water-Resistant Piece
                </span>
                <span className="text-[10px] text-stone-400 font-normal">
                  (prioritized during rain & precipitation)
                </span>
              </div>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-200/60">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-stone-500 mb-1">
                  Brand (optional)
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. COS, Everlane, Levi's"
                  className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-stone-500 mb-1">
                  Styling Notes (optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Best with tucked tee, dry clean only"
                  className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-xl bg-white"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 shadow-sm transition-all hover:shadow"
            >
              {itemToEdit ? 'Save Changes' : 'Add to Closet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

