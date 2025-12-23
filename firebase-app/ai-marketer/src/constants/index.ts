// App constants
export const APP_NAME = 'AI CMO';
export const APP_EMOJI = '🤖';

// Context types
export const CONTEXT_TYPES = {
  COMPANY: 'company' as const,
  PERSONAL: 'personal' as const,
} as const;

// Context labels
export const CONTEXT_LABELS = {
  [CONTEXT_TYPES.COMPANY]: '🏢 Company Marketing',
  [CONTEXT_TYPES.PERSONAL]: '👤 Personal Branding',
} as const;

// Agent types
export const AGENT_TYPES = {
  CMO: 'cmo' as const,
  CONTENT: 'content' as const,
  GROWTH: 'growth' as const,
  DEVELOPER: 'developer' as const,
} as const;

// Agent labels and details
export const AGENT_INFO = {
  [AGENT_TYPES.CMO]: {
    name: 'AI CMO',
    emoji: '👔',
    description: 'Strategic marketing leadership',
    color: 'from-blue-500 to-purple-600',
  },
  [AGENT_TYPES.CONTENT]: {
    name: 'Content Marketer',
    emoji: '✍️',
    description: 'Content strategy & creation',
    color: 'from-green-500 to-teal-600',
  },
  [AGENT_TYPES.GROWTH]: {
    name: 'Growth Hacker',
    emoji: '📈',
    description: 'Growth & experimentation',
    color: 'from-orange-500 to-red-600',
  },
  [AGENT_TYPES.DEVELOPER]: {
    name: 'Web Developer',
    emoji: '💻',
    description: 'Technical implementation',
    color: 'from-purple-500 to-pink-600',
  },
} as const;

// Message roles
export const MESSAGE_ROLES = {
  USER: 'user' as const,
  ASSISTANT: 'assistant' as const,
} as const;

// Firebase collections
export const COLLECTIONS = {
  USERS: 'users',
  CONVERSATIONS: 'conversations',
  ACTIONS: 'actions',
} as const;

// UI constants
export const SIDEBAR_WIDTH = {
  EXPANDED: 'w-64',
  COLLAPSED: 'w-12',
} as const;

// Default values
export const DEFAULTS = {
  CONTEXT_TYPE: CONTEXT_TYPES.COMPANY,
  AGENT_TYPE: AGENT_TYPES.CMO,
  CONVERSATION_TITLE_MAX_LENGTH: 50,
  SIDEBAR_COLLAPSED: false,
} as const;
