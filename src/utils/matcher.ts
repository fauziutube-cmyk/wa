import { AutoReplyRule } from '../types/autoreply';

export function matchRule(
  text: string,
  rules: AutoReplyRule[]
): { rule: AutoReplyRule; matchedText: string } | null {
  const activeRules = rules.filter((r) => r.isActive);
  const normalizedInput = text.trim();

  for (const rule of activeRules) {
    const keyword = rule.keyword.trim();
    if (!keyword) continue;

    const source = rule.caseSensitive ? normalizedInput : normalizedInput.toLowerCase();
    const target = rule.caseSensitive ? keyword : keyword.toLowerCase();

    switch (rule.matchType) {
      case 'exact':
        if (source === target) {
          return { rule, matchedText: keyword };
        }
        break;

      case 'contains':
        if (source.includes(target)) {
          return { rule, matchedText: keyword };
        }
        break;

      case 'starts_with':
        if (source.startsWith(target)) {
          return { rule, matchedText: keyword };
        }
        break;

      case 'regex':
        try {
          const regex = new RegExp(keyword, rule.caseSensitive ? 'g' : 'gi');
          if (regex.test(normalizedInput)) {
            return { rule, matchedText: keyword };
          }
        } catch {
          // invalid regex, ignore
        }
        break;

      default:
        if (source.includes(target)) {
          return { rule, matchedText: keyword };
        }
    }
  }

  return null;
}

export function formatReplyMessage(template: string, senderName: string): string {
  const now = new Date();
  const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const tanggal = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return template
    .replace(/{nama}/gi, senderName || 'Kak')
    .replace(/{jam}/gi, `${jam} WIB`)
    .replace(/{tanggal}/gi, tanggal);
}
