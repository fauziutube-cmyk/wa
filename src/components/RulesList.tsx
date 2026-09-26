import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Clock, 
  Edit3, 
  Trash2, 
  Play, 
  Sparkles, 
  Tag, 
  Filter
} from 'lucide-react';
import { AutoReplyRule, MatchType } from '../types/autoreply';
import { TEMPLATE_PRESETS } from '../data/presets';

interface RulesListProps {
  rules: AutoReplyRule[];
  onToggleRule: (id: string) => void;
  onEditRule: (rule: AutoReplyRule) => void;
  onDeleteRule: (id: string) => void;
  onAddNewRule: () => void;
  onTestRuleInSimulator: (rule: AutoReplyRule) => void;
  onApplyPreset: (presetIndex: number) => void;
}

export const RulesList: React.FC<RulesListProps> = ({
  rules,
  onToggleRule,
  onEditRule,
  onDeleteRule,
  onAddNewRule,
  onTestRuleInSimulator,
  onApplyPreset,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);

  const filteredRules = rules.filter((r) => {
    const matchesSearch =
      r.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.replyMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'active') return matchesSearch && r.isActive;
    if (filterType === 'inactive') return matchesSearch && !r.isActive;
    return matchesSearch;
  });

  const getMatchTypeLabel = (type: MatchType) => {
    switch (type) {
      case 'contains':
        return { label: 'Mengandung', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'exact':
        return { label: 'Sama Persis', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'starts_with':
        return { label: 'Diawali Kata', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: 'Mengandung', color: 'bg-zinc-100 text-zinc-700 border-zinc-200' };
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">
              Daftar Aturan Balas Otomatis
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {rules.length} Aturan
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Pesan masuk di WhatsApp yang cocok dengan kata kunci ini akan dibalas otomatis sesuai jeda detik.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Preset Templates Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <button
              onClick={() => setShowPresetDropdown(!showPresetDropdown)}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 text-zinc-700 text-xs sm:text-sm font-semibold rounded-xl transition"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Contoh Template</span>
            </button>

            {showPresetDropdown && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-zinc-200 py-2 z-30 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-zinc-100 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Pilih Template Siap Pakai:
                </div>
                {TEMPLATE_PRESETS.map((preset, idx) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      onApplyPreset(idx);
                      setShowPresetDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 active:bg-emerald-100 transition group"
                  >
                    <div className="text-xs font-bold text-zinc-800 group-hover:text-emerald-700">
                      {preset.name}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add New Rule Button */}
          <button
            onClick={onAddNewRule}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kata</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kata kunci atau balasan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-500">Filter:</span>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs font-semibold bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Status ({rules.length})</option>
            <option value="active">Hanya yang Aktif</option>
            <option value="inactive">Hanya yang Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Rules Cards Grid */}
      {filteredRules.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-zinc-300 p-8 sm:p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-800">Tidak ada aturan yang ditemukan</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `Tidak ada aturan yang cocok dengan kata "${searchQuery}". Coba kata kunci lain.`
              : 'Belum ada aturan balasan otomatis. Buat aturan baru sekarang untuk mulai membalas chat WA otomatis!'}
          </p>
          <button
            onClick={onAddNewRule}
            className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Aturan Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredRules.map((rule) => {
            const matchInfo = getMatchTypeLabel(rule.matchType);
            return (
              <div
                key={rule.id}
                className={`bg-white rounded-2xl border transition-all p-4 sm:p-5 shadow-xs flex flex-col justify-between ${
                  rule.isActive
                    ? 'border-zinc-200 hover:border-emerald-300 hover:shadow-md'
                    : 'border-zinc-200 bg-zinc-50/70 opacity-75'
                }`}
              >
                <div>
                  {/* Card Header: Keyword, Match Type, Delay Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <span className="text-sm font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-lg border border-zinc-200 flex items-center space-x-1 truncate max-w-[200px] sm:max-w-none">
                          <Tag className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">"{rule.keyword}"</span>
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border shrink-0 ${matchInfo.color}`}
                        >
                          {matchInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Delay Badge */}
                    <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg text-xs font-bold shrink-0">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      <span>{rule.delaySeconds} dtk</span>
                    </div>
                  </div>

                  {/* Reply Message Preview */}
                  <div className="bg-zinc-50 rounded-xl p-2.5 sm:p-3 border border-zinc-200/80 mb-3">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Balasan Otomatis:
                    </span>
                    <p className="text-xs text-zinc-700 font-medium whitespace-pre-wrap leading-relaxed line-clamp-3">
                      {rule.replyMessage}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Status Switch, Test in Simulator, Edit, Delete */}
                <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between gap-2">
                  {/* Switch Toggle */}
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center cursor-pointer space-x-2">
                      <input
                        type="checkbox"
                        checked={rule.isActive}
                        onChange={() => onToggleRule(rule.id)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600 relative"></div>
                      <span className={`text-[11px] font-semibold ${rule.isActive ? 'text-emerald-700' : 'text-zinc-400'}`}>
                        {rule.isActive ? 'Aktif' : 'Mati'}
                      </span>
                    </label>

                    {rule.replyCount > 0 && (
                      <span className="text-[10px] text-zinc-400 hidden sm:inline">
                        • {rule.replyCount}x
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onTestRuleInSimulator(rule)}
                      className="flex items-center space-x-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg transition border border-emerald-200"
                      title="Uji langsung aturan ini di Simulasi HP"
                    >
                      <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                      <span>Uji</span>
                    </button>

                    <button
                      onClick={() => onEditRule(rule)}
                      className="p-1.5 text-zinc-500 hover:text-zinc-800 active:bg-zinc-200 hover:bg-zinc-100 rounded-lg transition"
                      title="Edit Aturan"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteRule(rule.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-600 active:bg-red-100 hover:bg-red-50 rounded-lg transition"
                      title="Hapus Aturan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
