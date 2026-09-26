export type MatchType = 'contains' | 'exact' | 'starts_with' | 'regex';

export interface AutoReplyRule {
  id: string;
  keyword: string; // kata kunci pemicu
  matchType: MatchType; // jenis kecocokan
  replyMessage: string; // pesan yang akan dibalas
  delaySeconds: number; // waktu tunggu (detik) sebelum membalas
  isActive: boolean; // status aktif/nonaktif
  replyCount: number; // berapa kali aturan ini telah terpicu
  createdAt: number;
  caseSensitive?: boolean;
}

export interface SimulatedMessage {
  id: string;
  sender: 'customer' | 'bot' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  delayApplied?: number;
  ruleMatched?: string;
}

export interface AutoReplyLog {
  id: string;
  timestamp: string;
  senderName: string;
  incomingText: string;
  matchedRuleKeyword: string;
  replyText: string;
  delaySeconds: number;
  status: 'sent' | 'waiting' | 'failed';
}

export interface RulePreset {
  name: string;
  description: string;
  rules: Omit<AutoReplyRule, 'id' | 'createdAt' | 'replyCount'>[];
}
