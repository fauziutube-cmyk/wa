import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  MessageSquare, 
  Tag, 
  Zap, 
  Check 
} from 'lucide-react';
import { AutoReplyRule, MatchType } from '../types/autoreply';

interface RuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: Omit<AutoReplyRule, 'id' | 'createdAt' | 'replyCount'>, id?: string) => void;
  editingRule?: AutoReplyRule | null;
}

const PRESET_DELAYS = [
  { label: '0s (Instan)', value: 0 },
  { label: '3 detik', value: 3 },
  { label: '5 detik (Alami)', value: 5 },
  { label: '10 detik', value: 10 },
  { label: '15 detik', value: 15 },
  { label: '30 detik', value: 30 },
];

export const RuleModal: React.FC<RuleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRule,
}) => {
  const [keyword, setKeyword] = useState('');
  const [matchType, setMatchType] = useState<MatchType>('contains');
  const [replyMessage, setReplyMessage] = useState('');
  const [delaySeconds, setDelaySeconds] = useState<number>(5);
  const [customDelay, setCustomDelay] = useState<string>('');
  const [isCustomDelay, setIsCustomDelay] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingRule) {
      setKeyword(editingRule.keyword);
      setMatchType(editingRule.matchType);
      setReplyMessage(editingRule.replyMessage);
      setDelaySeconds(editingRule.delaySeconds);
      setIsActive(editingRule.isActive);
      setCaseSensitive(!!editingRule.caseSensitive);
      
      const foundPreset = PRESET_DELAYS.some(p => p.value === editingRule.delaySeconds);
      if (foundPreset) {
        setIsCustomDelay(false);
        setCustomDelay('');
      } else {
        setIsCustomDelay(true);
        setCustomDelay(editingRule.delaySeconds.toString());
      }
    } else {
      setKeyword('');
      setMatchType('contains');
      setReplyMessage('');
      setDelaySeconds(5);
      setIsCustomDelay(false);
      setCustomDelay('');
      setIsActive(true);
      setCaseSensitive(false);
    }
    setError('');
  }, [editingRule, isOpen]);

  if (!isOpen) return null;

  const handleInsertTag = (tag: string) => {
    setReplyMessage(prev => prev + tag);
  };

  const handleSelectDelay = (seconds: number) => {
    setIsCustomDelay(false);
    setDelaySeconds(seconds);
    setCustomDelay('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) {
      setError('Kata kunci pemicu tidak boleh kosong');
      return;
    }
    if (!replyMessage.trim()) {
      setError('Pesan balasan tidak boleh kosong');
      return;
    }

    const finalDelay = isCustomDelay ? Math.max(0, parseInt(customDelay, 10) || 0) : delaySeconds;

    onSave(
      {
        keyword: keyword.trim(),
        matchType,
        replyMessage: replyMessage.trim(),
        delaySeconds: finalDelay,
        isActive,
        caseSensitive,
      },
      editingRule ? editingRule.id : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center sm:items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header (Sticky inside modal) */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-emerald-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-700">
              <MessageSquare className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold leading-tight">
                {editingRule ? 'Edit Aturan Balas' : 'Tambah Aturan Balas'}
              </h3>
              <p className="text-[11px] text-emerald-200 leading-tight">
                Kata kunci & jeda waktu tunggu (delay)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 active:bg-emerald-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
              {error}
            </div>
          )}

          {/* 1. Kata Kunci */}
          <div className="space-y-2 bg-zinc-50 p-3 sm:p-4 rounded-xl border border-zinc-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span>1. Kata Kunci yang Diterima</span>
              </label>
              <label className="text-[11px] text-zinc-500 flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  className="mr-1 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Case sensitive</span>
              </label>
            </div>

            <input
              type="text"
              placeholder="Contoh: halo, harga, ongkir..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              required
            />

            {/* Tipe Cocok (Mengandung, Sama Persis, Diawali) */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setMatchType('contains')}
                className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold text-center transition ${
                  matchType === 'contains'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                    : 'border-zinc-200 bg-white text-zinc-700'
                }`}
              >
                Mengandung
              </button>

              <button
                type="button"
                onClick={() => setMatchType('exact')}
                className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold text-center transition ${
                  matchType === 'exact'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                    : 'border-zinc-200 bg-white text-zinc-700'
                }`}
              >
                Sama Persis
              </button>

              <button
                type="button"
                onClick={() => setMatchType('starts_with')}
                className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold text-center transition ${
                  matchType === 'starts_with'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                    : 'border-zinc-200 bg-white text-zinc-700'
                }`}
              >
                Diawali
              </button>
            </div>
          </div>

          {/* 2. Pesan Balasan */}
          <div className="space-y-2 bg-zinc-50 p-3 sm:p-4 rounded-xl border border-zinc-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center space-x-1">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. Pesan Balasan Otomatis</span>
              </label>

              {/* Tag Sisipan */}
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => handleInsertTag(' {nama}')}
                  className="px-1.5 py-0.5 text-[10px] bg-white border border-zinc-300 rounded text-zinc-700 active:bg-zinc-100 font-mono"
                >
                  +{'{nama}'}
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTag(' {jam}')}
                  className="px-1.5 py-0.5 text-[10px] bg-white border border-zinc-300 rounded text-zinc-700 active:bg-zinc-100 font-mono"
                >
                  +{'{jam}'}
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              placeholder="Tulis pesan balasan otomatis..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              required
            />
          </div>

          {/* 3. Waktu Tunggu / Delay */}
          <div className="space-y-2 bg-emerald-50/70 p-3 sm:p-4 rounded-xl border border-emerald-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                <span>3. Waktu Tunggu (Delay)</span>
              </label>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                ⏱️ {isCustomDelay ? (parseInt(customDelay, 10) || 0) : delaySeconds} Detik
              </span>
            </div>

            {/* Presets Chips */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {PRESET_DELAYS.map((preset) => {
                const isSelected = !isCustomDelay && delaySeconds === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleSelectDelay(preset.value)}
                    className={`py-1 px-1.5 text-center text-[11px] font-bold rounded-lg border transition ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-zinc-700 border-zinc-300 active:bg-zinc-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setIsCustomDelay(true);
                  if (!customDelay) setCustomDelay(delaySeconds.toString());
                }}
                className={`py-1 px-1.5 text-center text-[11px] font-bold rounded-lg border transition col-span-3 sm:col-span-1 ${
                  isCustomDelay
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-zinc-700 border-zinc-300 active:bg-zinc-100'
                }`}
              >
                Kustom...
              </button>
            </div>

            {isCustomDelay && (
              <div className="mt-2 p-2 bg-white rounded-lg border border-emerald-300 flex items-center space-x-2">
                <span className="text-xs text-zinc-600">Durasi:</span>
                <input
                  type="number"
                  min="0"
                  max="3600"
                  value={customDelay}
                  onChange={(e) => {
                    setCustomDelay(e.target.value);
                    const n = parseInt(e.target.value, 10);
                    if (!isNaN(n)) setDelaySeconds(n);
                  }}
                  className="w-16 px-2 py-1 text-xs border border-zinc-300 rounded font-bold text-center"
                />
                <span className="text-xs text-zinc-600 font-medium">detik</span>
              </div>
            )}
          </div>

          {/* Status Switch */}
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-zinc-600 font-medium">Aktifkan aturan ini:</span>
            <label className="flex items-center cursor-pointer space-x-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600 relative"></div>
              <span className={`text-xs font-semibold ${isActive ? 'text-emerald-700' : 'text-zinc-400'}`}>
                {isActive ? 'Aktif' : 'Mati'}
              </span>
            </label>
          </div>

          {/* Sticky Modal Footer */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-200" />
              <span>Simpan Aturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
