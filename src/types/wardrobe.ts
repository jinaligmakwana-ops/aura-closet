export type ClothingCategory = 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessory';

export type WarmthLevel = 'light' | 'moderate' | 'warm' | 'heavy';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export type Occasion = 'casual' | 'work' | 'formal' | 'sporty' | 'lounge' | 'party';

export type ColorTone = 'neutral' | 'warm' | 'cool' | 'earth' | 'bold' | 'pastel';

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  subCategory?: string;
  imageUrl: string;
  warmth: WarmthLevel;
  seasons: Season[];
  occasions: Occasion[];
  color: string;
  colorName?: string;
  colorTone?: ColorTone;
  waterproof?: boolean;
  brand?: string;
  notes?: string;
  isFavorite?: boolean;
  wearCount: number;
  lastWorn?: string;
  createdAt: string;
}

export interface OutfitPiece {
  item: ClothingItem;
  locked?: boolean;
}

export interface GeneratedOutfit {
  id: string;
  top?: ClothingItem;
  bottom?: ClothingItem;
  dress?: ClothingItem;
  outerwear?: ClothingItem;
  shoes?: ClothingItem;
  accessory?: ClothingItem;
  weatherSnapshot: {
    temp: number;
    apparentTemp: number;
    condition: string;
    isRainy: boolean;
    weatherCode: number;
    city: string;
  };
  matchScore: number;
  matchReasons: string[];
  stylingAdvice: string;
  createdAt: string;
  saved?: boolean;
}

export interface WearLog {
  id: string;
  date: string;
  outfit: GeneratedOutfit;
  notes?: string;
}
