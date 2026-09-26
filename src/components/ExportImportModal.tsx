import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  Copy, 
  Check, 
  FileJson, 
  AlertCircle 
} from 'lucide-react';
import { AutoReplyRule } from '../types/autoreply';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: AutoReplyRule[];
  onImportRules: (rules: AutoReplyRule[]) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  rules,
  onImportRules,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'export' | 'import'>('export');
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const jsonString = JSON.stringify(rules, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autoreply-wa-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setError('');
    setSuccess('');
    try {
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) {
        throw new Error('Format data harus berupa array aturan JSON');
      }

      // Basic validation
      const validRules = parsed.map((item: any, idx: number) => {
        if (!item.keyword || !item.replyMessage) {
          throw new Error(`Aturan #${idx + 1} tidak memiliki kata kunci atau pesan balasan`);
        }
        return {
          id: item.id || `rule-imported-${Date.now()}-${idx}`,
          keyword: String(item.keyword),
          matchType: item.matchType || 'contains',
          replyMessage: String(item.replyMessage),
          delaySeconds: typeof item.delaySeconds === 'number' ? item.delaySeconds : 5,
          isActive: item.isActive !== false,
          replyCount: item.replyCount || 0,
          createdAt: item.createdAt || Date.now(),
          caseSensitive: !!item.caseSensitive,
        };
      });

      onImportRules(validRules);
      setSuccess(`Berhasil mengimpor ${validRules.length} aturan!`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Format JSON tidak valid');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <FileJson className="w-5 h-5 text-emerald-200" />
            <h3 className="text-base font-bold">Cadangkan & Pulihkan Aturan</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-zinc-200 bg-zinc-50">
          <button
            onClick={() => setActiveSubTab('export')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition ${
              activeSubTab === 'export'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Ekspor / Cadangkan
          </button>
          <button
            onClick={() => setActiveSubTab('import')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition ${
              activeSubTab === 'import'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Impor / Pulihkan
          </button>
        </div>

        <div className="p-6">
          {activeSubTab === 'export' ? (
            <div className="space-y-4">
              <p className="text-xs text-zinc-600">
                Unduh atau salin seluruh daftar kata kunci dan balasan Anda agar tidak hilang atau dapat dipindahkan ke perangkat lain.
              </p>

              <textarea
                readOnly
                value={jsonString}
                rows={8}
                className="w-full p-3 font-mono text-xs bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-700 select-all"
              />

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Tersalin!' : 'Salin JSON'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File .json</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-zinc-600">
                Tempelkan teks data JSON aturan yang sebelumnya Anda cadangkan di bawah ini:
              </p>

              {error && (
                <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{success}</span>
                </div>
              )}

              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="[ { &quot;keyword&quot;: &quot;halo&quot;, &quot;replyMessage&quot;: &quot;...&quot;, &quot;delaySeconds&quot;: 5 } ]"
                rows={8}
                className="w-full p-3 font-mono text-xs bg-white border border-zinc-300 rounded-xl text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importText.trim()}
                  className="flex items-center space-x-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  <Upload className="w-4 h-4" />
                  <span>Impor Sekarang</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
