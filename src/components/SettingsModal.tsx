import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Check,
  AlertTriangle,
  Database,
  CloudSun,
  ShieldCheck,
} from 'lucide-react';
import {
  exportAllData,
  importData,
  resetToSampleWardrobe,
  clearAllWardrobe,
} from '../services/storageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
  userId?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
  userId = 'user_jinali',
}) => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setExporting(true);
      const jsonStr = await exportAllData(userId);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aura-closet-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Backup downloaded successfully!' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to export backup.' });
    } finally {
      setExporting(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const res = await importData(content, userId);
          setMessage({
            type: 'success',
            text: `Restored ${res.itemsCount} wardrobe garments successfully!`,
          });
          onDataChanged();
        } catch (parseErr) {
          setMessage({ type: 'error', text: 'Invalid JSON backup file.' });
        } finally {
          setImporting(false);
        }
      };
      reader.readAsText(file);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Import failed.' });
      setImporting(false);
    }
  };

  const handleResetSample = async () => {
    try {
      await resetToSampleWardrobe(userId);
      setMessage({ type: 'success', text: 'Sample wardrobe restored.' });
      onDataChanged();
    } catch (err) {
      setMessage({ type: 'error', text: 'Reset failed.' });
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllWardrobe(userId);
      setMessage({ type: 'success', text: 'Closet cleared.' });
      setShowClearConfirm(false);
      onDataChanged();
    } catch (err) {
      setMessage({ type: 'error', text: 'Clear failed.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Wardrobe Settings & Backup
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Manage your local storage, data backups, and closet presets.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {message && (
            <div
              className={`p-3 rounded-2xl text-xs font-medium flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <Check className="w-4 h-4 shrink-0" />
              <span>{message.text}</span>
            </div>
          )}

          {/* Backup & Export */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-600 mb-3 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-amber-600" />
              <span>Data Portability & Backup</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-stone-300 text-xs font-semibold text-stone-800 hover:bg-stone-50 hover:border-stone-400 transition-all shadow-xs"
              >
                <Download className="w-4 h-4 text-stone-600" />
                <span>{exporting ? 'Exporting...' : 'Export JSON Backup'}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-stone-300 text-xs font-semibold text-stone-800 hover:bg-stone-50 hover:border-stone-400 transition-all shadow-xs"
              >
                <Upload className="w-4 h-4 text-stone-600" />
                <span>{importing ? 'Restoring...' : 'Restore from JSON'}</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportFile}
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-2">
              All your garment photos and outfit logs are stored locally in your browser's IndexedDB. Export a backup anytime to transfer between devices.
            </p>
          </div>

          {/* Sample Wardrobe Presets */}
          <div className="pt-4 border-t border-stone-100">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-600 mb-3 flex items-center gap-1.5">
              <CloudSun className="w-4 h-4 text-amber-600" />
              <span>Presets & Reset</span>
            </h3>

            <div className="space-y-2.5">
              <button
                onClick={handleResetSample}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200 text-left transition-colors"
              >
                <div>
                  <p className="text-xs font-semibold text-stone-900">
                    Reload Curated Sample Closet
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Replace closet with our editorial library of versatile pieces
                  </p>
                </div>
                <RefreshCw className="w-4 h-4 text-stone-500" />
              </button>

              {!showClearConfirm ? (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-rose-50/50 hover:bg-rose-50 border border-rose-200 text-left transition-colors text-rose-800"
                >
                  <div>
                    <p className="text-xs font-semibold">Clear All Closet Items</p>
                    <p className="text-[11px] text-rose-600">Start from a completely empty wardrobe</p>
                  </div>
                  <Trash2 className="w-4 h-4 text-rose-600" />
                </button>
              ) : (
                <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Are you sure? All custom uploaded clothes will be deleted.</span>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-3 py-1 rounded-xl text-xs bg-white text-stone-700 border border-stone-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="px-3 py-1 rounded-xl text-xs bg-rose-600 text-white font-medium hover:bg-rose-700"
                    >
                      Yes, Clear Closet
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-100/60 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[11px] text-stone-600 leading-relaxed">
              <strong>Private & Secure:</strong> All your wardrobe photos and data stay on your device inside your browser's private storage. Weather is queried via Open-Meteo's open weather API with zero tracking.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 flex justify-end bg-stone-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

