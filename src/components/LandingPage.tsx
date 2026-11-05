import React, { useState } from 'react';
import {
  Sparkles,
  CloudSun,
  Shirt,
  ArrowRight,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Check,
  Heart,
  Coffee,
  Sun,
  Umbrella,
  Code2,
  Terminal,
  Cpu,
  Car,
  Shield,
  Laptop,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { User } from '../types/auth';
import { loginUser, registerUser, resetPassword } from '../services/authService';
import { evaluatePasswordStrength } from '../services/cryptoService';

interface LandingPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordStrength = evaluatePasswordStrength(password);

  const getStrengthBarColor = () => {
    switch (passwordStrength.label) {
      case 'Too Weak':
        return 'bg-rose-500';
      case 'Weak':
        return 'bg-orange-500';
      case 'Medium':
        return 'bg-amber-500';
      case 'Strong':
        return 'bg-emerald-500';
      case 'Very Strong':
        return 'bg-emerald-600';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await loginUser(username, password);
        if (!res.success || !res.user) {
          setError(res.error || 'Incorrect User ID or password.');
          setLoading(false);
          return;
        }
        onLoginSuccess(res.user);
      } else if (mode === 'register') {
        if (!passwordStrength.isValid) {
          setError(`Password requirements: ${passwordStrength.feedback.join(', ')}`);
          setLoading(false);
          return;
        }

        const res = await registerUser(name, username, password);
        if (!res.success || !res.user) {
          setError(res.error || 'Could not create account.');
          setLoading(false);
          return;
        }
        onLoginSuccess(res.user);
      } else if (mode === 'reset') {
        if (!username.trim()) {
          setError('Please enter your User ID.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('New password and confirm password do not match.');
          setLoading(false);
          return;
        }
        if (!passwordStrength.isValid) {
          setError(`Password requirements: ${passwordStrength.feedback.join(', ')}`);
          setLoading(false);
          return;
        }

        const res = await resetPassword(username, password);
        if (!res.success || !res.user) {
          setError(res.error || 'Could not reset password.');
          setLoading(false);
          return;
        }
        onLoginSuccess(res.user);
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 selection:bg-rose-100 selection:text-rose-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="w-full border-b border-stone-200/70 bg-[#FAF8F5]/85 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo with Girl-in-Tech touch */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-stone-900 via-stone-850 to-stone-800 text-stone-50 flex items-center justify-center font-serif text-xl font-bold shadow-sm relative group">
              <span>A</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-white ring-1 ring-rose-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900 block leading-tight">
                  Aura Closet
                </span>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                  v2.0
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-sans text-stone-500 tracking-wider uppercase block">
                Weather Stylist • Code Meets Closet
              </span>
            </div>
          </div>

          {/* Quick Nav / Tag */}
          <div className="flex items-center gap-3">
            <div className="hidden md:inline-flex items-center gap-1.5 text-xs text-stone-600 bg-white/90 px-3 py-1.5 rounded-full border border-stone-200 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>Created with code & style by <strong>Jinali</strong></span>
            </div>
            <button
              onClick={() => {
                setMode('login');
                document.getElementById('auth-card')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-all shadow-xs hover:shadow hover:-translate-y-0.5"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-16 sm:pb-24 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-start">
          {/* Left Column: Girl-in-Tech Editorial Hero & Interactive Preview */}
          <div className="lg:col-span-7 space-y-7">
            <div className="space-y-4">
              {/* Fun Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 text-stone-800 text-xs font-medium tracking-wide border border-rose-200/60 shadow-xs">
                <Code2 className="w-3.5 h-3.5 text-rose-500" />
                <span className="font-semibold text-rose-700">Tech × Fashion:</span>
                <span>Deterministic weather styling</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.12]">
                Smart code compiled for your daily wardrobe.{' '}
                <span className="italic font-normal text-rose-700 block mt-1">
                  Dressing for the forecast shouldn't be a dilemma.
                </span>
              </h1>

              <p className="text-stone-600 text-base sm:text-lg font-light leading-relaxed max-w-xl">
                When you love clean code and timeless fashion, standing in front of a packed closet with <em>"nothing to wear"</em> is a bug, not a feature. Aura Closet connects live meteorological telemetry to your real clothes—compiling chic, temperature-calibrated outfits in seconds.
              </p>
            </div>

            {/* Terminal Chic Meets High Fashion Preview Card */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
              {/* Mini Terminal Header Bar */}
              <div className="px-4 py-2.5 bg-stone-900 text-stone-300 text-xs flex items-center justify-between border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="font-mono text-[11px] text-stone-400 ml-2">
                    jinali@aura-stylist: ~/morning_routine.sh
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
                  status: 0 bugs, 100% styled
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2 text-xs">
                    <CloudSun className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold text-stone-900">Live Forecast: 16°C • Chilly Breeze</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-rose-700 font-mono text-[11px]">rain_risk: 15%</span>
                  </div>
                  <span className="text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                    96% Weather Match
                  </span>
                </div>

                {/* Garment Preview Flat-lay */}
                <div className="grid grid-cols-4 gap-2.5">
                  <div className="group relative aspect-square rounded-2xl bg-stone-50 border border-stone-200 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&auto=format&fit=crop&q=80"
                      alt="Camel Trench"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[9px] px-1.5 py-0.2 rounded font-mono">
                      outerwear
                    </span>
                  </div>

                  <div className="group relative aspect-square rounded-2xl bg-stone-50 border border-stone-200 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=400&auto=format&fit=crop&q=80"
                      alt="Merino Knit"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[9px] px-1.5 py-0.2 rounded font-mono">
                      knitwear
                    </span>
                  </div>

                  <div className="group relative aspect-square rounded-2xl bg-stone-50 border border-stone-200 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&auto=format&fit=crop&q=80"
                      alt="Linen Trousers"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[9px] px-1.5 py-0.2 rounded font-mono">
                      bottom
                    </span>
                  </div>

                  <div className="group relative aspect-square rounded-2xl bg-stone-50 border border-stone-200 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&auto=format&fit=crop&q=80"
                      alt="Ankle Boots"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[9px] px-1.5 py-0.2 rounded font-mono">
                      footwear
                    </span>
                  </div>
                </div>

                {/* Stylist Algorithm Tip */}
                <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100 flex items-start gap-2.5 text-xs text-stone-700">
                  <Sparkles className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    <strong className="text-stone-900 font-semibold">Compiler Advice: </strong>
                    Layer the trench open over the ribbed knit to withstand the 18 km/h morning wind without overheating by lunchtime. Effortless and chic.
                  </p>
                </div>
              </div>
            </div>

            {/* Girl-in-Tech Vibe Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-3 rounded-2xl bg-white border border-stone-200/80 text-center shadow-xs">
                <Coffee className="w-4 h-4 text-amber-700 mx-auto mb-1" />
                <p className="text-[11px] font-semibold text-stone-800">Matcha & Code</p>
                <p className="text-[10px] text-stone-400">Zero panic mornings</p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-stone-200/80 text-center shadow-xs">
                <Code2 className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                <p className="text-[11px] font-semibold text-stone-800">Smart Logic</p>
                <p className="text-[10px] text-stone-400">Deterministic code</p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-stone-200/80 text-center shadow-xs">
                <Sun className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <p className="text-[11px] font-semibold text-stone-800">Forecast Sync</p>
                <p className="text-[10px] text-stone-400">Live temperature</p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-stone-200/80 text-center shadow-xs">
                <Heart className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                <p className="text-[11px] font-semibold text-stone-800">Fashion First</p>
                <p className="text-[10px] text-stone-400">Love your closet</p>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Sign In / Register Card */}
          <div className="lg:col-span-5" id="auth-card">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200/90 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-stone-800 to-amber-600" />

              {/* Mode Toggle Tabs */}
              <div className="flex bg-stone-100 p-1 rounded-2xl text-xs font-semibold mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl transition-all ${
                    mode === 'login'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl transition-all ${
                    mode === 'register'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Create Closet
                </button>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  {mode === 'login'
                    ? 'Open Your Wardrobe'
                    : mode === 'register'
                    ? 'Join the Closet'
                    : 'Reset Password'}
                </h2>
                <p className="text-xs text-stone-500 mt-1 mb-5">
                  {mode === 'login'
                    ? 'Enter your User ID and password to see today’s curated look.'
                    : mode === 'register'
                    ? 'Set up an ID and password to catalog your personal clothes.'
                    : 'Enter your User ID and set a new password to recover access.'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                    {error}
                  </div>
                )}

                {/* Name field (Register only) */}
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                      Your Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                      />
                    </div>
                  </div>
                )}

                {/* User ID field */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                    User ID *
                  </label>
                  <div className="relative">
                    <span className="text-sm font-semibold text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2">
                      @
                    </span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      placeholder="your_id"
                      className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                      {mode === 'reset' ? 'New Password *' : 'Password *'}
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('reset');
                          setError(null);
                          setPassword('');
                          setConfirmPassword('');
                        }}
                        className="text-[11px] font-medium text-rose-600 hover:text-rose-800 transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'reset' ? 'Enter new password' : 'Enter password'}
                      className="w-full pl-10 pr-10 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                      title={showPassword ? 'Hide' : 'Show'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Live Password Strength Meter (Register & Reset) */}
                  {(mode === 'register' || mode === 'reset') && password && (
                    <div className="mt-2 space-y-1.5 animate-in fade-in">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-500">Security Strength:</span>
                        <span className="font-semibold text-stone-800">{passwordStrength.label}</span>
                      </div>
                      <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden flex gap-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-full flex-1 rounded-full transition-colors ${
                              passwordStrength.score >= step ? getStrengthBarColor() : 'bg-stone-200'
                            }`}
                          />
                        ))}
                      </div>
                      {passwordStrength.feedback.length > 0 && (
                        <p className="text-[10px] text-stone-400">
                          Needs: {passwordStrength.feedback.join(' • ')}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm Password (Reset mode) */}
                {mode === 'reset' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                      />
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all hover:shadow hover:-translate-y-0.5 flex items-center justify-center gap-2 pt-3"
                >
                  <span>
                    {loading
                      ? 'Authenticating...'
                      : mode === 'login'
                      ? 'Open My Wardrobe'
                      : mode === 'register'
                      ? 'Create My Account'
                      : 'Reset Password & Open Closet'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {mode === 'reset' && (
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setError(null);
                        setPassword('');
                        setConfirmPassword('');
                      }}
                      className="text-xs text-stone-600 hover:text-stone-900 font-medium transition-colors"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                )}
              </form>

              <div className="mt-5 p-3 rounded-2xl bg-rose-50/50 border border-rose-100 text-center text-[11px] text-stone-600 font-medium">
                ✨ Your wardrobe stays private and encrypted on your device.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Story Section: "Girl in Tech Meets Fashion" */}
      <section className="py-16 sm:py-24 bg-white border-y border-stone-200/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FAF8F5] rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-sm relative overflow-hidden space-y-6">
            {/* Header Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200/60">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-stone-900 text-stone-100 flex items-center justify-center font-serif text-2xl font-bold shadow-md shrink-0 relative">
                  <span>J</span>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-[9px] text-white">
                    💻
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                      Meet the Creator
                    </span>
                    <span className="text-xs text-stone-400">•</span>
                    <span className="text-xs font-mono text-stone-500">
                      Jinali Makwana
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900 mt-1">
                    Automotive Cybersecurity Engineer & Founder of Aura Closet
                  </h2>
                </div>
              </div>
            </div>

            {/* Narrative with the genuine Girl in Tech vibe */}
            <div className="space-y-4 text-stone-700 text-sm sm:text-base font-light leading-relaxed">
              <p className="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-snug">
                "By day, I work as an automotive cybersecurity engineer securing connected vehicles. But every morning, the hardest problem I had to solve was simply standing in front of my closet wondering what to wear."
              </p>

              <p>
                I love working on cutting-edge automotive tech, threat modeling, and writing code. But let’s be honest: standing in front of a closet full of clothes in a towel, checking three weather apps, and thinking <em>'I have nothing to wear'</em> was the worst way to start my day.
              </p>

              <p>
                Will I freeze on the drive? Is that jacket warm enough for 14°C? Will it rain by 3 PM? I would spend 15 minutes trying on different pieces, running late, and burning out my mental energy before I even opened my laptop.
              </p>

              <p>
                So I did what any girl in tech would do — <strong>I wrote an algorithm to solve it.</strong>
              </p>

              <p>
                I built <strong>Aura Closet</strong> to treat my wardrobe like a smart system: snap photos of the clothes I actually own, connect them to real-time weather data, and let deterministic logic generate the ideal, weather-proof look in seconds.
              </p>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50/80 via-amber-50/50 to-rose-50/60 border border-rose-200/60 flex items-start gap-3 text-xs sm:text-sm text-stone-800">
                <Coffee className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>The Girl in Tech Philosophy:</strong> Who says you can’t love cybersecurity and fashion at the same time? Getting dressed should be fun, fast, and weather-proof so you can focus on building cool things.
                </p>
              </div>

              <div className="pt-2 text-xs text-stone-500 font-serif italic">
                — With love & clean code, Jinali ✨🚗💻
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Simple Steps */}
      <section className="bg-[#FAF8F5] py-16 sm:py-20 border-b border-stone-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl font-bold text-stone-900">
              How the Algorithm Works
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              Smart weather telemetry meets your real wardrobe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-900 flex items-center justify-center font-serif font-bold text-base">
                1
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Catalog Real Clothes
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Snap photos from your phone. Tag warmth levels (Light, Moderate, Warm, Heavy) and rain resistance.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-serif font-bold text-base">
                2
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Weather Telemetry Sync
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Pulls live temperature, wind speed, and rain probability automatically for your location.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-serif font-bold text-base">
                3
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Compiled in Seconds
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Get a balanced outfit ready to wear. Lock your staple pieces and shuffle the rest on the fly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Minimalist Footer */}
      <footer className="py-10 bg-white text-center text-xs text-stone-500 space-y-2">
        <p className="font-serif font-bold text-stone-800 text-sm">Aura Closet</p>
        <p>Built with matcha, clean code & style by Jinali Makwana.</p>
        <p className="text-[11px] text-stone-400">All data & photos stored privately in your browser.</p>
      </footer>
    </div>
  );
};
