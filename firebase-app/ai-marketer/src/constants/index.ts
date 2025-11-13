// App constants
export const APP_NAME = 'AI Marketing Assistant';
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
  CONVERSATION_TITLE_MAX_LENGTH: 50,
  SIDEBAR_COLLAPSED: false,
} as const;
