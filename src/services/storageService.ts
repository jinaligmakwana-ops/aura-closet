import { get, set } from 'idb-keyval';
import { ClothingItem, GeneratedOutfit, WearLog } from '../types/wardrobe';
import { SAMPLE_WARDROBE } from '../data/sampleWardrobe';
import { getActiveEncryptionKey } from './authService';
import { encryptData, decryptData, sanitizeImageUrl } from './cryptoService';

// Legacy keys
const LEGACY_ITEMS_KEY = 'wardrobe_items_v1';
const LEGACY_SAVED_OUTFITS_KEY = 'saved_outfits_v1';
const LEGACY_WEAR_LOGS_KEY = 'wear_logs_v1';
const LEGACY_SETTINGS_KEY = 'wardrobe_settings_v1';

const getItemsKey = (userId: string = 'user_jinali') => `wardrobe_items_${userId}_v2`;
const getSavedKey = (userId: string = 'user_jinali') => `saved_outfits_${userId}_v2`;
const getLogsKey = (userId: string = 'user_jinali') => `wear_logs_${userId}_v2`;
const getSettingsKey = (userId: string = 'user_jinali') => `wardrobe_settings_${userId}_v2`;

export interface UserSettings {
  tempUnit: 'C' | 'F';
  lastCity?: string;
  lastCountry?: string;
  lastLat?: number;
  lastLon?: number;
}

const DEFAULT_SETTINGS: UserSettings = {
  tempUnit: 'C',
  lastCity: 'London',
  lastCountry: 'United Kingdom',
  lastLat: 51.5074,
  lastLon: -0.1278,
};

interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  version: number;
}

function isEncryptedPayload(val: any): val is EncryptedPayload {
  return val && typeof val === 'object' && typeof val.ciphertext === 'string' && typeof val.iv === 'string';
}

/**
 * Read data from storage with transparent AES-256-GCM decryption
 */
async function secureRead<T>(key: string): Promise<T | null> {
  try {
    const raw = await get<any>(key);
    if (!raw) return null;

    if (isEncryptedPayload(raw)) {
      const activeKey = getActiveEncryptionKey();
      if (activeKey) {
        try {
          return await decryptData<T>(raw.ciphertext, raw.iv, activeKey);
        } catch (err) {
          console.warn(`[Security] AES-256-GCM decryption failed for key: ${key}`, err);
          return null;
        }
      }
      return null;
    }
    return raw as T;
  } catch (err) {
    console.error('[Security] Storage read error:', err);
    return null;
  }
}

/**
 * Write data to storage with transparent AES-256-GCM authenticated encryption
 */
async function secureWrite<T>(key: string, data: T): Promise<void> {
  try {
    const activeKey = getActiveEncryptionKey();
    if (activeKey) {
      try {
        const encrypted = await encryptData(data, activeKey);
        await set(key, encrypted);
        return;
      } catch (err) {
        console.warn('[Security] Encryption failed, falling back:', err);
      }
    }
    await set(key, data);
  } catch (err) {
    console.error('[Security] Storage write error:', err);
  }
}

export async function getWardrobeItems(userId: string = 'user_jinali'): Promise<ClothingItem[]> {
  try {
    const key = getItemsKey(userId);
    let items = await secureRead<ClothingItem[]>(key);

    if (!items || items.length === 0) {
      // Check legacy unencrypted items if migrating
      const legacyKey = `wardrobe_items_${userId}_v1`;
      let legacyItems = await get<ClothingItem[]>(legacyKey);
      if (!legacyItems && userId === 'user_jinali') {
        legacyItems = await get<ClothingItem[]>(LEGACY_ITEMS_KEY);
      }

      if (legacyItems && legacyItems.length > 0) {
        items = legacyItems;
        await secureWrite(key, items);
        return items;
      }

      // Seed initial wardrobe
      await secureWrite(key, SAMPLE_WARDROBE);
      return SAMPLE_WARDROBE;
    }
    return items;
  } catch (err) {
    console.error('Failed to load items from IndexedDB:', err);
    return SAMPLE_WARDROBE;
  }
}

export async function saveWardrobeItem(
  item: ClothingItem,
  userId: string = 'user_jinali'
): Promise<ClothingItem[]> {
  const key = getItemsKey(userId);
  const current = (await secureRead<ClothingItem[]>(key)) || [];
  
  // Defense in depth: sanitize image URL against script injection
  const sanitizedItem: ClothingItem = {
    ...item,
    imageUrl: sanitizeImageUrl(item.imageUrl) || item.imageUrl,
    name: item.name.replace(/[<>]/g, '').trim(),
    brand: item.brand ? item.brand.replace(/[<>]/g, '').trim() : undefined,
    notes: item.notes ? item.notes.replace(/[<>]/g, '').trim() : undefined,
  };

  const existingIdx = current.findIndex((i) => i.id === sanitizedItem.id);
  let updated: ClothingItem[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = sanitizedItem;
  } else {
    updated = [sanitizedItem, ...current];
  }
  await secureWrite(key, updated);
  return updated;
}

export async function deleteWardrobeItem(
  id: string,
  userId: string = 'user_jinali'
): Promise<ClothingItem[]> {
  const key = getItemsKey(userId);
  const current = (await secureRead<ClothingItem[]>(key)) || [];
  const updated = current.filter((item) => item.id !== id);
  await secureWrite(key, updated);
  return updated;
}

export async function toggleFavoriteItem(
  id: string,
  userId: string = 'user_jinali'
): Promise<ClothingItem[]> {
  const key = getItemsKey(userId);
  const current = (await secureRead<ClothingItem[]>(key)) || [];
  const updated = current.map((item) =>
    item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
  );
  await secureWrite(key, updated);
  return updated;
}

