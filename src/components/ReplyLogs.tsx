import React, { useState } from 'react';
import { 
  History, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  Search, 
  MessageSquare,
  Tag
} from 'lucide-react';
import { AutoReplyLog } from '../types/autoreply';

interface ReplyLogsProps {
  logs: AutoReplyLog[];
  onClearLogs: () => void;
}

export const ReplyLogs: React.FC<ReplyLogsProps> = ({ logs, onClearLogs }) => {
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(
    (l) =>
      l.senderName.toLowerCase().includes(search.toLowerCase()) ||
      l.incomingText.toLowerCase().includes(search.toLowerCase()) ||
      l.matchedRuleKeyword.toLowerCase().includes(search.toLowerCase()) ||
      l.replyText.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-3.5 sm:p-6 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 flex items-center space-x-1.5">
              <History className="w-5 h-5 text-emerald-600" />
              <span>Riwayat Aktivitas Balas</span>
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-bold">
              {logs.length}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Daftar pesan WA yang masuk dan dibalas otomatis beserta jedanya.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari di riwayat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-auto pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 active:bg-red-100 bg-red-50 rounded-xl transition border border-red-200 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hapus Semua</span>
              <span className="sm:hidden">Hapus</span>
            </button>
          )}
        </div>
      </div>

      {/* Logs View: Cards for Mobile, Table for Desktop */}
      {filteredLogs.length === 0 ? (
        <div className="p-8 sm:p-12 text-center text-zinc-500">
          <History className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
          <p className="text-xs font-medium">Belum ada riwayat pesan yang dibalas otomatis.</p>
          <p className="text-[11px] text-zinc-400 mt-1">
            Buka tab <strong>Simulasi</strong> dan coba kirim pesan untuk mengujinya.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card List (Visible only on small screens) */}
          <div className="sm:hidden divide-y divide-zinc-100 p-2 space-y-2">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-zinc-900">{log.senderName}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">({log.timestamp})</span>
                  </div>
                  <span className="flex items-center space-x-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>{log.delaySeconds}s delay</span>
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <div className="bg-white p-2 rounded-lg border border-zinc-200 text-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-400 block">Pesan Masuk:</span>
                    "{log.incomingText}"
                  </div>

                  <div className="bg-emerald-50/80 p-2 rounded-lg border border-emerald-200 text-emerald-950">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-bold text-emerald-800">Balasan Terkirim:</span>
                      <span className="text-[10px] text-emerald-700 font-medium">
                        Cocok: <code className="font-bold font-mono">{log.matchedRuleKeyword}</code>
                      </span>
                    </div>
                    {log.replyText}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (Hidden on small screens) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-200">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Pengirim</th>
                  <th className="py-3 px-4">Pesan Masuk</th>
                  <th className="py-3 px-4">Kata Kunci</th>
                  <th className="py-3 px-4">Jeda Waktu</th>
                  <th className="py-3 px-4">Balasan Otomatis</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/80 transition">
                    <td className="py-3 px-4 text-zinc-500 whitespace-nowrap font-mono">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-800 whitespace-nowrap">
                      {log.senderName}
                    </td>
                    <td className="py-3 px-4 text-zinc-700 max-w-xs truncate" title={log.incomingText}>
                      "{log.incomingText}"
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px]">
                        {log.matchedRuleKeyword}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="flex items-center space-x-1 text-zinc-600 font-medium">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        <span>{log.delaySeconds} detik</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-600 max-w-xs truncate" title={log.replyText}>
                      {log.replyText}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Terkirim</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
