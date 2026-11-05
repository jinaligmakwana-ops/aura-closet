import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Plus, Shirt, Bookmark, Calendar, LogIn } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { WeatherWidget } from './components/WeatherWidget';
import { OutfitGenerator } from './components/OutfitGenerator';
import { ClosetView } from './components/ClosetView';
import { SavedOutfitsView } from './components/SavedOutfitsView';
import { WearHistoryView } from './components/WearHistoryView';
import { AddItemModal } from './components/AddItemModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { LandingPage } from './components/LandingPage';
import { ClothingItem, GeneratedOutfit, Occasion, WearLog } from './types/wardrobe';
import { CitySearchResult, TempUnit, WeatherData } from './types/weather';
import { User } from './types/auth';
import { getCurrentUser, logoutUser } from './services/authService';
import {
  fetchWeatherByCoords,
  fetchWeatherByCityName,
  getCurrentLocationWeather,
} from './services/weatherService';
import {
  getWardrobeItems,
  saveWardrobeItem,
  deleteWardrobeItem,
  toggleFavoriteItem,
  getSavedOutfits,
  saveOutfit,
  removeSavedOutfit,
  getWearLogs,
  logOutfitWorn,
  getUserSettings,
  saveUserSettings,
  resetToSampleWardrobe,
} from './services/storageService';
import { generateOutfit } from './services/outfitEngine';