export async function incrementWearCount(
  id: string,
  userId: string = 'user_jinali'
): Promise<void> {
  const key = getItemsKey(userId);
  const current = (await secureRead<ClothingItem[]>(key)) || [];
  const todayStr = new Date().toISOString().split('T')[0];
  const updated = current.map((item) =>
    item.id === id
      ? { ...item, wearCount: (item.wearCount || 0) + 1, lastWorn: todayStr }
      : item
  );
  await secureWrite(key, updated);
}

export async function getSavedOutfits(userId: string = 'user_jinali'): Promise<GeneratedOutfit[]> {
  const key = getSavedKey(userId);
  let outfits = await secureRead<GeneratedOutfit[]>(key);
  if (!outfits && userId === 'user_jinali') {
    outfits = (await get<GeneratedOutfit[]>(LEGACY_SAVED_OUTFITS_KEY)) || [];
  }
  return outfits || [];
}

export async function saveOutfit(
  outfit: GeneratedOutfit,
  userId: string = 'user_jinali'
): Promise<GeneratedOutfit[]> {
  const key = getSavedKey(userId);
  const current = (await secureRead<GeneratedOutfit[]>(key)) || [];
  if (current.some((o) => o.id === outfit.id)) {
    return current;
  }
  const updated = [{ ...outfit, saved: true }, ...current];
  await secureWrite(key, updated);
  return updated;
}

export async function removeSavedOutfit(
  id: string,
  userId: string = 'user_jinali'
): Promise<GeneratedOutfit[]> {
  const key = getSavedKey(userId);
  const current = (await secureRead<GeneratedOutfit[]>(key)) || [];
  const updated = current.filter((o) => o.id !== id);
  await secureWrite(key, updated);
  return updated;
}

export async function getWearLogs(userId: string = 'user_jinali'): Promise<WearLog[]> {
  const key = getLogsKey(userId);
  let logs = await secureRead<WearLog[]>(key);
  if (!logs && userId === 'user_jinali') {
    logs = (await get<WearLog[]>(LEGACY_WEAR_LOGS_KEY)) || [];
  }
  return logs || [];
}

export async function logOutfitWorn(
  outfit: GeneratedOutfit,
  notes?: string,
  userId: string = 'user_jinali'
): Promise<WearLog[]> {
  const key = getLogsKey(userId);
  const current = (await secureRead<WearLog[]>(key)) || [];
  const today = new Date().toISOString().split('T')[0];

  const log: WearLog = {
    id: `log-${Date.now()}`,
    date: today,
    outfit,
    notes: notes ? notes.replace(/[<>]/g, '').trim() : undefined,
  };

  const updated = [log, ...current];
  await secureWrite(key, updated);

  if (outfit.top) await incrementWearCount(outfit.top.id, userId);
  if (outfit.bottom) await incrementWearCount(outfit.bottom.id, userId);
  if (outfit.dress) await incrementWearCount(outfit.dress.id, userId);
  if (outfit.outerwear) await incrementWearCount(outfit.outerwear.id, userId);
  if (outfit.shoes) await incrementWearCount(outfit.shoes.id, userId);
  if (outfit.accessory) await incrementWearCount(outfit.accessory.id, userId);

  return updated;
}

export async function getUserSettings(userId: string = 'user_jinali'): Promise<UserSettings> {
  const key = getSettingsKey(userId);
  const s = await secureRead<UserSettings>(key);
  if (!s && userId === 'user_jinali') {
    const legacy = await get<UserSettings>(LEGACY_SETTINGS_KEY);
    if (legacy) return legacy;
  }
  return s || DEFAULT_SETTINGS;
}

export async function saveUserSettings(
  settings: Partial<UserSettings>,
  userId: string = 'user_jinali'
): Promise<UserSettings> {
  const key = getSettingsKey(userId);
  const current = await getUserSettings(userId);
  const updated = { ...current, ...settings };
  await secureWrite(key, updated);
  return updated;
}

export async function resetToSampleWardrobe(userId: string = 'user_jinali'): Promise<ClothingItem[]> {
  const key = getItemsKey(userId);
  await secureWrite(key, SAMPLE_WARDROBE);
  return SAMPLE_WARDROBE;
}

export async function clearAllWardrobe(userId: string = 'user_jinali'): Promise<ClothingItem[]> {
  const key = getItemsKey(userId);
  await secureWrite(key, []);
  return [];
}

export async function exportAllData(userId: string = 'user_jinali'): Promise<string> {
  const items = (await secureRead<ClothingItem[]>(getItemsKey(userId))) || [];
  const outfits = (await secureRead<GeneratedOutfit[]>(getSavedKey(userId))) || [];
  const logs = (await secureRead<WearLog[]>(getLogsKey(userId))) || [];
  const settings = await getUserSettings(userId);

  const backup = {
    version: '2.0-security',
    securityStandard: 'AES-256-GCM/PBKDF2-SHA256',
    userId,
    exportDate: new Date().toISOString(),
    items,
    outfits,
    logs,
    settings,
  };

  return JSON.stringify(backup, null, 2);
}

export async function importData(
  jsonString: string,
  userId: string = 'user_jinali'
): Promise<{ itemsCount: number }> {
  // Prototype pollution protection
  const data = JSON.parse(jsonString, (key, value) => {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return undefined;
    }
    return value;
  });

  if (Array.isArray(data.items)) {
    await secureWrite(getItemsKey(userId), data.items);
  }
  if (Array.isArray(data.outfits)) {
    await secureWrite(getSavedKey(userId), data.outfits);
  }
  if (Array.isArray(data.logs)) {
    await secureWrite(getLogsKey(userId), data.logs);
  }
  if (data.settings) {
    await secureWrite(getSettingsKey(userId), data.settings);
  }
  return { itemsCount: data.items?.length || 0 };
}
