'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MessageBubbleProps } from '@/types';

export default function MessageBubble({ message, onExecuteAction, loading }: MessageBubbleProps) {
  const [actionExecuted, setActionExecuted] = useState(false);

  const handleExecuteAction = () => {
    if (message.action && !actionExecuted && !loading) {
      setActionExecuted(true);
      onExecuteAction(message.action);
    }
  };

  const handleSkipAction = () => {
    setActionExecuted(true);
  };

  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      <div className="flex items-start space-x-2 sm:space-x-3 max-w-4xl w-full">
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        )}
        
        <div className={`flex-1 ${isUser ? 'flex justify-end' : ''} min-w-0`}>
          <div className={`${
            isUser 
              ? 'bg-zinc-700 text-white rounded-2xl px-3 sm:px-4 py-2 sm:py-3 max-w-xs sm:max-w-sm lg:max-w-md break-words' 
              : 'text-zinc-100 w-full min-w-0'
          }`}>
            {isUser ? (
              <div className="whitespace-pre-wrap text-sm break-words">
                {message.content}
              </div>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none break-words
                prose-headings:text-white prose-headings:font-semibold
                prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                prose-p:text-zinc-100 prose-p:leading-relaxed prose-p:my-2 prose-p:break-words
                prose-strong:text-white prose-strong:font-semibold
                prose-em:text-zinc-200
                prose-code:text-blue-300 prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:break-all
                prose-pre:bg-zinc-800 prose-pre:border prose-pre:border-zinc-700 prose-pre:rounded-lg prose-pre:overflow-x-auto
                prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300 prose-a:break-words
                prose-ul:text-zinc-100 prose-ul:my-2
                prose-ol:text-zinc-100 prose-ol:my-2
                prose-li:text-zinc-100 prose-li:my-1 prose-li:break-words
                prose-blockquote:border-l-blue-500 prose-blockquote:text-zinc-300
                prose-hr:border-zinc-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
            
            {/* Action buttons for assistant messages with actions */}
            {!isUser && message.action && !actionExecuted && (
              <div className="mt-4 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                <div className="text-xs text-zinc-400 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Proposed action: {message.action.type}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleExecuteAction}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 text-white text-sm px-4 py-2 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                  >
                    ✅ Execute Action
                  </button>
                  <button
                    onClick={handleSkipAction}
                    disabled={loading}
                    className="flex-1 bg-zinc-600 hover:bg-zinc-700 disabled:bg-zinc-500 text-white text-sm px-4 py-2 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                  >
                    ❌ Skip
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 bg-zinc-600 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
