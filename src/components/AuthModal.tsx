import React, { useState } from 'react';
import {
  X,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Shield,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { User } from '../types/auth';
import { loginUser, registerUser, resetPassword } from '../services/authService';
import { evaluatePasswordStrength } from '../services/cryptoService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  currentUser: User | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const passwordStrength = evaluatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await loginUser(username, password);
        if (!res.success || !res.user) {
          setError(res.error || 'Failed to sign in.');
          setLoading(false);
          return;
        }
        onSuccess(res.user);
        onClose();
      } else if (mode === 'register') {
        if (!passwordStrength.isValid) {
          setError(`Password must meet security standards: ${passwordStrength.feedback.join(', ')}`);
          setLoading(false);
          return;
        }

        const res = await registerUser(name, username, password);
        if (!res.success || !res.user) {
          setError(res.error || 'Failed to create account.');
          setLoading(false);
          return;
        }
        onSuccess(res.user);
        onClose();
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
          setError(`Password must meet security standards: ${passwordStrength.feedback.join(', ')}`);
          setLoading(false);
          return;
        }

        const res = await resetPassword(username, password);
        if (!res.success || !res.user) {
          setError(res.error || 'Failed to reset password.');
          setLoading(false);
          return;
        }
        onSuccess(res.user);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>Aura Closet • Digital Stylist</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              {mode === 'login'
                ? 'Sign In'
                : mode === 'register'
                ? 'Create Private Closet'
                : 'Reset Password'}
            </h2>
          </div>
          {currentUser && (
            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tab Toggle: Sign In vs Create Account */}
        <div className="px-6 pt-5">
          <div className="flex bg-stone-100 p-1 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
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
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name (Registration only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                Your Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>
            </div>
          )}

          {/* User ID */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
              User ID / Username *
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
                placeholder="your_username"
                className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>
          </div>

          {/* Password */}
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
                  className="text-[11px] font-medium text-stone-500 hover:text-stone-900 transition-colors"
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
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Live Password Strength Meter (Registration & Reset) */}
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
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-stone-900 text-white text-xs sm:text-sm font-semibold hover:bg-stone-800 shadow-sm transition-all hover:shadow flex items-center justify-center gap-2 mt-2"
          >
            <span>
              {loading
                ? 'Authenticating...'
                : mode === 'login'
                ? 'Sign In to Closet'
                : mode === 'register'
                ? 'Create My Private Account'
                : 'Reset Password & Sign In'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Back to sign in link for Reset mode */}
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

          {/* Friendly Note */}
          <div className="pt-2 p-3 rounded-2xl bg-stone-50 border border-stone-200/70 text-center text-[11px] text-stone-500">
            Your private wardrobe is saved securely on your device.
          </div>
        </form>
      </div>
    </div>
  );
};
