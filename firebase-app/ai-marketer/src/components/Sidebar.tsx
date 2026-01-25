'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { Conversation, SidebarProps, ContextType, AgentType } from '@/types';
import { COLLECTIONS, CONTEXT_LABELS, DEFAULTS, AGENT_INFO, AGENT_TYPES } from '@/constants';

export default function Sidebar({ 
  currentConversationId, 
  onConversationSelect, 
  onNewConversation,
  isCollapsed,
  onToggleCollapse,
  contextType,
  onContextChange,
  agentType,
  onAgentChange,
  onShowProfileManager,
  onLogout,
  userEmail,
  isMobile = false
}: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !db) {
      return;
    }

    const conversationsRef = collection(db, COLLECTIONS.CONVERSATIONS);
    const q = query(
      conversationsRef,
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversationData: Conversation[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const messages = data.messages || [];
        const firstMessage = messages[0]?.content || 'New conversation';
        
        // Handle both Timestamp objects and ISO strings
        let updatedAt = new Date();
        if (data.updatedAt) {
          if (typeof data.updatedAt === 'string') {
            updatedAt = new Date(data.updatedAt);
          } else if (data.updatedAt.toDate) {
            updatedAt = data.updatedAt.toDate();
          }
        }
        
        conversationData.push({
          id: doc.id,
          title: firstMessage.length > DEFAULTS.CONVERSATION_TITLE_MAX_LENGTH 
            ? firstMessage.substring(0, DEFAULTS.CONVERSATION_TITLE_MAX_LENGTH) + '...' 
            : firstMessage,
          contextType: data.contextType || DEFAULTS.CONTEXT_TYPE,
          updatedAt,
          messageCount: messages.length
        });
      });
      // Sort by updatedAt in JavaScript
      conversationData.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      setConversations(conversationData);
      setLoading(false);
    }, (error) => {
      console.error('Firestore error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!db) return;
    
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, COLLECTIONS.CONVERSATIONS, conversationId));
      if (currentConversationId === conversationId) {
        onConversationSelect(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation. Please try again.');
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return 'Today';
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isCollapsed) {
    return (
      <div className={`${isMobile ? 'hidden' : 'w-12'} bg-zinc-900 border-r border-zinc-700 flex flex-col`}>
        {/* Toggle button */}
        <div className="p-3 border-b border-zinc-700">
          <button
            onClick={onToggleCollapse}
            className="w-6 h-6 text-zinc-400 hover:text-white transition-colors duration-200"
            title="Expand sidebar"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* New chat button */}
        <div className="p-3">
          <button
            onClick={onNewConversation}
            className="w-6 h-6 text-zinc-400 hover:text-white transition-colors duration-200"
            title="New chat"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1"></div>
        
        {/* Bottom navigation */}
        <div className="border-t border-zinc-700">
          {/* Context switcher */}
          <div className="p-3">
            <button
              onClick={() => onContextChange(contextType === 'company' ? 'personal' : 'company')}
              className="w-6 h-6 text-zinc-400 hover:text-white transition-colors duration-200"
              title={contextType === 'company' ? 'Switch to Personal' : 'Switch to Company'}
            >
              {contextType === 'company' ? (
                <span className="text-sm">🏢</span>
              ) : (
                <span className="text-sm">👤</span>
              )}
            </button>
          </div>
          
          {/* Settings */}
          <div className="p-3">
            <button
              onClick={onShowProfileManager}
              className="w-6 h-6 text-zinc-400 hover:text-white transition-colors duration-200"
              title="Settings"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          
          {/* Logout */}
          <div className="p-3">
            <button
              onClick={onLogout}
              className="w-6 h-6 text-zinc-400 hover:text-red-400 transition-colors duration-200"
              title="Sign out"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'fixed inset-y-0 left-0 z-50 w-64' : 'w-64'} bg-zinc-900 border-r border-zinc-700 flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-zinc-700">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onToggleCollapse}
            className="text-zinc-400 hover:text-white transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="text-center">
            <h1 className="text-sm font-semibold text-white">🤖 AI CMO</h1>
          </div>
          <div className="w-5"></div> {/* Spacer for centering */}
        </div>
        
        {/* Context Switcher */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-zinc-400 mb-2">Focus:</label>
          <select
            value={contextType}
            onChange={(e) => onContextChange(e.target.value as ContextType)}
            className="w-full text-sm bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
          >
            <option value="company">{CONTEXT_LABELS.company}</option>
            <option value="personal">{CONTEXT_LABELS.personal}</option>
          </select>
        </div>

        {/* Agent Selector */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-zinc-400 mb-2">Team Member:</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(AGENT_INFO).map(([key, info]) => (
              <button
                key={key}
                onClick={() => onAgentChange(key as AgentType)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 ${
                  agentType === key
                    ? `border-zinc-400 bg-gradient-to-br ${info.color} bg-opacity-20`
                    : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                }`}
                title={info.description}
              >
                <span className="text-2xl mb-1">{info.emoji}</span>
                <span className="text-xs text-white font-medium text-center leading-tight">{info.name.split(' ')[info.name.split(' ').length - 1]}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg transition-colors duration-200 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm">New Chat</span>
        </button>

        <div className="text-xs font-medium text-zinc-400">Chat History</div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-zinc-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-zinc-400 text-sm">
            No conversations yet
            <div className="text-xs mt-2 text-zinc-500">
              {user ? `Logged in as: ${user.uid.substring(0, 8)}...` : 'Not logged in'}
            </div>
          </div>
        ) : (
          <div className="p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onConversationSelect(conversation.id)}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-200 mb-1 ${
                  currentConversationId === conversation.id
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs">
                      {conversation.contextType === 'company' ? '🏢' : '👤'}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {formatDate(conversation.updatedAt)}
                    </span>
                  </div>
                  <p className="text-sm truncate font-medium">
                    {conversation.title}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {conversation.messageCount} messages
                  </p>
                </div>
                
                <button
                  onClick={(e) => handleDeleteConversation(conversation.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all duration-200 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="w-8 h-8 bg-zinc-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-white truncate">
                {userEmail?.split('@')[0] || 'User'}
              </div>
              <div className="text-xs text-zinc-400 truncate">
                {userEmail || 'user@example.com'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={onShowProfileManager}
            className="flex-1 flex items-center justify-center space-x-2 text-zinc-300 hover:text-white hover:bg-zinc-800 px-3 py-2 rounded-lg transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs">Settings</span>
          </button>
          
          <button
            onClick={onLogout}
            className="flex-1 flex items-center justify-center space-x-2 text-zinc-300 hover:text-red-400 hover:bg-zinc-800 px-3 py-2 rounded-lg transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-xs">Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
