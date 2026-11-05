import { ClothingItem, GeneratedOutfit, Occasion, WarmthLevel } from '../types/wardrobe';
import { WeatherData } from '../types/weather';

interface OutfitOptions {
  occasion?: Occasion | 'all';
  lockedItems?: {
    top?: ClothingItem;
    bottom?: ClothingItem;
    dress?: ClothingItem;
    outerwear?: ClothingItem;
    shoes?: ClothingItem;
    accessory?: ClothingItem;
  };
  preferDress?: boolean;
}

export function generateOutfit(
  wardrobe: ClothingItem[],
  weather: WeatherData,
  options: OutfitOptions = {}
): GeneratedOutfit | null {
  if (!wardrobe || wardrobe.length === 0) return null;

  const { occasion = 'all', lockedItems = {}, preferDress = false } = options;
  const temp = weather.temperature;
  const isRainy = weather.precipitationProbability > 40 || weather.weatherCode >= 50;

  // Filter items by category
  const tops = wardrobe.filter((i) => i.category === 'top');
  const bottoms = wardrobe.filter((i) => i.category === 'bottom');
  const dresses = wardrobe.filter((i) => i.category === 'dress');
  const outerwears = wardrobe.filter((i) => i.category === 'outerwear');
  const shoes = wardrobe.filter((i) => i.category === 'shoes');
  const accessories = wardrobe.filter((i) => i.category === 'accessory');

  // Determine ideal warmth for current weather
  const getIdealWarmth = (t: number): { topWarmth: WarmthLevel[]; needOuter: boolean; outerWarmth?: WarmthLevel } => {
    if (t < 5) {
      return { topWarmth: ['warm', 'heavy'], needOuter: true, outerWarmth: 'heavy' };
    } else if (t < 13) {
      return { topWarmth: ['moderate', 'warm'], needOuter: true, outerWarmth: 'moderate' };
    } else if (t < 19) {
      return { topWarmth: ['light', 'moderate'], needOuter: true, outerWarmth: 'moderate' };
    } else if (t < 24) {
      return { topWarmth: ['light', 'moderate'], needOuter: false, outerWarmth: 'light' };
    } else {
      return { topWarmth: ['light'], needOuter: false };
    }
  };

  const warmthProfile = getIdealWarmth(temp);

  // Helper to score an item's fitness for current weather and occasion
  const scoreItem = (item: ClothingItem, isOuter: boolean = false): number => {
    let score = 50;

    // Warmth match
    if (isOuter) {
      if (warmthProfile.outerWarmth && item.warmth === warmthProfile.outerWarmth) score += 30;
      else if (item.warmth === 'moderate') score += 15;
    } else {
      if (warmthProfile.topWarmth.includes(item.warmth)) score += 30;
      else if (item.warmth === 'moderate') score += 10;
    }

    // Rain suitability
    if (isRainy && item.waterproof) score += 25;

    // Occasion match
    if (occasion !== 'all') {
      if (item.occasions.includes(occasion as Occasion)) score += 25;
      else score -= 15;
    }

    // Small bonus for favorites & lower wear counts for variety
    if (item.isFavorite) score += 10;
    score -= Math.min(item.wearCount * 0.5, 15);

    // Random slight jitter to allow varied shuffling
    score += Math.random() * 8;

    return score;
  };

  // Helper to pick best item from list (or respect locked item)
  const pickItem = (list: ClothingItem[], locked?: ClothingItem, isOuter: boolean = false): ClothingItem | undefined => {
    if (locked) return locked;
    if (!list || list.length === 0) return undefined;

    const scored = list
      .map((item) => ({ item, score: scoreItem(item, isOuter) }))
      .sort((a, b) => b.score - a.score);

    // Pick from top 3 candidates weighted
    const topCandidates = scored.slice(0, Math.min(3, scored.length));
    const chosen = topCandidates[Math.floor(Math.random() * topCandidates.length)];
    return chosen ? chosen.item : list[0];
  };

  // Decide whether to use Dress or Top + Bottom
  let chosenTop: ClothingItem | undefined = lockedItems.top;
  let chosenBottom: ClothingItem | undefined = lockedItems.bottom;
  let chosenDress: ClothingItem | undefined = lockedItems.dress;

  const shouldUseDress =
    preferDress ||
    lockedItems.dress !== undefined ||
    (dresses.length > 0 && Math.random() > 0.65 && !lockedItems.top && !lockedItems.bottom);

  if (shouldUseDress && dresses.length > 0) {
    chosenDress = pickItem(dresses, lockedItems.dress);
  } else {
    chosenTop = pickItem(tops, lockedItems.top);
    chosenBottom = pickItem(bottoms, lockedItems.bottom);
  }

  // Outerwear decision: Always offer if cold, or if user locked one, or if raining
  let chosenOuter: ClothingItem | undefined = lockedItems.outerwear;
  if (!chosenOuter && (warmthProfile.needOuter || isRainy || (outerwears.length > 0 && Math.random() > 0.4))) {
    chosenOuter = pickItem(outerwears, lockedItems.outerwear, true);
  }

  // Shoes & Accessories
  const chosenShoes = pickItem(shoes, lockedItems.shoes);
  const chosenAccessory = pickItem(accessories, lockedItems.accessory);

  // Compute overall match score and reasoning
  const reasons: string[] = [];
  let totalScore = 80;

  if (temp < 10) {
    reasons.push(`Tailored for chilly ${Math.round(temp)}°C weather with warm insulating layers.`);
    if (chosenOuter) reasons.push(`${chosenOuter.name} provides essential outer shield against cold air.`);
  } else if (temp < 19) {
    reasons.push(`Optimized for mild ${Math.round(temp)}°C weather with easy-to-peel versatile layers.`);
    if (chosenOuter) reasons.push(`${chosenOuter.name} keeps you cozy during cooler morning and evening breezes.`);
  } else {
    reasons.push(`Breathable, relaxed selection keeping you cool in warm ${Math.round(temp)}°C temperatures.`);
  }

  if (isRainy) {
    if (chosenOuter?.waterproof || chosenShoes?.waterproof) {
      reasons.push('Water-resistant pieces prioritized to keep you dry through today\'s rain.');
      totalScore += 8;
    } else {
      reasons.push('Light showers in the forecast — grab an umbrella on your way out!');
    }
  }

  if (occasion !== 'all') {
    reasons.push(`Curated specifically for a ${occasion} setting.`);
  }

  // Color harmony check
  const pieces = [chosenTop, chosenBottom, chosenDress, chosenOuter, chosenShoes].filter(Boolean) as ClothingItem[];
  const neutralCount = pieces.filter((p) => p.colorTone === 'neutral' || p.colorTone === 'earth').length;
  if (neutralCount >= 2) {
    reasons.push('Balanced aesthetic with harmonious neutral grounding.');
    totalScore += 7;
  }

  const finalScore = Math.min(99, Math.max(82, Math.round(totalScore)));

  // Generate stylist advice
  const stylingAdvice = generateOutfitAdvice(chosenTop, chosenBottom, chosenDress, chosenOuter, chosenShoes, temp);

  return {
    id: `outfit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    top: chosenTop,
    bottom: chosenBottom,
    dress: chosenDress,
    outerwear: chosenOuter,
    shoes: chosenShoes,
    accessory: chosenAccessory,
    weatherSnapshot: {
      temp: weather.temperature,
      apparentTemp: weather.apparentTemperature,
      condition: weather.condition,
      isRainy,
      weatherCode: weather.weatherCode,
      city: weather.city,
    },
    matchScore: finalScore,
    matchReasons: reasons,
    stylingAdvice,
    createdAt: new Date().toISOString(),
  };
}

function generateOutfitAdvice(
  top?: ClothingItem,
  bottom?: ClothingItem,
  dress?: ClothingItem,
  outer?: ClothingItem,
  shoes?: ClothingItem,
  temp: number = 20
): string {
  if (dress) {
    return outer
      ? `Drape ${outer.name} loosely over ${dress.name} for an effortless chic silhouette. Pair with ${shoes?.name || 'clean footwear'}.`
      : `Wear ${dress.name} as a standalone statement piece with minimal styling.`;
  }

  if (top && bottom) {
    if (outer) {
      return `Tuck or half-tuck ${top.name} into ${bottom.name} to lengthen proportions, then layer ${outer.name} open for effortless depth.`;
    }
    return `Style ${top.name} with ${bottom.name} and ${shoes?.name || 'everyday footwear'} for an easy, balanced daily silhouette.`;
  }

  return `Clean and weather-balanced combination ready for ${Math.round(temp)}°C conditions.`;
}
