import React from 'react';
import { 
  Bot, 
  MessageSquareCode, 
  Smartphone, 
  History, 
  BookOpen, 
  Download, 
  Plus, 
  Power 
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'rules' | 'simulator' | 'logs' | 'guide';
  setActiveTab: (tab: 'rules' | 'simulator' | 'logs' | 'guide') => void;
  rulesCount: number;
  activeRulesCount: number;
  onAddNewRule: () => void;
  onOpenExportImport: () => void;
  globalEnabled: boolean;
  onToggleGlobal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  rulesCount,
  activeRulesCount,
  onAddNewRule,
  onOpenExportImport,
  globalEnabled,
  onToggleGlobal,
}) => {
  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-emerald-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Brand Logo & Title */}
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-inner shrink-0">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-base sm:text-lg tracking-tight truncate">
                    AutoReply WA
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold rounded-md bg-emerald-700 text-emerald-200 border border-emerald-600 shrink-0">
                    Android Bot
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200 hidden md:block truncate">
                  Balas otomatis WhatsApp berdasarkan kata kunci & jeda waktu (delay)
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center space-x-1.5 sm:space-x-3">
              {/* Global Engine Switch */}
              <button
                onClick={onToggleGlobal}
                title={globalEnabled ? 'Sistem Auto-Reply AKTIF' : 'Sistem Auto-Reply NONAKTIF'}
                className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  globalEnabled
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/50 shadow-xs'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-600'
                }`}
              >
                <Power className={`w-3.5 h-3.5 ${globalEnabled ? 'text-emerald-200 animate-pulse' : 'text-zinc-400'}`} />
                <span className="text-[11px] sm:text-xs font-bold">{globalEnabled ? 'Aktif' : 'Mati'}</span>
              </button>

              {/* Backup / Restore */}
              <button
                onClick={onOpenExportImport}
                className="p-1.5 sm:p-2 rounded-lg bg-emerald-700/60 hover:bg-emerald-700 text-emerald-100 hover:text-white transition"
                title="Cadangkan / Impor Aturan"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Add Rule Button (Desktop only, mobile has floating action button or inline) */}
              <button
                onClick={onAddNewRule}
                className="hidden sm:flex items-center space-x-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold shadow-xs transition"
              >
                <Plus className="w-4 h-4 text-emerald-700" />
                <span>Tambah Aturan</span>
              </button>
            </div>
          </div>

          {/* Desktop/Tablet Horizontal Tab Navigation (hidden on mobile, replaced by bottom bar) */}
          <div className="hidden sm:flex space-x-2 border-t border-emerald-700/60 py-1.5">
            <button
              onClick={() => setActiveTab('rules')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                activeTab === 'rules'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white'
              }`}
            >
              <MessageSquareCode className="w-4 h-4" />
              <span>Daftar Aturan</span>
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-emerald-900/60 text-emerald-200">
                {activeRulesCount}/{rulesCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                activeTab === 'simulator'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Simulasi HP Android</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                activeTab === 'logs'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Riwayat Balasan</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                activeTab === 'guide'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Panduan Pasang di HP</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (App-like feel on mobile phones) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200/90 shadow-lg pb-safe">
        <div className="grid grid-cols-4 h-16">
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex flex-col items-center justify-center space-y-1 relative transition ${
              activeTab === 'rules' ? 'text-emerald-700 font-bold' : 'text-zinc-500 font-medium'
            }`}
          >
            <div className="relative">
              <MessageSquareCode className={`w-5 h-5 ${activeTab === 'rules' ? 'text-emerald-600 stroke-[2.5]' : ''}`} />
              <span className="absolute -top-1 -right-2 px-1 py-0.2 text-[9px] font-bold rounded-full bg-emerald-600 text-white leading-none">
                {activeRulesCount}
              </span>
            </div>
            <span className="text-[10px]">Aturan</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex flex-col items-center justify-center space-y-1 relative transition ${
              activeTab === 'simulator' ? 'text-emerald-700 font-bold' : 'text-zinc-500 font-medium'
            }`}
          >
            <div className="relative">
              <Smartphone className={`w-5 h-5 ${activeTab === 'simulator' ? 'text-emerald-600 stroke-[2.5]' : ''}`} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </div>
            <span className="text-[10px]">Simulasi</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex flex-col items-center justify-center space-y-1 transition ${
              activeTab === 'logs' ? 'text-emerald-700 font-bold' : 'text-zinc-500 font-medium'
            }`}
          >
            <History className={`w-5 h-5 ${activeTab === 'logs' ? 'text-emerald-600 stroke-[2.5]' : ''}`} />
            <span className="text-[10px]">Riwayat</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex flex-col items-center justify-center space-y-1 transition ${
              activeTab === 'guide' ? 'text-emerald-700 font-bold' : 'text-zinc-500 font-medium'
            }`}
          >
            <BookOpen className={`w-5 h-5 ${activeTab === 'guide' ? 'text-emerald-600 stroke-[2.5]' : ''}`} />
            <span className="text-[10px]">Panduan</span>
          </button>
        </div>
      </nav>
    </>
  );
};
