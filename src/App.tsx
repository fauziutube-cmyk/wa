import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { RulesList } from './components/RulesList';
import { RuleModal } from './components/RuleModal';
import { WhatsAppSimulator } from './components/WhatsAppSimulator';
import { ReplyLogs } from './components/ReplyLogs';
import { AndroidSetupGuide } from './components/AndroidSetupGuide';
import { ExportImportModal } from './components/ExportImportModal';
import { AutoReplyRule, AutoReplyLog } from './types/autoreply';
import { DEFAULT_RULES, TEMPLATE_PRESETS } from './data/presets';

const STORAGE_KEY_RULES = 'autoreply_wa_rules';
const STORAGE_KEY_LOGS = 'autoreply_wa_logs';
const STORAGE_KEY_GLOBAL = 'autoreply_wa_global';

export default function App() {
  const [activeTab, setActiveTab] = useState<'rules' | 'simulator' | 'logs' | 'guide'>('rules');
  const [globalEnabled, setGlobalEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_GLOBAL);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [rules, setRules] = useState<AutoReplyRule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RULES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load rules from localStorage', e);
    }
    return DEFAULT_RULES;
  });

  const [logs, setLogs] = useState<AutoReplyLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load logs from localStorage', e);
    }
    return [];
  });

  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoReplyRule | null>(null);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [presetTestMessage, setPresetTestMessage] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GLOBAL, JSON.stringify(globalEnabled));
  }, [globalEnabled]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleToggleGlobal = () => {
    setGlobalEnabled((prev) => {
      const next = !prev;
      showToast(next ? 'Sistem Auto-Reply diaktifkan' : 'Sistem Auto-Reply dimatikan');
      return next;
    });
  };

  const handleToggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const handleSaveRule = (
    ruleData: Omit<AutoReplyRule, 'id' | 'createdAt' | 'replyCount'>,
    id?: string
  ) => {
    if (id) {
      // Edit existing
      setRules((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                ...ruleData,
              }
            : r
        )
      );
      showToast(`Aturan "${ruleData.keyword}" berhasil diperbarui!`);
    } else {
      // Create new
      const newRule: AutoReplyRule = {
        id: `rule-${Date.now()}`,
        ...ruleData,
        replyCount: 0,
        createdAt: Date.now(),
      };
      setRules((prev) => [newRule, ...prev]);
      showToast(`Aturan baru "${ruleData.keyword}" (${ruleData.delaySeconds}s) berhasil ditambahkan!`);
    }
    setEditingRule(null);
  };

  const handleDeleteRule = (id: string) => {
    const target = rules.find((r) => r.id === id);
    setRules((prev) => prev.filter((r) => r.id !== id));
    showToast(`Aturan "${target?.keyword || ''}" telah dihapus.`);
  };

  const handleOpenAddModal = () => {
    setEditingRule(null);
    setIsRuleModalOpen(true);
  };

  const handleOpenEditModal = (rule: AutoReplyRule) => {
    setEditingRule(rule);
    setIsRuleModalOpen(true);
  };

  const handleTestRuleInSimulator = (rule: AutoReplyRule) => {
    setPresetTestMessage(rule.keyword);
    setActiveTab('simulator');
    showToast(`Membuka simulasi untuk kata kunci "${rule.keyword}"...`);
  };

  const handleApplyPreset = (presetIndex: number) => {
    const preset = TEMPLATE_PRESETS[presetIndex];
    if (!preset) return;

    const newRules: AutoReplyRule[] = preset.rules.map((r, idx) => ({
      id: `rule-${Date.now()}-${idx}`,
      ...r,
      replyCount: 0,
      createdAt: Date.now(),
    }));

    setRules((prev) => [...newRules, ...prev]);
    showToast(`Template "${preset.name}" (${newRules.length} aturan) berhasil ditambahkan!`);
  };

  const handleLogGenerated = (log: AutoReplyLog) => {
    setLogs((prev) => [log, ...prev].slice(0, 100)); // retain last 100 logs
  };

  const handleIncrementRuleCount = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, replyCount: (r.replyCount || 0) + 1 } : r))
    );
  };

  const handleClearLogs = () => {
    setLogs([]);
    showToast('Semua riwayat balasan telah dihapus.');
  };

  const handleImportRules = (importedRules: AutoReplyRule[]) => {
    setRules(importedRules);
    showToast(`Berhasil memulihkan ${importedRules.length} aturan!`);
  };

  const activeRulesCount = rules.filter((r) => r.isActive).length;

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col font-sans text-zinc-900 selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 text-white px-4 py-3 rounded-xl shadow-2xl text-xs sm:text-sm font-semibold border border-zinc-700 animate-in slide-in-from-bottom duration-200 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        rulesCount={rules.length}
        activeRulesCount={activeRulesCount}
        onAddNewRule={handleOpenAddModal}
        onOpenExportImport={() => setIsExportImportOpen(true)}
        globalEnabled={globalEnabled}
        onToggleGlobal={handleToggleGlobal}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 sm:pb-8">
        {activeTab === 'rules' && (
          <RulesList
            rules={rules}
            onToggleRule={handleToggleRule}
            onEditRule={handleOpenEditModal}
            onDeleteRule={handleDeleteRule}
            onAddNewRule={handleOpenAddModal}
            onTestRuleInSimulator={handleTestRuleInSimulator}
            onApplyPreset={handleApplyPreset}
          />
        )}

        {activeTab === 'simulator' && (
          <WhatsAppSimulator
            rules={rules}
            globalEnabled={globalEnabled}
            onLogGenerated={handleLogGenerated}
            onIncrementRuleCount={handleIncrementRuleCount}
            presetTestMessage={presetTestMessage}
            onClearPresetTestMessage={() => setPresetTestMessage('')}
          />
        )}

        {activeTab === 'logs' && (
          <ReplyLogs logs={logs} onClearLogs={handleClearLogs} />
        )}

        {activeTab === 'guide' && <AndroidSetupGuide />}
      </main>

      {/* Mobile Floating Action Button (FAB) to Add Rule quickly */}
      {activeTab === 'rules' && (
        <button
          onClick={handleOpenAddModal}
          className="sm:hidden fixed right-4 bottom-20 z-40 bg-emerald-600 active:bg-emerald-700 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95"
          title="Tambah Aturan Baru"
        >
          <span className="text-2xl font-bold leading-none mb-0.5">+</span>
        </button>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-2">
          <div>
            AutoReply WA • Pengelola Pesan Otomatis WhatsApp & Android Notification Service
          </div>
          <div className="flex items-center space-x-3">
            <span>Status: <strong className={globalEnabled ? 'text-emerald-700' : 'text-zinc-400'}>{globalEnabled ? 'Aktif' : 'Nonaktif'}</strong></span>
            <span>•</span>
            <span>{rules.length} Aturan Tersedia</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RuleModal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        onSave={handleSaveRule}
        editingRule={editingRule}
      />

      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        rules={rules}
        onImportRules={handleImportRules}
      />
    </div>
  );
}
