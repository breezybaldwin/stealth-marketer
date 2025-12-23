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
  // Enhanced personal branding fields
  biography?: string;
  tagline?: string;
  cover_letter?: string; // Generic cover letter for professional narrative
  personality_traits?: string[];
  core_values?: string[];
  job_history_text?: string; // Rich text field for resume paste
  education_text?: string; // Rich text field (one per line)
  certifications_text?: string; // Rich text field (one per line)
  achievements_text?: string; // Rich text field (one per line)
  speaking_topics_text?: string; // Rich text field (one per line)
  publications_text?: string; // Rich text field (one per line)
  social_links?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
    github?: string;
    medium?: string;
  };
  content_themes?: string[];
  writing_style?: string;
  unique_perspective?: string;
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

// Agent types
export type AgentType = 'cmo' | 'content' | 'growth' | 'developer';

// Component prop types
export interface SidebarProps {
  currentConversationId: string | null;
  onConversationSelect: (conversationId: string | null) => void;
  onNewConversation: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  contextType: ContextType;
  onContextChange: (context: ContextType) => void;
  agentType: AgentType;
  onAgentChange: (agent: AgentType) => void;
  onShowProfileManager: () => void;
  onLogout: () => void;
  userEmail?: string;
  isMobile?: boolean;
}

export interface MessageBubbleProps {
  message: Message;
  onExecuteAction: (action: ActionType) => void;
  loading: boolean;
}

export interface ProfileManagerProps {
  onBack?: () => void;
}
