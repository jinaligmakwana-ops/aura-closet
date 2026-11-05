import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Compass,
  Search,
  RefreshCw,
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudRain,
  CloudSnow,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
  Wind,
  Droplets,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { WeatherData, TempUnit, CitySearchResult } from '../types/weather';
import { formatTemp, searchCities } from '../services/weatherService';

interface WeatherWidgetProps {
  weather: WeatherData | null;
  loading: boolean;
  tempUnit: TempUnit;
  onRefresh: () => void;
  onSelectCity: (result: CitySearchResult) => void;
  onUseCurrentLocation: () => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  weather,
  loading,
  tempUnit,
  onRefresh,
  onSelectCity,
  onUseCurrentLocation,
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CitySearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchCities(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderWeatherIcon = (iconName?: string) => {
    const className = "w-8 h-8 sm:w-10 sm:h-10 text-amber-500 animate-pulse";
    switch (iconName) {
      case 'Sun':
        return <Sun className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" />;
      case 'Moon':
        return <Moon className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400" />;
      case 'CloudSun':
        return <CloudSun className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />;
      case 'Cloud':
        return <Cloud className="w-8 h-8 sm:w-10 sm:h-10 text-stone-400" />;
      case 'CloudRain':
        return <CloudRain className="w-8 h-8 sm:w-10 sm:h-10 text-sky-500" />;
      case 'CloudDrizzle':
        return <CloudDrizzle className="w-8 h-8 sm:w-10 sm:h-10 text-sky-400" />;
      case 'CloudSnow':
        return <CloudSnow className="w-8 h-8 sm:w-10 sm:h-10 text-sky-200" />;
      case 'CloudLightning':
        return <CloudLightning className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" />;
      case 'CloudFog':
        return <CloudFog className="w-8 h-8 sm:w-10 sm:h-10 text-stone-400" />;
      default:
        return <CloudSun className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />;
    }
  };

  if (!weather && loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm animate-pulse flex items-center justify-center min-h-[140px]">
        <div className="flex items-center gap-3 text-stone-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Fetching local meteorological data...</span>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="relative bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-sm transition-all hover:shadow-md">
      {/* Top Bar: Location & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div className="relative" ref={dropdownRef}>
          {!isSearching ? (
            <button
              onClick={() => {
                setIsSearching(true);
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }}
              className="flex items-center gap-2 group text-left px-3 py-1.5 -ml-3 rounded-xl hover:bg-stone-50 transition-colors"
            >
              <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-serif text-lg sm:text-xl font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
                {weather.city}
              </span>
              {weather.country && (
                <span className="text-xs font-sans text-stone-500 font-medium bg-stone-100 px-2 py-0.5 rounded-full">
                  {weather.country}
                </span>
              )}
              <ChevronDown className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition-transform" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type a city (e.g. Paris, Tokyo, New York)..."
                  className="pl-9 pr-3 py-1.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 w-64 sm:w-72 bg-white"
                />
              </div>
              <button
                onClick={() => {
                  setIsSearching(false);
                  setSearchQuery('');
                }}
                className="text-xs text-stone-500 hover:text-stone-800 px-2 py-1"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Autocomplete Dropdown */}
          {isSearching && (searchResults.length > 0 || searchLoading) && (
            <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-stone-200 z-50 overflow-hidden divide-y divide-stone-100 animate-in fade-in slide-in-from-top-1">
              {searchLoading ? (
                <div className="p-4 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching worldwide cities...</span>
                </div>
              ) : (
                searchResults.map((city) => (
                  <button
                    key={`${city.latitude}-${city.longitude}-${city.name}`}
                    onClick={() => {
                      onSelectCity(city);
                      setIsSearching(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-amber-50/60 transition-colors flex items-center justify-between text-sm group"
                  >
                    <div>
                      <span className="font-medium text-stone-900 group-hover:text-amber-900">
                        {city.name}
                      </span>
                      {city.admin1 && (
                        <span className="text-xs text-stone-400 ml-1.5">
                          {city.admin1}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-stone-400 bg-stone-50 px-2 py-0.5 rounded border border-stone-100">
                      {city.country}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right buttons: GPS Location + Refresh */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onUseCurrentLocation}
            title="Use my current GPS location"
            className="flex items-center gap-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200/80 px-3 py-1.5 rounded-full transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Current GPS</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh weather data"
            className="p-1.5 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Weather Display */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-5 items-center">
        {/* Left: Temp and Condition */}
        <div className="md:col-span-6 flex items-center gap-4 sm:gap-6">
          <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-100/60 shadow-inner">
            {renderWeatherIcon(weather.icon)}
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-stone-900">
                {formatTemp(weather.temperature, tempUnit)}
              </span>
              <span className="text-sm font-medium text-stone-500">
                Feels like {formatTemp(weather.apparentTemperature, tempUnit)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-medium text-stone-800 text-sm sm:text-base">
                {weather.condition}
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-xs text-stone-500">
                H: {formatTemp(weather.tempMax, tempUnit)} / L: {formatTemp(weather.tempMin, tempUnit)}
              </span>
            </div>
          </div>
        </div>

        {/* Middle: Atmospheric metrics */}
        <div className="md:col-span-6 flex items-center justify-between sm:justify-end gap-3 sm:gap-6 text-xs border-t md:border-t-0 pt-3 md:pt-0 border-stone-100">
          <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-xl border border-stone-100">
            <Droplets className="w-4 h-4 text-sky-500" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Rain Risk</p>
              <p className="font-medium text-stone-800">{weather.precipitationProbability}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-xl border border-stone-100">
            <Wind className="w-4 h-4 text-teal-600" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Wind</p>
              <p className="font-medium text-stone-800">{Math.round(weather.windSpeed)} km/h</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-xl border border-stone-100">
            <Sun className="w-4 h-4 text-amber-500" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Humidity</p>
              <p className="font-medium text-stone-800">{weather.humidity}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stylist Insight Banner */}
      <div className="mt-5 p-3.5 bg-gradient-to-r from-amber-50/70 via-stone-50 to-amber-50/40 rounded-2xl border border-amber-200/50 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
          <strong className="font-semibold text-stone-900">Stylist Weather Insight: </strong>
          {weather.recommendation}
        </p>
      </div>
    </div>
  );
};
