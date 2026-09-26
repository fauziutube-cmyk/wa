export type MatchType = 'contains' | 'exact' | 'startsWith' | 'regex';

export interface AutoReplyRule {
  id: string;
  keyword: string;
  response: string;
  matchType: MatchType;
  caseSensitive: boolean;
  enabled: boolean;
  notes?: string;
  triggerCount?: number;
  lastTriggered?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  matchedRuleId?: string;
  matchedKeyword?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  sender: string;
  incomingText: string;
  replyText: string;
  matchedKeyword: string;
  status: 'sent' | 'skipped' | 'no_match';
}