export const App: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<'outfit' | 'wardrobe' | 'saved' | 'history'>('outfit');

  // User Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Core Data
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<GeneratedOutfit[]>([]);
  const [wearLogs, setWearLogs] = useState<WearLog[]>([]);

  // Weather State
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);
  const [tempUnit, setTempUnit] = useState<TempUnit>('C');

  // Outfit Generator State
  const [currentOutfit, setCurrentOutfit] = useState<GeneratedOutfit | null>(null);
  const [occasion, setOccasion] = useState<Occasion | 'all'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ClothingItem | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<string | null>(null);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Load User Data
  const loadUserData = useCallback(async (user: User | null) => {
    const userId = user?.id || 'user_jinali';
    try {
      const [items, outfits, logs, settings] = await Promise.all([
        getWardrobeItems(userId),
        getSavedOutfits(userId),
        getWearLogs(userId),
        getUserSettings(userId),
      ]);

      setWardrobe(items);
      setSavedOutfits(outfits);
      setWearLogs(logs);
      if (settings.tempUnit) setTempUnit(settings.tempUnit);

      // Load initial weather
      await loadInitialWeather(settings.lastLat, settings.lastLon, settings.lastCity);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  }, []);

  const loadInitialWeather = async (lat?: number, lon?: number, city?: string) => {
    setWeatherLoading(true);
    try {
      if (lat !== undefined && lon !== undefined && city) {
        const data = await fetchWeatherByCoords(lat, lon, city);
        setWeather(data);
      } else {
        // Try GPS, fallback to London
        try {
          const data = await getCurrentLocationWeather();
          setWeather(data);
        } catch {
          const defaultData = await fetchWeatherByCityName('London');
          setWeather(defaultData);
        }
      }
    } catch (e) {
      console.error('Weather load error:', e);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Initialize Auth & Storage
  useEffect(() => {
    async function init() {
      const user = await getCurrentUser();
      setCurrentUser(user);
      await loadUserData(user);
    }
    init();
  }, [loadUserData]);

  // Generate outfit when weather or wardrobe or occasion changes
  const produceOutfit = useCallback(
    (
      locked: Record<string, ClothingItem | undefined> = {},
      customOccasion?: Occasion | 'all'
    ) => {
      if (!weather || wardrobe.length === 0) {
        setCurrentOutfit(null);
        return;
      }
      const occ = customOccasion || occasion;
      const result = generateOutfit(wardrobe, weather, {
        occasion: occ,
        lockedItems: locked,
      });
      setCurrentOutfit(result);
    },
    [wardrobe, weather, occasion]
  );

  useEffect(() => {
    if (weather && wardrobe.length > 0 && !currentOutfit) {
      produceOutfit();
    }
  }, [weather, wardrobe, produceOutfit, currentOutfit]);

  // Auth Handlers
  const handleAuthSuccess = async (user: User) => {
    setCurrentUser(user);
    await loadUserData(user);
    setCurrentOutfit(null);
    showToast(`Welcome, ${user.name}!`);
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    showToast('Signed out of closet.');
  };

  // Weather Actions
  const handleRefreshWeather = async () => {
    if (!weather) return;
    setWeatherLoading(true);
    try {
      const refreshed = await fetchWeatherByCoords(weather.latitude, weather.longitude, weather.city, weather.country);
      setWeather(refreshed);
      produceOutfit({}, occasion);
      showToast(`Updated weather for ${refreshed.city}`);
    } catch (err) {
      console.error(err);
      showToast('Could not refresh weather');
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleSelectCity = async (cityResult: CitySearchResult) => {
    setWeatherLoading(true);
    try {
      const data = await fetchWeatherByCoords(
        cityResult.latitude,
        cityResult.longitude,
        cityResult.name,
        cityResult.country
      );
      setWeather(data);
      await saveUserSettings({
        lastCity: cityResult.name,
        lastCountry: cityResult.country,
        lastLat: cityResult.latitude,
        lastLon: cityResult.longitude,
      }, currentUser?.id);
      produceOutfit({}, occasion);
      showToast(`Switched location to ${cityResult.name}`);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch city weather');
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleUseGPS = async () => {
    setWeatherLoading(true);
    try {
      const data = await getCurrentLocationWeather();
      setWeather(data);
      await saveUserSettings({
        lastCity: data.city,
        lastCountry: data.country,
        lastLat: data.latitude,
        lastLon: data.longitude,
      }, currentUser?.id);
      produceOutfit({}, occasion);
      showToast(`Located in ${data.city}`);
    } catch (err) {
      console.error(err);
      showToast('GPS access denied or unavailable');
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleUnitToggle = async (unit: TempUnit) => {
    setTempUnit(unit);
    await saveUserSettings({ tempUnit: unit }, currentUser?.id);
  };

  // Outfit Actions
  const handleSaveOutfit = async (outfit: GeneratedOutfit) => {
    const updated = await saveOutfit(outfit, currentUser?.id);
    setSavedOutfits(updated);
    showToast('Look saved to your lookbook!');
  };

  const handleRemoveSaved = async (id: string) => {
    const updated = await removeSavedOutfit(id, currentUser?.id);
    setSavedOutfits(updated);
    showToast('Removed look from saved.');
  };

  const handleLogWearOutfit = async (outfit: GeneratedOutfit) => {
    const updatedLogs = await logOutfitWorn(outfit, undefined, currentUser?.id);
    setWearLogs(updatedLogs);
    // Refresh wardrobe wear counts in state
    const refreshedItems = await getWardrobeItems(currentUser?.id);
    setWardrobe(refreshedItems);
    showToast("Outfit logged as worn today!");
  };

  const handleLogWearSinglePiece = async (item: ClothingItem) => {
    const mockOutfit: GeneratedOutfit = {
      id: `wear-item-${Date.now()}`,
      [item.category]: item,
      weatherSnapshot: {
        temp: weather?.temperature || 20,
        apparentTemp: weather?.apparentTemperature || 20,
        condition: weather?.condition || 'Mild',
        isRainy: false,
        weatherCode: weather?.weatherCode || 0,
        city: weather?.city || 'Local',
      },
      matchScore: 90,
      matchReasons: ['Single item wear logged'],
      stylingAdvice: `Worn today: ${item.name}`,
      createdAt: new Date().toISOString(),
    };
    await handleLogWearOutfit(mockOutfit);
  };

  // Wardrobe Items CRUD
  const handleSaveItem = async (item: ClothingItem) => {
    const updated = await saveWardrobeItem(item, currentUser?.id);
    setWardrobe(updated);
    setItemToEdit(null);
    showToast(itemToEdit ? 'Garment updated!' : 'New garment added to closet!');
    produceOutfit();
  };

  const handleDeleteItem = async (id: string) => {
    const updated = await deleteWardrobeItem(id, currentUser?.id);
    setWardrobe(updated);
    showToast('Garment deleted from wardrobe.');
    produceOutfit();
  };

  const handleToggleFavorite = async (id: string) => {
    const updated = await toggleFavoriteItem(id, currentUser?.id);
    setWardrobe(updated);
  };

  const handleLoadSamples = async () => {
    const samples = await resetToSampleWardrobe(currentUser?.id);
    setWardrobe(samples);
    showToast('Curated wardrobe loaded!');
    produceOutfit();
  };

  const activeUserName = currentUser ? currentUser.name : 'Jinali';

  // If logged out or no user is signed in, display the dedicated Landing & Login page
  if (!currentUser) {
    return <LandingPage onLoginSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] pb-24 md:pb-12 text-stone-900 selection:bg-amber-100 selection:text-amber-900">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tempUnit={tempUnit}
        setTempUnit={handleUnitToggle}
        onOpenAddModal={() => {
          setItemToEdit(null);
          setIsAddModalOpen(true);
        }}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        totalItems={wardrobe.length}
        savedOutfitsCount={savedOutfits.length}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenChangePasswordModal={() => setIsChangePasswordModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-stone-900 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span>✨</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 flex-1 w-full space-y-6 sm:space-y-8">
        {/* Tab 1: Today's Outfit Generator */}
        {activeTab === 'outfit' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Curated Personalized Luxury Welcome Header */}
            <div className="relative bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-stone-800">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-2 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-200 text-xs font-medium tracking-wide backdrop-blur-xs border border-white/10">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Curated for {activeUserName}</span>
                  </span>
                  {currentUser && (
                    <span className="text-xs text-stone-400 font-mono">
                      @{currentUser.username}
                    </span>
                  )}
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-50">
                  Good {getTimeGreeting()}, {activeUserName}
                </h1>
                <p className="text-stone-300 text-sm sm:text-base font-light max-w-xl leading-relaxed">
                  Your morning ensemble is calibrated to {weather?.city ? `${weather.city}'s` : 'today\'s'} live forecast ({weather ? `${Math.round(weather.temperature)}°C` : '...'}) for effortless comfort with zero decision fatigue.
                </p>
              </div>

              {/* Quick Closet Snapshot & Actions */}
              <div className="flex items-center gap-3 self-start md:self-auto bg-white/10 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/10 relative z-10">
                <div className="text-center px-3 border-r border-white/10">
                  <p className="text-[10px] uppercase tracking-wider font-medium text-stone-400">Closet</p>
                  <p className="font-serif text-xl font-bold text-white">{wardrobe.length}</p>
                </div>
                <div className="text-center px-3 border-r border-white/10">
                  <p className="text-[10px] uppercase tracking-wider font-medium text-stone-400">Saved</p>
                  <p className="font-serif text-xl font-bold text-white">{savedOutfits.length}</p>
                </div>
                <div className="flex items-center gap-1.5 ml-1">
                  <button
                    onClick={() => {
                      setItemToEdit(null);
                      setIsAddModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition-all"
                    title="Add clothes"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span className="hidden sm:inline">Add Piece</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Weather Widget */}
            <WeatherWidget
              weather={weather}
              loading={weatherLoading}
              tempUnit={tempUnit}
              onRefresh={handleRefreshWeather}
              onSelectCity={handleSelectCity}
              onUseCurrentLocation={handleUseGPS}
            />

            {/* Generated Outfit Layout */}
            <OutfitGenerator
              outfit={currentOutfit}
              wardrobe={wardrobe}
              weather={weather}
              tempUnit={tempUnit}
              occasion={occasion}
              setOccasion={(newOcc) => {
                setOccasion(newOcc);
                produceOutfit({}, newOcc);
              }}
              onGenerateNew={(locked) => produceOutfit(locked)}
              onSaveOutfit={handleSaveOutfit}
              onLogWearToday={handleLogWearOutfit}
              onOpenAddModal={() => {
                setItemToEdit(null);
                setIsAddModalOpen(true);
              }}
              onLoadSamples={handleLoadSamples}
              userName={activeUserName}
            />
          </div>
        )}

        {/* Tab 2: My Closet */}
        {activeTab === 'wardrobe' && (
          <ClosetView
            wardrobe={wardrobe}
            onOpenAddModal={() => {
              setItemToEdit(null);
              setIsAddModalOpen(true);
            }}
            onEditItem={(item) => {
              setItemToEdit(item);
              setIsAddModalOpen(true);
            }}
            onDeleteItem={handleDeleteItem}
            onToggleFavorite={handleToggleFavorite}
            onLoadSampleCloset={handleLoadSamples}
            onLogWearItem={handleLogWearSinglePiece}
          />
        )}

        {/* Tab 3: Saved Looks */}
        {activeTab === 'saved' && (
          <SavedOutfitsView
            savedOutfits={savedOutfits}
            tempUnit={tempUnit}
            onRemoveSaved={handleRemoveSaved}
            onLogWear={handleLogWearOutfit}
            onGoToOutfitGenerator={() => setActiveTab('outfit')}
          />
        )}

        {/* Tab 4: Wear History */}
        {activeTab === 'history' && (
          <WearHistoryView
            logs={wearLogs}
            wardrobe={wardrobe}
            onGoToOutfitGenerator={() => setActiveTab('outfit')}
          />
        )}
      </main>

      {/* Add / Edit Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setItemToEdit(null);
        }}
        onSave={handleSaveItem}
        itemToEdit={itemToEdit}
      />

      {/* Settings & Backup Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onDataChanged={() => loadUserData(currentUser)}
        userId={currentUser?.id}
      />

      {/* Authentication Modal (Sign In / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        currentUser={currentUser}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        userId={currentUser?.id || ''}
        onSuccess={(msg) => showToast(msg)}
      />
    </div>
  );
};

export default App;
