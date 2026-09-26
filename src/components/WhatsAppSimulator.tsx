import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Smartphone, 
  Clock, 
  RotateCcw, 
  CheckCheck, 
  Sparkles, 
  User, 
  Phone, 
  Video, 
  MoreVertical, 
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AutoReplyRule, SimulatedMessage, AutoReplyLog } from '../types/autoreply';
import { matchRule, formatReplyMessage } from '../utils/matcher';

interface WhatsAppSimulatorProps {
  rules: AutoReplyRule[];
  globalEnabled: boolean;
  onLogGenerated: (log: AutoReplyLog) => void;
  onIncrementRuleCount: (ruleId: string) => void;
  presetTestMessage?: string;
  onClearPresetTestMessage?: () => void;
}

export const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({
  rules,
  globalEnabled,
  onLogGenerated,
  onIncrementRuleCount,
  presetTestMessage,
  onClearPresetTestMessage,
}) => {
  const [messages, setMessages] = useState<SimulatedMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'customer',
      senderName: 'Pelanggan',
      text: 'Halo kak, apakah produknya masih ready?',
      timestamp: '09:41',
    },
    {
      id: 'msg-init-2',
      sender: 'bot',
      senderName: 'AutoReply WA',
      text: 'Halo kak! 👋 Terima kasih sudah menghubungi kami. Ada yang bisa kami bantu hari ini?',
      timestamp: '09:41',
      delayApplied: 3,
    },
  ]);

  const [inputCustomerText, setInputCustomerText] = useState('');
  const [customerName, setCustomerName] = useState('Rian Pratama');
  const [isWaitingDelay, setIsWaitingDelay] = useState(false);
  const [remainingDelay, setRemainingDelay] = useState(0);
  const [activePendingRule, setActivePendingRule] = useState<AutoReplyRule | null>(null);
  const [showNotificationToast, setShowNotificationToast] = useState<string | null>(null);
  const [showControlsAccordion, setShowControlsAccordion] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const replyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isWaitingDelay]);

  useEffect(() => {
    if (presetTestMessage) {
      setInputCustomerText(presetTestMessage);
      if (onClearPresetTestMessage) {
        onClearPresetTestMessage();
      }
    }
  }, [presetTestMessage]);

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
    };
  }, []);

  const handleSendMessage = () => {
    const textToSend = inputCustomerText.trim();
    if (!textToSend) return;

    const currentTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newCustomerMsg: SimulatedMessage = {
      id: 'msg-' + Date.now(),
      sender: 'customer',
      senderName: customerName,
      text: textToSend,
      timestamp: currentTime,
    };

    setMessages((prev) => [...prev, newCustomerMsg]);
    setInputCustomerText('');

    setShowNotificationToast(`Pesan baru dari ${customerName}: "${textToSend}"`);
    setTimeout(() => {
      setShowNotificationToast(null);
    }, 4000);

    if (!globalEnabled) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: 'msg-sys-' + Date.now(),
            sender: 'system',
            senderName: 'Sistem',
            text: '⚠️ [Sistem Auto-Reply sedang Nonaktif. Pesan tidak dibalas otomatis.]',
            timestamp: currentTime,
          },
        ]);
      }, 500);
      return;
    }

    const matchResult = matchRule(textToSend, rules);

    if (matchResult) {
      const { rule } = matchResult;
      const delay = rule.delaySeconds;
      setActivePendingRule(rule);

      if (delay > 0) {
        setIsWaitingDelay(true);
        setRemainingDelay(delay);

        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = setInterval(() => {
          setRemainingDelay((prev) => {
            if (prev <= 1) {
              if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
        replyTimeoutRef.current = setTimeout(() => {
          sendAutoReply(rule, textToSend, delay);
        }, delay * 1000);
      } else {
        sendAutoReply(rule, textToSend, 0);
      }
    } else {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: 'msg-sys-' + Date.now(),
            sender: 'system',
            senderName: 'Sistem',
            text: `ℹ️ Tidak ada kata kunci yang cocok dengan "${textToSend}". Tambahkan di menu Aturan jika ingin dibalas otomatis.`,
            timestamp: currentTime,
          },
        ]);
      }, 600);
    }
  };

  const sendAutoReply = (rule: AutoReplyRule, incomingText: string, delayApplied: number) => {
    setIsWaitingDelay(false);
    setActivePendingRule(null);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    const currentTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const formattedReply = formatReplyMessage(rule.replyMessage, customerName);

    const newBotMsg: SimulatedMessage = {
      id: 'msg-' + Date.now(),
      sender: 'bot',
      senderName: 'AutoReply WA',
      text: formattedReply,
      timestamp: currentTime,
      delayApplied,
      ruleMatched: rule.keyword,
    };

    setMessages((prev) => [...prev, newBotMsg]);
    onIncrementRuleCount(rule.id);

    onLogGenerated({
      id: 'log-' + Date.now(),
      timestamp: currentTime,
      senderName: customerName,
      incomingText,
      matchedRuleKeyword: rule.keyword,
      replyText: formattedReply,
      delaySeconds: delayApplied,
      status: 'sent',
    });
  };

  const handleResetChat = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
    setIsWaitingDelay(false);
    setActivePendingRule(null);
    setMessages([
      {
        id: 'msg-reset',
        sender: 'system',
        senderName: 'Sistem',
        text: 'Percakapan direset. Ketik pesan pengirim di kolom bawah.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
      {/* Simulator Controls & Quick Prompts (Collapsible on mobile) */}
      <div className="lg:col-span-5 space-y-3 sm:space-y-4">
        {/* Mobile Accordion Toggle */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
          <div 
            onClick={() => setShowControlsAccordion(!showControlsAccordion)}
            className="p-3.5 sm:p-5 flex items-center justify-between cursor-pointer lg:cursor-default"
          >
            <div className="flex items-center space-x-2 text-zinc-900">
              <Smartphone className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h3 className="text-sm sm:text-base font-bold">Pengaturan Uji Coba Simulasi</h3>
                <p className="text-[11px] text-zinc-500 lg:block hidden">
                  Pilih kata kunci uji coba & nama pengirim
                </p>
              </div>
            </div>
            <button className="lg:hidden text-zinc-500 p-1">
              {showControlsAccordion ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          <div className={`p-3.5 sm:p-5 pt-0 sm:pt-0 border-t border-zinc-100 lg:block ${showControlsAccordion ? 'block' : 'hidden lg:block'}`}>
            {/* Quick Prompts to Test */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Coba Kata Kunci:</span>
                </span>
                <span className="text-[10px] text-zinc-400">Klik langsung</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {rules.slice(0, 6).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setInputCustomerText(r.keyword)}
                    className="px-2.5 py-1 text-xs bg-zinc-100 hover:bg-emerald-50 active:bg-emerald-100 hover:text-emerald-800 text-zinc-700 rounded-lg border border-zinc-200 transition font-medium"
                  >
                    "{r.keyword}" <span className="text-[10px] text-zinc-400">({r.delaySeconds}s)</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Profile Config */}
            <div className="mt-3 pt-3 border-t border-zinc-100 space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Nama Kontak Pengirim:</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nama pengirim"
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            {/* Reset Chat Button */}
            <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between">
              <button
                onClick={handleResetChat}
                className="flex items-center space-x-1 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Chat</span>
              </button>

              <div className="flex items-center space-x-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 font-medium">
                <ShieldCheck className="w-3 h-3" />
                <span>Auto-Reply Simulator</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Smartphone Mockup (Adaptive for Mobile & Desktop) */}
      <div className="lg:col-span-7 flex justify-center w-full">
        <div className="w-full max-w-md bg-zinc-900 rounded-[28px] sm:rounded-[40px] p-2 sm:p-3 shadow-xl border-2 sm:border-4 border-zinc-800">
          
          {/* Phone Screen Container */}
          <div className="w-full h-[520px] sm:h-[600px] bg-[#EFEAE2] rounded-[22px] sm:rounded-[32px] overflow-hidden flex flex-col relative border border-zinc-800">
            
            {/* Android Top Status Bar */}
            <div className="bg-[#075E54] text-white px-4 py-1.5 flex items-center justify-between text-[11px] font-semibold select-none">
              <span>09:41</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px]">4G</span>
                <span>📶</span>
                <span>🔋 88%</span>
              </div>
            </div>

            {/* Android Notification Shade Toast Simulation */}
            {showNotificationToast && (
              <div className="absolute top-7 left-2 right-2 z-30 bg-zinc-900/95 text-white p-2.5 rounded-xl shadow-xl border border-zinc-700 backdrop-blur-xs animate-in slide-in-from-top duration-200">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold shrink-0">
                    WA
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-zinc-200 flex items-center justify-between">
                      <span>WhatsApp • Baru saja</span>
                    </div>
                    <p className="text-[11px] text-zinc-300 truncate">
                      {showNotificationToast}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp App Bar */}
            <div className="bg-[#075E54] text-white px-3 sm:px-4 py-2 flex items-center justify-between shadow-md z-10">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-zinc-300 border border-white/20 flex items-center justify-center font-bold text-zinc-700 text-xs overflow-hidden">
                  <span>{customerName.charAt(0)}</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight truncate max-w-[150px] sm:max-w-none">{customerName}</h4>
                  <p className="text-[10px] text-emerald-100 leading-tight">
                    {isWaitingDelay ? (
                      <span className="text-emerald-200 animate-pulse font-medium">
                        sedang mengetik...
                      </span>
                    ) : (
                      'online'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 text-white">
                <Video className="w-4 h-4 opacity-80" />
                <Phone className="w-4 h-4 opacity-80" />
                <MoreVertical className="w-4 h-4 opacity-80" />
              </div>
            </div>

            {/* Live Delay Countdown Indicator Banner */}
            {isWaitingDelay && (
              <div className="bg-amber-500 text-white px-3 py-1.5 text-xs font-bold flex items-center justify-between shadow-xs z-20 animate-in fade-in">
                <div className="flex items-center space-x-1.5 truncate">
                  <Clock className="w-3.5 h-3.5 animate-spin shrink-0" />
                  <span className="truncate">Jeda Waktu Aktif: Membalas dlm</span>
                </div>
                <div className="bg-white text-amber-600 px-2 py-0.5 rounded-full text-xs font-extrabold tracking-wider shrink-0 ml-1">
                  {remainingDelay}s
                </div>
              </div>
            )}

            {/* Chat Body (WhatsApp Wallpaper Texture) */}
            <div 
              className="flex-1 p-2.5 sm:p-3 overflow-y-auto space-y-2"
              style={{
                backgroundImage: `radial-gradient(#d4cbbe 1px, transparent 1px)`,
                backgroundSize: '16px 16px',
              }}
            >
              <div className="text-center my-1">
                <span className="bg-[#E1D9CD] text-zinc-600 text-[10px] px-2 py-0.5 rounded-md shadow-xs font-medium">
                  HARI INI
                </span>
              </div>

              {messages.map((msg) => {
                if (msg.sender === 'system') {
                  return (
                    <div key={msg.id} className="text-center my-1.5">
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] sm:text-[11px] px-2.5 py-1 rounded-xl shadow-xs inline-block max-w-[95%] leading-relaxed font-medium">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                const isCustomer = msg.sender === 'customer';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs shadow-xs relative leading-relaxed ${
                        isCustomer
                          ? 'bg-white text-zinc-800 rounded-tl-xs'
                          : 'bg-[#D9FDD3] text-zinc-900 rounded-tr-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      
                      <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] text-zinc-400">
                        <span>{msg.timestamp}</span>
                        {!isCustomer && (
                          <CheckCheck className="w-3 h-3 text-blue-500 inline" />
                        )}
                      </div>
                    </div>

                    {!isCustomer && msg.delayApplied !== undefined && (
                      <span className="text-[9px] text-zinc-500 mt-0.5 px-1 font-medium">
                        ⏱️ Jeda: {msg.delayApplied}s • Kata: "{msg.ruleMatched}"
                      </span>
                    )}
                  </div>
                );
              })}

              {isWaitingDelay && (
                <div className="flex items-end space-x-1 my-1">
                  <div className="bg-[#D9FDD3] text-zinc-600 rounded-xl px-3 py-1.5 text-xs shadow-xs flex items-center space-x-1.5">
                    <span className="text-[11px] font-medium text-emerald-800">Mengetik balasan</span>
                    <span className="flex space-x-1">
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></span>
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="bg-[#F0F2F5] p-2 flex items-center space-x-1.5 border-t border-zinc-200">
              <input
                type="text"
                value={inputCustomerText}
                onChange={(e) => setInputCustomerText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ketik pesan pelanggan di sini..."
                className="flex-1 bg-white text-xs text-zinc-800 px-3 py-2 rounded-full border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputCustomerText.trim()}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#00A884] hover:bg-[#008f6f] active:bg-[#00745b] text-white flex items-center justify-center shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            {/* Android Navigation Bar */}
            <div className="bg-[#F0F2F5] pb-1.5 pt-0.5 flex justify-center items-center">
              <div className="w-20 h-1 bg-zinc-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
