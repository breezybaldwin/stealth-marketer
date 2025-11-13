// Message types
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: ActionType;
}

export interface ActionType {
  type: string;
  params?: Record<string, any>;
}

// Profile types
export interface PersonalUserProfile {
  name?: string;
  profession?: string;
  industry?: string;
  expertise?: string[];
  goals?: string;
  target_audience?: string;
  voice?: string;
  preferences?: string;
  brand_values?: string;
}

export interface CompanyUserProfile {
  name?: string;
  profession?: string;
  company?: string;
  industry?: string;
  voice?: string;
  goals?: string;
  preferences?: string;
  expertise?: string[];
  target_audience?: string;
  brand_values?: string;
}

export interface BusinessProfile {
  products?: string[];
  services?: string[];
  unique_value_prop?: string;
}

export interface UserProfile {
  personal?: {
    user: PersonalUserProfile;
    business: BusinessProfile;
  };
  company?: {
    user: CompanyUserProfile;
    business: BusinessProfile;
  };
}

// Conversation types
export interface Conversation {
  id: string;
  title: string;
  contextType: 'personal' | 'company';
  updatedAt: Date;
  messageCount: number;
}

// Context types
export type ContextType = 'personal' | 'company';

// Component prop types
export interface SidebarProps {
  currentConversationId: string | null;
  onConversationSelect: (conversationId: string | null) => void;
  onNewConversation: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  contextType: ContextType;
  onContextChange: (context: ContextType) => void;
  onShowProfileManager: () => void;
  onLogout: () => void;
  userEmail?: string;
}

export interface MessageBubbleProps {
  message: Message;
  onExecuteAction: (action: ActionType) => void;
  loading: boolean;
}

export interface ProfileManagerProps {
  onBack?: () => void;
}
