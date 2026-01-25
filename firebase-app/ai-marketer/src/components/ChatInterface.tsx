'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { httpsCallable } from 'firebase/functions';
import { functions, db } from '@/lib/firebase';
import MessageBubble from './MessageBubble';
import ProfileManager from './ProfileManager';
import Sidebar from './Sidebar';
import { Message, ActionType, ContextType, AgentType } from '@/types';
import { DEFAULTS, COLLECTIONS, AGENT_INFO } from '@/constants';

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextType, setContextType] = useState<ContextType>(DEFAULTS.CONTEXT_TYPE);
  const [agentType, setAgentType] = useState<AgentType>(DEFAULTS.AGENT_TYPE);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(DEFAULTS.SIDEBAR_COLLAPSED);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-collapse sidebar on mobile
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { user, logout } = useAuth();

  const chatWithAI = functions ? httpsCallable(functions, 'chatWithAI') : null;
  const executeAction = functions ? httpsCallable(functions, 'executeAction') : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea on input change
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputMessage]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading || !chatWithAI) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const sentMessage = inputMessage;
    setInputMessage('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setLoading(true);

    try {
      const result = await chatWithAI({
        message: sentMessage,
        conversationId,
        contextType,
        agentType
      });

      const data = result.data as any;
      
      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId);
      }

      const aiMessage: Message = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
        action: data.action
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error?.message || 'Unknown error'}. Please try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = async (action: ActionType) => {
    if (!executeAction) return;
    
    try {
      setLoading(true);
      const result = await executeAction({
        actionType: action.type,
        params: action.params
      });

      const data = result.data as any;
      
      if (data.success) {
        const resultMessage: Message = {
          role: 'assistant',
          content: `✅ Action completed successfully: ${data.result}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, resultMessage]);
      } else {
        const errorMessage: Message = {
          role: 'assistant',
          content: `❌ Action failed: ${data.error}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error executing action:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: '❌ Failed to execute action. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleContextSwitch = (newContext: ContextType) => {
    setContextType(newContext);
    setMessages([]);
    setConversationId(null);
  };

  const handleAgentChange = (newAgent: AgentType) => {
    setAgentType(newAgent);
    setMessages([]);
    setConversationId(null);
  };

  const handleNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setInputMessage('');
  };

  const handleConversationSelect = async (selectedConversationId: string | null) => {
    if (!selectedConversationId || !db) {
      handleNewConversation();
      return;
    }

    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const conversationDoc = await getDoc(doc(db, COLLECTIONS.CONVERSATIONS, selectedConversationId));
      
      if (conversationDoc.exists()) {
        const data = conversationDoc.data();
        const conversationMessages = data.messages || [];
        
        setMessages(conversationMessages.map((msg: any) => {
          // Handle both Timestamp objects and ISO strings
          let timestamp = new Date();
          if (msg.timestamp) {
            if (typeof msg.timestamp === 'string') {
              timestamp = new Date(msg.timestamp);
            } else if (msg.timestamp.toDate) {
              timestamp = msg.timestamp.toDate();
            }
          }
          
          return {
            role: msg.role,
            content: msg.content,
            timestamp,
            action: msg.action
          };
        }));
        
        setConversationId(selectedConversationId);
        setContextType(data.contextType || 'company');
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      handleNewConversation();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    // Optionally, you can auto-send the message
    // setTimeout(() => handleSendMessage(), 100);
  };

  if (showProfileManager) {
    return (
      <div className="flex h-screen bg-zinc-900 relative">
        {/* Mobile overlay when sidebar is open */}
        {isMobile && !sidebarCollapsed && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}
        
        <Sidebar
          currentConversationId={conversationId}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
          contextType={contextType}
          onContextChange={handleContextSwitch}
          agentType={agentType}
          onAgentChange={handleAgentChange}
          onShowProfileManager={() => setShowProfileManager(true)}
          onLogout={logout}
          userEmail={user?.email || undefined}
          isMobile={isMobile}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <ProfileManager onBack={() => setShowProfileManager(false)} />
        </div>
      </div>
    );
  }

  
  return (
    <div className="flex h-screen bg-zinc-900 relative">
      {/* Mobile overlay when sidebar is open */}
      {isMobile && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
      
      <Sidebar
        currentConversationId={conversationId}
        onConversationSelect={handleConversationSelect}
        onNewConversation={handleNewConversation}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        contextType={contextType}
        onContextChange={handleContextSwitch}
        agentType={agentType}
        onAgentChange={handleAgentChange}
        onShowProfileManager={() => setShowProfileManager(true)}
        onLogout={logout}
        userEmail={user?.email || undefined}
        isMobile={isMobile}
      />
      <div className="flex-1 flex flex-col min-w-0">
      {/* Mobile Header */}
      {isMobile && sidebarCollapsed && (
        <div className="bg-zinc-900 border-b border-zinc-700 p-3 flex items-center justify-between md:hidden">
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="text-zinc-400 hover:text-white transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="text-center">
            <h1 className="text-sm font-semibold text-white">{AGENT_INFO[agentType].emoji} {AGENT_INFO[agentType].name}</h1>
            <p className="text-xs text-zinc-400">
              {contextType === 'company' ? '🏢 Company Marketing' : '👤 Personal Branding'}
            </p>
          </div>
          <button
            onClick={handleNewConversation}
            className="text-zinc-400 hover:text-white transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
          {messages.length === 0 && (
            <div className="text-center text-zinc-400 mt-16">
              <div className="mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Welcome to your {AGENT_INFO[agentType].name}
                </h2>
                <p className="text-lg text-zinc-300 mb-4">
                  Currently in <span className="font-semibold text-white">
                    {contextType === 'company' ? '🏢 Company Marketing' : '👤 Personal Branding'}
                  </span> mode
                </p>
                <p className="text-zinc-400 max-w-2xl mx-auto">
                  I'm here to help you with marketing strategies, content ideas, campaign planning, and growing your business or personal brand. What would you like to work on today?
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <button 
                  onClick={() => handleSuggestionClick(contextType === 'company' 
                    ? "Help me develop a content strategy for my company. What types of content should I create and how often should I publish?"
                    : "Help me develop a personal branding content strategy. What should I share to build my thought leadership?"
                  )}
                  className="bg-zinc-800 hover:bg-zinc-750 rounded-lg p-4 border border-zinc-700 hover:border-zinc-600 transition-all duration-200 text-left cursor-pointer transform hover:scale-105"
                >
                  <h3 className="text-white font-medium mb-2">💡 Content Strategy</h3>
                  <p className="text-zinc-400 text-sm">Get ideas for blog posts, social media content, and thought leadership pieces</p>
                </button>
                <button 
                  onClick={() => handleSuggestionClick(contextType === 'company'
                    ? "I want to plan a marketing campaign. Can you help me outline the key components and timeline?"
                    : "Help me plan a personal branding campaign to increase my visibility in my industry."
                  )}
                  className="bg-zinc-800 hover:bg-zinc-750 rounded-lg p-4 border border-zinc-700 hover:border-zinc-600 transition-all duration-200 text-left cursor-pointer transform hover:scale-105"
                >
                  <h3 className="text-white font-medium mb-2">📊 Campaign Planning</h3>
                  <p className="text-zinc-400 text-sm">Plan marketing campaigns, set goals, and define success metrics</p>
                </button>
                <button 
                  onClick={() => handleSuggestionClick(contextType === 'company'
                    ? "Help me analyze my target audience. What questions should I answer to create detailed buyer personas?"
                    : "Help me understand who my target audience should be for my personal brand and how to reach them."
                  )}
                  className="bg-zinc-800 hover:bg-zinc-750 rounded-lg p-4 border border-zinc-700 hover:border-zinc-600 transition-all duration-200 text-left cursor-pointer transform hover:scale-105"
                >
                  <h3 className="text-white font-medium mb-2">🎯 Audience Analysis</h3>
                  <p className="text-zinc-400 text-sm">Understand your target audience and create buyer personas</p>
                </button>
                <button 
                  onClick={() => handleSuggestionClick(contextType === 'company'
                    ? "What are some effective growth strategies I can implement to scale my business?"
                    : "What strategies can I use to grow my personal brand and expand my professional network?"
                  )}
                  className="bg-zinc-800 hover:bg-zinc-750 rounded-lg p-4 border border-zinc-700 hover:border-zinc-600 transition-all duration-200 text-left cursor-pointer transform hover:scale-105"
                >
                  <h3 className="text-white font-medium mb-2">🚀 Growth Strategies</h3>
                  <p className="text-zinc-400 text-sm">Develop strategies to grow your business or personal brand</p>
                </button>
              </div>
            </div>
          )}
          
          <div className="space-y-6">
            {messages.map((message, index) => (
              <MessageBubble
                key={index}
                message={message}
                onExecuteAction={handleExecuteAction}
                loading={loading}
              />
            ))}
          </div>
          
          {loading && (
            <div className="flex justify-start mt-6">
              <div className="bg-zinc-800 rounded-2xl px-6 py-4 border border-zinc-700">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-zinc-300">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-zinc-900 px-2 sm:px-4 py-3 sm:py-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-center bg-zinc-800 rounded-[28px] border border-zinc-700 shadow-lg py-1">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${AGENT_INFO[agentType].name}...`}
              className="flex-1 resize-none bg-transparent px-4 sm:px-6 py-2.5 sm:py-3 text-white placeholder-zinc-400 focus:outline-none disabled:opacity-50 text-sm sm:text-base leading-6 overflow-y-auto"
              rows={1}
              disabled={loading}
              style={{
                minHeight: '44px',
                maxHeight: '200px'
              }}
            />
            <div className="flex items-center pr-2 sm:pr-3">
              <button
                onClick={handleSendMessage}
                disabled={loading || !inputMessage.trim()}
                className="bg-white hover:bg-zinc-100 disabled:bg-zinc-600 disabled:cursor-not-allowed text-zinc-900 disabled:text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-200 shadow-sm flex items-center justify-center flex-shrink-0"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center mt-2 sm:mt-3">
            <p className="text-xs text-zinc-500 px-2 text-center">
              {AGENT_INFO[agentType].name} can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
