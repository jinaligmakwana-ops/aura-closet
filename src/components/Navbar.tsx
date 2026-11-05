import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Shirt,
  Bookmark,
  Calendar,
  Plus,
  SlidersHorizontal,
  LogOut,
  UserCheck,
  LogIn,
  ChevronDown,
  KeyRound,
} from 'lucide-react';
import { TempUnit } from '../types/weather';
import { User } from '../types/auth';

interface NavbarProps {
  activeTab: 'outfit' | 'wardrobe' | 'saved' | 'history';
  setActiveTab: (tab: 'outfit' | 'wardrobe' | 'saved' | 'history') => void;
  tempUnit: TempUnit;
  setTempUnit: (unit: TempUnit) => void;
  onOpenAddModal: () => void;
  onOpenSettingsModal: () => void;
  totalItems: number;
  savedOutfitsCount: number;
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onOpenChangePasswordModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  tempUnit,
  setTempUnit,
  onOpenAddModal,
  onOpenSettingsModal,
  totalItems,
  savedOutfitsCount,
  currentUser,
  onOpenAuthModal,
  onOpenChangePasswordModal,
  onLogout,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatarLetter = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'J';

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand: Aura Closet */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('outfit')}
              className="flex items-center gap-3 text-left group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-stone-900 via-stone-850 to-stone-800 text-stone-50 flex items-center justify-center font-serif text-xl font-bold shadow-sm relative group-hover:scale-105 transition-transform">
                <span>A</span>
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-white ring-1 ring-rose-200" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900 block leading-tight">
                    Aura Closet
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                    v2.0
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-sans text-stone-500 tracking-wider uppercase block">
                  Weather Stylist • Code Meets Closet
                </span>
              </div>
            </button>
          </div>

          {/* Nav Tabs - Desktop */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-100/80 p-1.5 rounded-full border border-stone-200/70">
            <button
              onClick={() => setActiveTab('outfit')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'outfit'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Today's Outfit</span>
            </button>

            <button
              onClick={() => setActiveTab('wardrobe')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'wardrobe'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <Shirt className="w-4 h-4 text-stone-700" />
              <span>My Closet</span>
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200 font-mono">
                {totalItems}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'saved'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <Bookmark className="w-4 h-4 text-stone-700" />
              <span>Saved Looks</span>
              {savedOutfitsCount > 0 && (
                <span className="ml-0.5 text-xs px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-mono">
                  {savedOutfitsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <Calendar className="w-4 h-4 text-stone-700" />
              <span>Wear History</span>
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Temp Unit Switcher */}
            <div className="flex items-center bg-stone-100 p-1 rounded-full border border-stone-200 text-xs font-semibold">
              <button
                onClick={() => setTempUnit('C')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  tempUnit === 'C'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Celsius"
              >
                °C
              </button>
              <button
                onClick={() => setTempUnit('F')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  tempUnit === 'F'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Fahrenheit"
              >
                °F
              </button>
            </div>

            {/* Add Clothes Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-3.5 sm:px-4 py-2 rounded-full text-sm font-medium shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Clothes</span>
              <span className="sm:hidden">Add</span>
            </button>

            {/* User Profile / Login Dropdown */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 transition-colors shadow-xs"
                  title={`Account: ${currentUser.name}`}
                >
                  <div
                    className="w-7 h-7 rounded-full text-white flex items-center justify-center font-serif text-xs font-bold shrink-0"
                    style={{ backgroundColor: currentUser.avatarColor || '#1C1917' }}
                  >
                    {avatarLetter}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-stone-800 max-w-[80px] truncate">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-1 z-50 animate-in fade-in slide-in-from-top-1 divide-y divide-stone-100">
                    <div className="px-4 py-3">
                      <p className="text-xs font-bold text-stone-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-stone-500 font-mono">ID: @{currentUser.username}</p>
                      <span className="inline-block mt-1 text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Private Closet Active
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenChangePasswordModal();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 font-medium"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-stone-500" />
                        <span>Change Password</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenAuthModal();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 font-medium"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-stone-500" />
                        <span>Switch or Add Account</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenSettingsModal();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 font-medium"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
                        <span>Storage & Backup</span>
                      </button>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-stone-300 text-xs font-semibold text-stone-800 bg-white hover:bg-stone-50 transition-colors shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-600" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-stone-200 py-2 px-3 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('outfit')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'outfit' ? 'text-amber-700 font-semibold' : 'text-stone-500'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>Outfits</span>
        </button>

        <button
          onClick={() => setActiveTab('wardrobe')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'wardrobe' ? 'text-stone-900 font-semibold' : 'text-stone-500'
          }`}
        >
          <Shirt className="w-5 h-5" />
          <span>Closet ({totalItems})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'saved' ? 'text-stone-900 font-semibold' : 'text-stone-500'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span>Saved</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'history' ? 'text-stone-900 font-semibold' : 'text-stone-500'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>History</span>
        </button>
      </div>
    </header>
  );
};
